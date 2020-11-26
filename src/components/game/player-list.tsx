import React from 'react'
import { css } from '@emotion/core'
import styled from '@emotion/styled'
import { noop } from 'lodash'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { colors, spaces } from '@/styles'
import { PlayerEntry } from '@/lib/game'

const StyledList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`
const PlayerItem = styled.li(
  ({ owner = false }: { owner?: boolean }) => css`
    & > span {
      font-weight: ${owner ? 'bold' : 'normal'};
      text-transform: capitalize;
      padding-left: ${spaces[1]};
    }
    & > ${KickButton} {
      padding-right: ${spaces[1]};
    }
  `
)
const KickButton = styled.button`
  color: ${colors.link.color};
  cursor: pointer;
  text-decoration: none;
  background: none;
  border: none;

  &:hover {
    color: ${colors.link.hoverColor};
  }
`

const PlayerList: React.FC<{
  canKick?: boolean
  players: ReadonlyArray<PlayerEntry>
  onKick?: (player: PlayerEntry) => void
}> = ({ canKick, players, onKick = noop }) => {
  const { t } = useTranslation('game')
  return (
    <StyledList>
      {players.map((player, index) => (
        <PlayerItem key={index} owner={player.owner}>
          {canKick && !player.owner && (
            <KickButton type="button" onClick={() => onKick(player)} title={t('playerList.kick')}>
              <FontAwesomeIcon icon="hammer" />
            </KickButton>
          )}
          {player.owner && (
            <FontAwesomeIcon
              icon="crown"
              color={colors.success}
              style={{ width: 'auto' }}
              title={t('playerList.owner')}
            />
          )}
          <span>{player.username}</span>
        </PlayerItem>
      ))}
    </StyledList>
  )
}
export default PlayerList
