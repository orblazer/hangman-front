import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from '@emotion/styled'
import { css } from '@emotion/core'
import { useWebSocket } from '@/utils/websocket-context'
import { spaces, colors } from '@/styles'
import { WebsocketReadyState, WSClientListeners } from '@/lib/WSClient'

type WSReadyStatus = 'connecting' | 'connected' | 'failed'
function getReadyStatus(readyStatus?: WebsocketReadyState): WSReadyStatus {
  if (readyStatus === 'open') {
    return 'connected'
  } else if (readyStatus === 'closed') {
    return 'failed'
  }
  return 'connecting'
}

const StatusMessage = styled.div(
  ({ status }: { status: WSReadyStatus }) => css`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: ${spaces[2]} 2vw;
    text-align: center;
    background-color: ${status === 'connected' ? colors.success : status === 'failed' ? colors.danger : colors.info};
  `
)

const WSStatus: React.FC = () => {
  const { t } = useTranslation()
  const webSocket = useWebSocket()
  const [status, setStatus] = useState<WSReadyStatus>(getReadyStatus(webSocket?.readyState))
  const [showMessage, setShowMessage] = useState(status !== 'failed')

  const connectingHandler = useCallback(() => {
    setShowMessage(true)
    setStatus('connecting')
  }, [])
  const connectedHandler = useCallback(() => {
    setShowMessage(true)
    setStatus('connected')
    setTimeout(() => {
      setShowMessage(false)
    }, 3000)
  }, [])
  const failedHandler = useCallback<WSClientListeners['close']>((_reason, code) => {
    if (code === 1013) {
      setShowMessage(true)
      setStatus('failed')
    }
  }, [])

  useEffect(() => {
    webSocket?.on('connecting', connectingHandler).on('connect', connectedHandler).on('close', failedHandler)

    return () => {
      webSocket
        ?.removeListener('connecting', connectingHandler)
        .removeListener('connect', connectedHandler)
        .removeListener('close', failedHandler)
    }
  }, [connectedHandler, connectingHandler, failedHandler, webSocket])

  if (showMessage) {
    return <StatusMessage status={status}>{t(`webSocket.${status}`)}</StatusMessage>
  } else {
    return null
  }
}
export default WSStatus
