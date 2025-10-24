
import React, { useContext } from 'react';
import { GameContext } from '../contexts/GameContext';
import PlayerDisplay from './PlayerDisplay';
import ActionControls from './ActionControls';
import { Player } from '../types';

interface GameTableProps {
  currentPlayerId: string;
  onLeave: () => void;
}

const GameTable: React.FC<GameTableProps> = ({ currentPlayerId, onLeave }) => {
  const context = useContext(GameContext);

  if (!context) {
    return <div>Loading...</div>;
  }

  const { gameState, broadcastAction } = context;
  const { players, pot, gamePhase, gameId, currentPlayerIndex } = gameState;
  const me = players.find(p => p.id === currentPlayerId);

  const handleStartHand = () => {
    broadcastAction({ type: 'START_HAND' });
  };
  
  const tableSize = 350; // a base size in pixels for the table radius

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-4 p-2 bg-gray-800/50 rounded-lg">
            <div className="text-lg">Game ID: <span className="font-bold text-cyan-400">{gameId}</span></div>
            <button onClick={onLeave} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition">Leave Game</button>
        </div>

      <div className="relative w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-green-800 border-8 border-yellow-800 rounded-full flex items-center justify-center shadow-2xl"
           style={{ backgroundImage: 'radial-gradient(circle, #2E8B57 0%, #1a472a 100%)' }}>
        
        <div className="absolute w-2/3 h-2/3 border-4 border-yellow-700/50 rounded-full"></div>
        <div className="absolute flex flex-col items-center z-10 bg-black/30 p-4 rounded-lg">
            <h3 className="text-xl text-yellow-300 font-bold">Pot</h3>
            <div className="text-4xl font-bold text-white tracking-wider">${pot.toLocaleString()}</div>
        </div>

        {players.map((player, index) => {
           const angle = (index / players.length) * 2 * Math.PI;
           const x = 50 + 45 * Math.cos(angle);
           const y = 50 + 45 * Math.sin(angle);
           const isCurrentUser = player.id === currentPlayerId;
           const isCurrentTurn = index === currentPlayerIndex;
            return <PlayerDisplay key={player.id} player={player} isCurrentTurn={isCurrentTurn} isCurrentUser={isCurrentUser} style={{ top: `${y}%`, left: `${x}%`, transform: 'translate(-50%, -50%)' }}/>
        })}
      </div>

      <div className="w-full mt-8">
        {gamePhase === 'waiting' && me && players.length >= 2 && (
             <div className="text-center">
                <p className="mb-4 text-lg">{`Waiting for ${me.name} to start the hand. (${players.length} players ready)`}</p>
                <button onClick={handleStartHand} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-xl transition transform hover:scale-105">
                    Start Hand
                </button>
            </div>
        )}
        {gamePhase === 'end_of_hand' && me && (
             <div className="text-center">
                <p className="mb-4 text-lg">Hand over. Waiting to start the next hand.</p>
                <button onClick={handleStartHand} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-xl transition transform hover:scale-105">
                    Start Next Hand
                </button>
            </div>
        )}
        {me && players[currentPlayerIndex]?.id === me.id && gamePhase === 'betting' && (
            <ActionControls player={me}/>
        )}
      </div>
    </div>
  );
};

export default GameTable;
