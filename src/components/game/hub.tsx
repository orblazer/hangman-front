import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { enUS, fr } from 'date-fns/locale'
import styled from '@emotion/styled'
import { usePageContext } from '@/utils/page-context'
import { useGameContext } from '@/utils/game-context'
import StatusMessage from '../styled/status-message'
import Button from '../styled/button'
import useCopyClipboard from '@/hooks/use-copy-clipboard'
import { Input } from '../form/form-field'
import Grid from '../styled/grid'
import spaces from '@/styles/spaces'
import PlayerList from './player-list'
import { formatDuration } from '@/utils/date'
import { PlayerEntry } from '@/lib/game'
import Chat from './chat'

const Grouped = styled.div`
  display: flex;

  & > ${Input} {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
`

const resetCopyInterval = 3000
const GameHub: React.FC = () => {
  const { t } = useTranslation('game')
  const { lang } = usePageContext()
  const [passwordCopied, copyPassword] = useCopyClipboard(resetCopyInterval)
  const [linkCopied, copyLink] = useCopyClipboard(resetCopyInterval)

  const { id, options, players, isOwner } = useGameContext()
  const gameUrl = useMemo(() => `${location.origin}/game?g=${id}`, [id])
  const interval = useMemo(
    () =>
      formatDuration((options?.roundInterval || 0) * 1000, {
        locale: lang === 'en' ? enUS : fr
      }),
    [options?.roundInterval, lang]
  )

  function handleKickPlayer(player: PlayerEntry) {
    // TODO: Kick the player
  }

  return (
    <Grid templateColumns="2fr 1fr">
      <div css={{ marginRight: spaces[4], height: '50vh' }}>
        {options?.mode === 'multiplayer' && options.chat && <Chat />}
      </div>
      <div>
        <h2>{t('info.title')}</h2>
        {options && (
          <>
            <strong>{t('info.mode.title')}</strong>: {t(`info.mode.${options.mode}`)}
            <br />
            <strong>{t('info.twitchIntegrated.title')}</strong>:{' '}
            <StatusMessage status={options.twitchIntegration ? 'success' : 'info'}>
              {t(`info.twitchIntegrated.${options.twitchIntegration ? 'yes' : 'no'}`, {
                channel: options.twitchChannel
              })}
            </StatusMessage>
            <br />
            <strong>{t('info.round', { count: options.round || 0 })}</strong>: {options.round}
            <br />
            <strong>{t('info.roundInterval')}</strong>: {interval}
            <br />
            <strong>{t('info.difficulties.title')}</strong>:{' '}
            {options.difficulties.map((difficulty) => t(`info.difficulties.${difficulty}`)).join(', ')}
            <br />
            {options.mode === 'multiplayer' && (
              <>
                <strong>{t('info.players')}</strong>:{' '}
                {players.length === options.maxPlayers ? (
                  <StatusMessage status="danger">
                    {players.length}/{options.maxPlayers}
                  </StatusMessage>
                ) : (
                  `${players.length}/${options.maxPlayers}`
                )}
                <br />
                <strong>{t('info.password.title')}</strong>:{' '}
                {options.password !== '' && typeof options.password === 'string' ? (
                  <Button type="button" onClick={() => copyPassword(options.password || '')}>
                    {t(`${passwordCopied ? 'copied' : 'copy'}`, { ns: 'translation' })}
                  </Button>
                ) : (
                  t('info.password.none')
                )}
                <br />
                <strong>{t('info.chat.title')}</strong>:{' '}
                <StatusMessage status={options.chat ? 'success' : 'info'}>
                  {t(`info.chat.${options.chat ? 'yes' : 'no'}`, { channel: options.twitchChannel })}
                </StatusMessage>
                <br />
                <strong>{t('info.link')}</strong>:
                <Grouped>
                  <Input value={gameUrl} readOnly />
                  <Button type="button" onClick={() => copyLink(gameUrl)}>
                    {t(`${linkCopied ? 'copied' : 'copy'}`, { ns: 'translation' })}
                  </Button>
                </Grouped>
                <h2 css={{ marginTop: spaces[8] }}>{t('playerList.title')}</h2>
                <PlayerList players={players} canKick={isOwner} onKick={handleKickPlayer} />
              </>
            )}
          </>
        )}
      </div>
    </Grid>
  )
}
export default GameHub
