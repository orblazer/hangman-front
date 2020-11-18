import React, { useRef, useState } from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/core'
import { supportSSR } from '@/utils/ssr-support'
import Layout from '../components/layout'
import Seo from '../components/seo'
import { GameProvider } from '@/utils/game-context'
import useSiteMetadata from '@/hooks/use-site-metadata'
import colors from '@/styles/colors'
import { useTranslation } from 'react-i18next'
import WSClient from '@/lib/WSClient'
import FormGameLogin, { FormGameLoginRef } from '@/components/game/login'
import { GameChannel, GameChannelData } from '@/lib/game'

const InfoMessage = styled.div(
  ({ error }: { error?: boolean }) => css`
    display: flex;
    height: 100%;
    justify-content: center;
    align-items: center;
    text-align: center;
    color: ${error ? colors.danger : 'current'};
    font-size: 1.2rem;
  `
)

const HomePage: React.FC = () => {
  const gameId = supportSSR(() => new URLSearchParams(location.search).get('g'), null)
  const { serverUrl } = useSiteMetadata()
  const { t } = useTranslation('game')
  const [status, setStatus] = useState<'connecting' | 'connected' | 'login' | 'closed' | 'failed' | 'notFound'>(
    typeof serverUrl === 'undefined' ? 'failed' : 'connecting'
  )
  const [mode, setMode] = useState<'solo' | 'multiplayer' | 'multiplayerWithPass'>('solo')
  const formLogin = useRef<FormGameLoginRef | null>(null)
  const [username, setUsername] = useState<string | null>(null)

  function handleInit(ws: WSClient) {
    ws.on('connect', () => {
      ws.send(GameChannel.find, gameId)
    })
      .on('error', () => {
        setStatus('failed')
      })
      .on('close', () => {
        setStatus('closed')
      })
      .on('message', (channel, sender, data) => {
        // Handle pre join game
        if (channel === GameChannel.find) {
          if (sender !== ws.id) {
            return
          }

          const findData = data as GameChannelData['find']
          if (findData) {
            if (findData.mode === 'solo') {
              ws.send(GameChannel.connect, {
                id: gameId
              })
            } else {
              setStatus('login')
              setMode(
                findData.mode === 'multiplayer'
                  ? findData.hasPassword
                    ? 'multiplayerWithPass'
                    : 'multiplayer'
                  : 'solo'
              )
            }
          } else {
            setStatus('notFound')
          }
        } else if (channel === GameChannel.connect) {
          if (sender !== ws.id) {
            return
          }
          const connectData = data as GameChannelData['connect']
          if (!connectData) {
            return
          }

          // Check if all field is valid
          let valid = true
          for (const [field, fieldValid] of Object.entries(connectData)) {
            if (!fieldValid) {
              formLogin.current?.setError(field)
              valid = false
            }
          }

          if (valid) {
            if (mode === 'solo') {
              setStatus('connected')
            } else {
              const username = formLogin.current?.getUsername() || null
              if (username !== null) {
                setUsername(username)
                setStatus('connected')
                ws.send(GameChannel.join(gameId || ''))
                formLogin.current = null
              } else {
                setStatus('failed')
                ws.send(GameChannel.failConnect)
              }
            }
          }
        }
        // Not supported channel
        else {
          console.log(channel, sender, data)
        }
      })
  }

  return (
    <Layout>
      <Seo title="" />

      {gameId ? (
        <GameProvider
          gameId={gameId}
          server={{
            url: serverUrl || '',
            autoConnect: true,
            onInit: handleInit
          }}
          username={username}
          mode={mode === 'multiplayerWithPass' ? 'multiplayer' : mode}
        >
          {status === 'login' ? (
            <FormGameLogin cref={formLogin} needPassword={mode === 'multiplayerWithPass'} />
          ) : (
            <InfoMessage
              error={status === 'failed' || status === 'notFound'}
              dangerouslySetInnerHTML={{ __html: t(`infoMessages.status.${status}`, { id: '&nbsp;' + gameId }) }}
            />
          )}
        </GameProvider>
      ) : (
        <InfoMessage error dangerouslySetInnerHTML={{ __html: t(`infoMessages.status.notFound`, { id: '' }) }} />
      )}
    </Layout>
  )
}
export default HomePage
