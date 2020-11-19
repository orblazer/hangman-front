import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Layout from '@/components/layout'
import Seo from '@/components/seo'
import useSiteMetadata from '@/hooks/use-site-metadata'
import WSClient from '@/lib/WSClient'
import InfoMessage from '@/components/info-message'
import FormCreateGame from '@/components/game/create-game'
import { GameChannel, GameChannelData } from '@/lib/game'
import { usePageContext } from '@/utils/page-context'

const CreateGamePage: React.FC = () => {
  const { t } = useTranslation('form-create-game')
  const { serverUrl } = useSiteMetadata()
  const { lang } = usePageContext()
  const webSocket = useMemo(() => new WSClient(serverUrl || ''), [serverUrl])
  const [status, setStatus] = useState<'connecting' | 'connected' | 'failed'>(
    typeof serverUrl === 'undefined' ? 'failed' : 'connecting'
  )

  // Bind websocket messages
  useEffect(() => {
    webSocket
      .on('connect', () => {
        setStatus('connected')
      })
      .on('error', () => {
        setStatus('failed')
      })
      .on('close', () => {
        setStatus('failed')
      })
      .on('message', (channel, sender, data) => {
        if (channel === GameChannel.create) {
          const gameData = data as GameChannelData['create']
          location.href = `/${lang}/game?g=${gameData.id}&d=${btoa(JSON.stringify(gameData))}`
        }
      })
      .connect()

    return () => {
      webSocket.removeAllListeners()
      webSocket.close()
      setStatus('connecting')
    }
  }, [webSocket, lang])

  return (
    <Layout space="4">
      <Seo title="" />

      {status === 'connected' ? (
        <FormCreateGame webSocket={webSocket} />
      ) : (
        <InfoMessage error={status === 'failed'} dangerouslySetInnerHTML={{ __html: t(`infoMessages.${status}`) }} />
      )}
    </Layout>
  )
}
export default CreateGamePage
