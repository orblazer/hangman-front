export interface PlayerEntry {
  id: string
  username: string
  owner: boolean
}

export type GameMode = 'solo' | 'multiplayer'
export type Difficulty = 'easy' | 'normal' | 'hard' | 'hardcore'
export interface BaseGameOptions {
  mode: GameMode
  twitchIntegration: boolean
  twitchChannel: string
  round: number
  roundInterval: number
  difficulties: Difficulty[]
}
export interface SoloGameOptions {
  mode: 'solo'
}
export interface MultiplayerGameOptions {
  mode: 'multiplayer'
  maxPlayers: number
  password?: string
  chat: boolean
}
export type GameOptions = BaseGameOptions & (SoloGameOptions | MultiplayerGameOptions)

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
  info: (GameOptions & { players: PlayerEntry[] }) | false
}
export const GameChannel = Object.freeze({
  find: 'game/find',
  connect: 'game/connect',
  create: 'game/create',

  join: (id: string) => `game/${id}/join`,
  leave: (id: string) => `game/${id}/leave`,
  info: (id: string) => `game/${id}/info`,
  newOwner: (id: string) => `game/${id}/newOwner`
})
