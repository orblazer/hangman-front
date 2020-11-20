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
  const [needPassword, setNeedPassword] = useState(false)
  const formLogin = useRef<FormGameLoginRef | null>(null)

  function handleInit(ws: WSClient) {
    ws.on('connect', () => {
      if (data !== null && gameId === data.id) {
        ws.send(GameChannel.connect, data)
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
              setNeedPassword(findData.hasPassword)
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
            setStatus('failed')
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
            setStatus('connected')
            formLogin.current = null
            ws.send(GameChannel.join(gameId || ''))
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
        >
          {status === 'login' ? (
            <FormGameLogin cref={formLogin} needPassword={needPassword} />
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
