
import React, { useState, useContext, useMemo } from 'react';
import { GameContext } from '../contexts/GameContext';
import { Player } from '../types';
import { BIG_BLIND_AMOUNT } from '../hooks/useGameReducer';

interface ActionControlsProps {
  player: Player;
}

const ActionControls: React.FC<ActionControlsProps> = ({ player }) => {
  const context = useContext(GameContext);
  if (!context) return null;

  const { gameState, broadcastAction } = context;
  const { currentBetToCall, minRaiseAmount } = gameState;

  const canCheck = player.currentBet === currentBetToCall;
  const callAmount = Math.min(currentBetToCall - player.currentBet, player.stack);
  
  const minRaise = currentBetToCall + minRaiseAmount;
  const maxRaise = player.stack + player.currentBet;
  const [raiseAmount, setRaiseAmount] = useState(minRaise);

  const handleFold = () => {
    broadcastAction({ type: 'PLAYER_ACTION', payload: { action: 'fold' } });
  };

  const handleCallCheck = () => {
    broadcastAction({ type: 'PLAYER_ACTION', payload: { action: 'call' } });
  };

  const handleRaise = () => {
    const finalRaiseAmount = Math.min(raiseAmount, maxRaise);
    broadcastAction({ type: 'PLAYER_ACTION', payload: { action: 'raise', amount: finalRaiseAmount } });
  };
  
  const canRaise = maxRaise > currentBetToCall;

  // Use useMemo to prevent recalculating on every render unless dependencies change
  const sliderSteps = useMemo(() => {
    if (!canRaise) return [];
    const potSize = gameState.pot + gameState.players.reduce((acc, p) => acc + p.currentBet, 0);
    const steps = new Set<number>();
    steps.add(minRaise);
    steps.add(Math.round(potSize / 2));
    steps.add(potSize);
    steps.add(maxRaise);
    return Array.from(steps)
      .filter(step => step >= minRaise && step <= maxRaise)
      .sort((a, b) => a - b);
  }, [minRaise, maxRaise, gameState.pot, gameState.players, canRaise]);


  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800/80 backdrop-blur-sm p-4 border-t-2 border-cyan-500 shadow-lg">
      <div className="w-full max-w-4xl mx-auto">
        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4">
          <button onClick={handleFold} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg text-lg transition transform hover:scale-105">Fold</button>
          <button onClick={handleCallCheck} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-lg transition transform hover:scale-105">
            {canCheck ? 'Check' : `Call ${callAmount}`}
          </button>
          <button onClick={handleRaise} disabled={!canRaise} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg text-lg transition transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed">
            Raise to {Math.min(raiseAmount, maxRaise)}
          </button>
        </div>
        
        {canRaise && (
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min={minRaise}
              max={maxRaise}
              step={BIG_BLIND_AMOUNT / 2}
              value={raiseAmount}
              onChange={(e) => setRaiseAmount(Number(e.target.value))}
              className="w-full h-3 bg-gray-600 rounded-lg appearance-none cursor-pointer range-lg"
            />
            <div className="flex space-x-2">
                {sliderSteps.map(step => (
                     <button key={step} onClick={() => setRaiseAmount(step)} className="bg-gray-700 text-xs px-2 py-1 rounded">
                        {step === maxRaise ? 'All In' : step}
                    </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionControls;
