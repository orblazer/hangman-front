import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supportSSR } from '@/utils/ssr-support'
import Layout from '../components/layout'
import Seo from '../components/seo'
import { GameProvider } from '@/utils/game-context'
import FormGameLogin, { FormGameLoginRef } from '@/components/game/login'
import { GameChannel, GameChannelData } from '@/lib/game'
import InfoMessage from '@/components/info-message'
import { useWebSocket } from '@/utils/websocket-context'
import { WSClientListeners } from '@/lib/WSClient'

const GamePage: React.FC = () => {
  // Retrieve url data
  const gameData = useMemo(
    () =>
      supportSSR(
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
      ),
    []
  )

  const { t } = useTranslation('game')
  const [needPassword, setNeedPassword] = useState(false)
  const formLogin = useRef<FormGameLoginRef | null>(null)

  // Bind websocket
  const webSocket = useWebSocket()
  const [status, setStatus] = useState<'connecting' | 'connected' | 'login' | 'notFound'>(
    'connecting'
  )
  const connectHandler = useCallback(() => {
    if (gameData.data !== null && gameData.id === gameData.data.id) {
      webSocket?.send(GameChannel.connect, gameData.data)
    } else {
      webSocket?.send(GameChannel.find, gameData.id)
    }
  }, [gameData.data, gameData.id, webSocket])
  const messageHandler = useCallback<WSClientListeners['message']>(
    (channel, sender, data) => {
      if (sender !== webSocket?.id) {
        return
      }

      // Handle login game channels
      if (channel === GameChannel.find) {
        const findData = data as GameChannelData['find']
        if (findData) {
          if (findData.mode === 'solo') {
            webSocket?.send(GameChannel.connect, {
              id: gameData.id
            })
          } else {
            setStatus('login')
            setNeedPassword(findData.hasPassword)
          }
        } else {
          setStatus('notFound')
        }
      } else if (channel === GameChannel.connect) {
        const connectData = data as GameChannelData['connect']
        if (!connectData) {
          setStatus('notFound')
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
          webSocket?.send(GameChannel.join(gameData.id || ''))
        }
      }
    },
    [gameData.id, webSocket]
  )

  useEffect(() => {
    if(webSocket?.readyState === 'open') {
      connectHandler()
    }

    webSocket?.on('connect', connectHandler).on('message', messageHandler)

    return () => {
      webSocket?.removeListener('connect', connectHandler).removeListener('message', messageHandler)
      setStatus('connecting')
    }
  }, [connectHandler, messageHandler, webSocket])

  return (
    <Layout>
      <Seo title="" />

      {gameData.id ? (
        <GameProvider gameId={gameData.id}>
          {status === 'login' ? (
            <FormGameLogin cref={formLogin} needPassword={needPassword} />
          ) : (
            <InfoMessage
              error={status === 'notFound'}
              dangerouslySetInnerHTML={{ __html: t(`infoMessages.status.${status}`, { id: '&nbsp;' + gameData.id }) }}
            />
          )}
        </GameProvider>
      ) : (
        <InfoMessage error dangerouslySetInnerHTML={{ __html: t(`infoMessages.status.notFound`, { id: '' }) }} />
      )}
    </Layout>
  )
}
export default GamePage
