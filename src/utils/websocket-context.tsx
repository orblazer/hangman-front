/* eslint-disable @typescript-eslint/no-empty-function */
import WSClient, { WSClientOptions } from '@/lib/WSClient'
import React, { useMemo } from 'react'

const RWebSocketContext = React.createContext<WSClient | null>(null)

export function useWebSocket(): WSClient | null {
  return React.useContext(RWebSocketContext)
}

function isValidWSUrl(url: string) {
  let _url
  try {
    _url = new URL(url)
  } catch (_) {
    return false
  }

  return _url.protocol === 'ws:' || _url.protocol === 'wss:'
}

export const WebSocketProvider: React.FC<{
  url: string
  options?: Partial<WSClientOptions>
}> = ({ url, options, children }) => {
  if (!isValidWSUrl(url)) {
    throw new Error(`The url '${url}' is not an valid ws url`)
  }

  const webSocket = useMemo<WSClient>(() => new WSClient(url, options), [options, url])
  return <RWebSocketContext.Provider value={webSocket}>{children}</RWebSocketContext.Provider>
}
