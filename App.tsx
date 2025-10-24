
import React, { useState, useEffect } from 'react';
import { GameProvider } from './contexts/GameContext';
import Lobby from './components/Lobby';
import GameTable from './components/GameTable';

const App: React.FC = () => {
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);

  useEffect(() => {
    const savedGameId = sessionStorage.getItem('poker-game-id');
    const savedPlayerId = sessionStorage.getItem('poker-player-id');
    if (savedGameId && savedPlayerId) {
      setGameId(savedGameId);
      setPlayerId(savedPlayerId);
    }
  }, []);

  const handleJoinGame = (joinedGameId: string, joinedPlayerId: string) => {
    sessionStorage.setItem('poker-game-id', joinedGameId);
    sessionStorage.setItem('poker-player-id', joinedPlayerId);
    setGameId(joinedGameId);
    setPlayerId(joinedPlayerId);
  };

  const handleLeaveGame = () => {
    sessionStorage.removeItem('poker-game-id');
    sessionStorage.removeItem('poker-player-id');
    setGameId(null);
    setPlayerId(null);
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <header className="w-full max-w-6xl mx-auto text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 tracking-wider" style={{fontFamily: "'Times New Roman', serif"}}>
          Poker Ledger
        </h1>
        <p className="text-gray-400">Virtual Chips, Real Action</p>
      </header>
      
      <main className="w-full">
        {gameId && playerId ? (
          <GameProvider gameId={gameId}>
            <GameTable currentPlayerId={playerId} onLeave={handleLeaveGame} />
          </GameProvider>
        ) : (
          <Lobby onJoin={handleJoinGame} />
        )}
      </main>
    </div>
  );
};

export default App;
