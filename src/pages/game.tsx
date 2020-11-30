import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supportSSR } from '@/utils/ssr-support'
import Layout from '../components/layout'
import Seo from '../components/seo'
import { GameProvider } from '@/utils/game-context'
import FormGameLogin, { FormGameLoginRef } from '@/components/game/login'
import { GameChannel, GameChannelData, PlayerEntry } from '@/lib/game'
import InfoMessage from '@/components/info-message'
import { useWebSocket } from '@/utils/websocket-context'
import { WSClientListeners } from '@/lib/WSClient'
import GameHub from '@/components/game/hub'

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location.search]
  )

  const { t } = useTranslation('game')
  const [needPassword, setNeedPassword] = useState(false)
  const formLogin = useRef<FormGameLoginRef | null>(null)

  // Bind websocket
  const webSocket = useWebSocket()
  const [status, setStatus] = useState<'connecting' | 'connected' | 'login' | 'notFound' | 'kicked'>('connecting')
  const connectHandler = useCallback(() => {
    if (gameData.data !== null && gameData.id === gameData.data.id) {
      webSocket?.send(GameChannel.connect, gameData.data)
    } else {
      webSocket?.send(GameChannel.find, gameData.id)
    }
  }, [gameData.data, gameData.id, webSocket])
  const messageHandler = useCallback<WSClientListeners['message']>(
    (channel, sender, data) => {
      // Handle login game channels
      if (channel === GameChannel.find) {
        if (sender !== webSocket?.id) {
          return
        }

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
        if (sender !== webSocket?.id) {
          return
        }

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
          // Request game info
          webSocket.send(GameChannel.info(gameData.id || ''))

          // Store login in url
          if (formLogin.current !== null) {
            const searchParams = new URLSearchParams(location.search)
            searchParams.set(
              'd',
              btoa(
                JSON.stringify({
                  id: gameData.id,
                  username: formLogin.current.getUsername(),
                  password: formLogin.current.getPassword()
                })
              )
            )
            const newUrl = location.origin + location.pathname + '?' + searchParams.toString()
            history.pushState({ path: newUrl }, '', newUrl)

            formLogin.current = null
          }
        }
      }
      // Handle kick
      else if (channel === GameChannel.leave(gameData.id || '')) {
        const { id: playerId, isKick } = data as PlayerEntry & { isKick: boolean }
        if (playerId !== webSocket?.id || !isKick) {
          return
        }
        setStatus('kicked')
      }
    },
    [gameData.id, webSocket]
  )

  useEffect(() => {
    if (webSocket?.readyState === 'open') {
      connectHandler()
    }

    webSocket?.on('connect', connectHandler).on('message', messageHandler)

    return () => {
      webSocket?.removeListener('connect', connectHandler).removeListener('message', messageHandler)
    }
  }, [connectHandler, messageHandler, webSocket])

  return (
    <Layout>
      <Seo title="" />

      {gameData.id ? (
        <GameProvider gameId={gameData.id}>
          {status === 'connected' ? (
            <GameHub />
          ) : status === 'login' ? (
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
