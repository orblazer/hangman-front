import { useState, useEffect } from 'react'

export default function useRenderSide(): 'client' | 'server' {
  const [isClient, setClient] = useState(false)
  useEffect(() => setClient(true), [])

  return isClient ? 'client' : 'server'
}
