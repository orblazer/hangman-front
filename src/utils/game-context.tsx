import React, { useEffect, useMemo } from 'react'
import WSClient from '@/lib/WSClient'
import { noop } from 'lodash'

export interface GameContext {
  server: WSClient | null
  id: string | null
  mode: 'solo' | 'multiplayer'
  username: string | null
}

const RGameContext = React.createContext<GameContext>({
  server: null,
  id: null,
  mode: 'solo',
  username: null
})

export function useGameContext(): GameContext {
  return React.useContext(RGameContext)
}

export const GameProvider: React.FC<{
  server: { url: string; autoConnect?: boolean; onInit?: (ws: WSClient) => void }
  gameId: string
  mode: GameContext['mode']
  username?: string | null
}> = ({ server, gameId, mode, username = null, children }) => {
  const webSocket = useMemo(() => new WSClient(server.url), [server.url])

  // Connect web socket
  useEffect(() => {
    if (server.autoConnect) {
      webSocket.connect().catch(noop)
    }
    typeof server.onInit === 'function' && server.onInit(webSocket)

    return () => webSocket.close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webSocket])

  return (
    <RGameContext.Provider
      value={{
        server: webSocket,
        id: gameId,
        mode,
        username
      }}
    >
      {children}
    </RGameContext.Provider>
  )
}
