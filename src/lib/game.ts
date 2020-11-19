import { GameContext } from '@/utils/game-context'

export interface GameChannelData {
  find:
    | {
        hasPassword: boolean
        mode: GameContext['mode']
      }
    | false
  connect:
    | {
        password: boolean
        username: boolean
      }
    | false
  join: string
  leave: string
  create: { id: string; mode: GameContext['mode']; username?: string }
}
export const GameChannel = Object.freeze({
  find: 'game/find',
  connect: 'game/connect',
  failConnect: 'game/fail-connect',
  create: 'game/create',

  join: (id: string) => `game/${id}/join`,
  leave: (id: string) => `game/${id}/leave`
})
