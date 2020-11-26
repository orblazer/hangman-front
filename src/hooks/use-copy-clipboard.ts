import { supportSSR } from '@/utils/ssr-support'
import { useCallback, useEffect, useState } from 'react'

export default function useCopyClipboard(resetInterval?: number): [boolean, (data: string) => Promise<void>] {
  const [isCopied, setCopied] = useState(false)

  const handleCopy = useCallback(
    (data: string) => {
      if (!isCopied) {
        return supportSSR(
          () => (data: string) => navigator.clipboard.writeText(data),
          () => Promise.resolve()
        )(data).then(() => setCopied(true))
      } else {
        return Promise.resolve()
      }
    },
    [isCopied]
  )

  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (isCopied && resetInterval) {
      timeout = setTimeout(() => setCopied(false), resetInterval)
    }
    return () => clearTimeout(timeout)
  }, [isCopied, resetInterval])

  return [isCopied, handleCopy]
}
