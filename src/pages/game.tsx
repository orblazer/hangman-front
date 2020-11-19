import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supportSSR } from '@/utils/ssr-support'
import Layout from '../components/layout'
import Seo from '../components/seo'
import { GameProvider } from '@/utils/game-context'
import useSiteMetadata from '@/hooks/use-site-metadata'
import WSClient from '@/lib/WSClient'
import FormGameLogin, { FormGameLoginRef } from '@/components/game/login'
import { GameChannel, GameChannelData } from '@/lib/game'
import InfoMessage from '@/components/info-message'

const HomePage: React.FC = () => {
  const { id: gameId, data } = supportSSR(
    () => {
      // Parse search params
      const searchData = new URLSearchParams(location.search)
      let data = null
      try {
        data = searchData.has('d') ? JSON.parse(atob(searchData.get('d') as string)) : null
      } catch (e) {}

      return {
        id: searchData.get('g'),
        data
      }
    },
    { id: null, data: null }
  )
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
      if (data !== null && gameId === data.id) {
        ws.send(GameChannel.connect, {
          id: gameId,
          ...(data.mode === 'multiplayer' ? { username: data.username, password: data.password } : {})
        })
      } else {
        ws.send(GameChannel.find, gameId)
      }
    })
      .on('error', () => {
        setStatus('failed')
      })
      .on('close', () => {
        setStatus('closed')
      })
      .on('message', (channel, sender, data) => {
        // Handle login game channels
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
              setMode(findData.hasPassword ? 'multiplayerWithPass' : 'multiplayer')
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
