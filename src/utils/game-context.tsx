import React from 'react'

export interface GameContext {
  id: string | null
}

const RGameContext = React.createContext<GameContext>({
  id: null
})

export function useGameContext(): GameContext {
  return React.useContext(RGameContext)
}

export const GameProvider: React.FC<{
  gameId: string
}> = ({ gameId, children }) => {
  return (
    <RGameContext.Provider
      value={{
        id: gameId
      }}
    >
      {children}
    </RGameContext.Provider>
  )
}
