
import React, { useState } from 'react';
import { GameState, gameReducer, initialState } from '../hooks/useGameReducer';

interface LobbyProps {
  onJoin: (gameId: string, playerId: string) => void;
}

const Lobby: React.FC<LobbyProps> = ({ onJoin }) => {
  const [playerName, setPlayerName] = useState('');
  const [joinGameId, setJoinGameId] = useState('');
  const [error, setError] = useState('');

  const handleCreateGame = () => {
    if (!playerName.trim()) {
      setError('Please enter your name.');
      return;
    }
    setError('');
    const newGameId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const playerId = `player_${Date.now()}`;

    const action = { type: 'CREATE_GAME' as const, payload: { gameId: newGameId, playerName, playerId } };
    const newState = gameReducer(initialState, action);
    localStorage.setItem(`poker-game-${newGameId}`, JSON.stringify(newState));
    
    onJoin(newGameId, playerId);
  };

  const handleJoinGame = () => {
    if (!playerName.trim() || !joinGameId.trim()) {
      setError('Please enter your name and a game ID.');
      return;
    }
    
    const storedStateJSON = localStorage.getItem(`poker-game-${joinGameId}`);
    if (!storedStateJSON) {
      setError('Game ID not found.');
      return;
    }
    setError('');

    const existingState = JSON.parse(storedStateJSON) as GameState;
    const playerId = `player_${Date.now()}`;

    const action = { type: 'JOIN_GAME' as const, payload: { playerName, playerId, existingState } };
    const newState = gameReducer(existingState, action);
    localStorage.setItem(`poker-game-${joinGameId}`, JSON.stringify(newState));

    onJoin(joinGameId, playerId);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
      <h2 className="text-3xl font-bold text-center text-white mb-6">Join a Game</h2>
      <div className="space-y-6">
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter Your Name"
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
        />
        
        <div className="space-y-4 p-4 border border-gray-700 rounded-lg">
            <h3 className="text-xl font-semibold text-center">Create New Game</h3>
            <button onClick={handleCreateGame} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105">
              Create Game
            </button>
        </div>

        <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-600"></div>
            <span className="flex-shrink mx-4 text-gray-400">OR</span>
            <div className="flex-grow border-t border-gray-600"></div>
        </div>

        <div className="space-y-4 p-4 border border-gray-700 rounded-lg">
            <h3 className="text-xl font-semibold text-center">Join Existing Game</h3>
            <input
              type="text"
              value={joinGameId}
              onChange={(e) => setJoinGameId(e.target.value.toUpperCase())}
              placeholder="Enter Game ID"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            />
            <button onClick={handleJoinGame} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105">
              Join Game
            </button>
        </div>
        
        {error && <p className="text-red-400 text-center mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default Lobby;
