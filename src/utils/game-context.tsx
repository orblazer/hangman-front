import React, { useCallback, useEffect, useState } from 'react'
import { WSClientListeners } from '@/lib/WSClient'
import { GameOptions, GameChannel, GameChannelData, PlayerEntry } from '@/lib/game'
import { useWebSocket } from './websocket-context'

export interface GameContext {
  id: string | null
  options: GameOptions | null
  players: ReadonlyArray<PlayerEntry>
  username?: string
  isOwner: boolean
}

const RGameContext = React.createContext<GameContext>({
  id: null,
  options: null,
  players: [],
  isOwner: false
})

export function useGameContext(): GameContext {
  return React.useContext(RGameContext)
}

export const GameProvider: React.FC<{
  gameId: string
}> = ({ gameId, children }) => {
  const webSocket = useWebSocket()
  const [options, setOptions] = useState<GameOptions | null>(null)
  const [players, setPlayers] = useState<PlayerEntry[]>([])
  const [username, setUsername] = useState<string>()
  const [isOwner, setOwner] = useState<boolean>(false)

  const messageHandler = useCallback<WSClientListeners['message']>(
    (channel, _sender, data) => {
      if (channel === GameChannel.info(gameId)) {
        const infoData = data as GameChannelData['info']
        if (infoData) {
          const { players, ...options } = infoData

          setOptions(options)
          setPlayers(players)

          const myPlayer = players.find((player) => player.id === webSocket?.id)
          if (myPlayer) {
            setUsername(myPlayer.username)
            setOwner(myPlayer.owner)
          }
        }
      } else if (channel === GameChannel.join(gameId)) {
        if (typeof players.find((player) => player.id === (data as PlayerEntry).id) === 'undefined') {
          setPlayers((players) => [...players, data as PlayerEntry])
        }
      } else if (channel === GameChannel.leave(gameId)) {
        setPlayers((players) => players.filter((player) => player.id !== (data as PlayerEntry).id))
      } else if (channel === GameChannel.newOwner(gameId)) {
        setOwner(data === webSocket?.id)

        setPlayers((players) =>
          players.map((player) => {
            if (player.id === data) {
              player.owner = true
            }
            return player
          })
        )
      }
    },
    [gameId, players, webSocket?.id]
  )

  // Connect web socket
  useEffect(() => {
    webSocket?.on('message', messageHandler)

    return () => {
      webSocket?.removeListener('message', messageHandler)
    }
  }, [messageHandler, webSocket])

  return (
    <RGameContext.Provider
      value={{
        id: gameId,
        options,
        players,
        username,
        isOwner
      }}
    >
      {children}
    </RGameContext.Provider>
  )
}
