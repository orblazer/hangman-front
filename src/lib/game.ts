export interface GameChannelData {
  find:
    | {
        hasPassword: boolean
        mode: 'solo' | 'multiplayer'
      }
    | false
  connect: {
    password: boolean
    username: boolean
  } | false
  join: string
  leave: string
}
export const GameChannel = Object.freeze({
  find: 'game/find',
  connect: 'game/connect',
  failConnect: 'game/fail-connect',

  join: (id: string) => `game/${id}/join`,
  leave: (id: string) => `game/${id}/leave`
})
