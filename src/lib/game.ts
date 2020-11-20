export type GameMode = 'solo' | 'multiplayer'
export interface GameChannelData {
  find:
    | {
        hasPassword: boolean
        mode: GameMode
      }
    | false
  connect:
    | {
        password: boolean
        username: boolean
      }
    | false
  create: { id: string; username?: string; password?: string }

  join: string
  leave: string
}
export const GameChannel = Object.freeze({
  find: 'game/find',
  connect: 'game/connect',
  create: 'game/create',

  join: (id: string) => `game/${id}/join`,
  leave: (id: string) => `game/${id}/leave`
})
