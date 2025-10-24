
import React, { createContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { GameState, GameAction, gameReducer, initialState } from '../hooks/useGameReducer';

interface GameContextProps {
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
  broadcastAction: (action: GameAction) => void;
}

export const GameContext = createContext<GameContextProps | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
  gameId: string;
}

const getStorageKey = (gameId: string) => `poker-game-${gameId}`;

export const GameProvider: React.FC<GameProviderProps> = ({ children, gameId }) => {
  const [gameState, dispatch] = useReducer(gameReducer, initialState, () => {
    try {
      const storedState = localStorage.getItem(getStorageKey(gameId));
      if (storedState) {
        return JSON.parse(storedState) as GameState;
      }
    } catch (error) {
      console.error("Failed to parse game state from localStorage", error);
    }
    return { ...initialState, gameId };
  });

  const broadcastAction = useCallback((action: GameAction) => {
    const newState = gameReducer(gameState, action);
    localStorage.setItem(getStorageKey(gameId), JSON.stringify(newState));
    dispatch(action);
  }, [gameState, gameId]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === getStorageKey(gameId) && event.newValue) {
        try {
          const newState = JSON.parse(event.newValue);
          dispatch({ type: 'SYNC_STATE', payload: newState });
        } catch (error) {
          console.error("Failed to sync state from storage change", error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [gameId]);

  return (
    <GameContext.Provider value={{ gameState, dispatch, broadcastAction }}>
      {children}
    </GameContext.Provider>
  );
};
