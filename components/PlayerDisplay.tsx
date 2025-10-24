
import React from 'react';
import { Player } from '../types';
import PokerChip from './PokerChip';

interface PlayerDisplayProps {
  player: Player;
  isCurrentTurn: boolean;
  isCurrentUser: boolean;
  style: React.CSSProperties;
}

const PlayerDisplay: React.FC<PlayerDisplayProps> = ({ player, isCurrentTurn, isCurrentUser, style }) => {
  const { name, stack, currentBet, isFolded, isDealer, isSmallBlind, isBigBlind } = player;

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length > 1) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  return (
    <div className={`absolute p-2 md:p-3 rounded-lg w-32 md:w-40 transition-all duration-300 ${isFolded ? 'opacity-40' : ''} ${isCurrentTurn ? 'shadow-2xl shadow-cyan-500/50' : ''} ${isCurrentUser ? 'bg-blue-900/50' : 'bg-gray-900/70'}`} style={style}>
        <div className={`border-2 rounded-lg p-2 ${isCurrentTurn ? 'border-cyan-400' : 'border-gray-600'}`}>
            <div className="flex items-center space-x-2">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold text-sm md:text-lg">
                    {getInitials(name)}
                </div>
                <div>
                    <p className={`text-sm md:text-base font-bold truncate ${isCurrentUser ? 'text-cyan-300' : 'text-white'}`}>{name}</p>
                    <p className="text-sm md:text-lg font-semibold text-yellow-300">${stack.toLocaleString()}</p>
                </div>
            </div>
            <div className="h-10 mt-2 flex items-center justify-center space-x-2">
                {currentBet > 0 && (
                    <div className="flex items-center">
                        <PokerChip value={currentBet}/>
                        <span className="ml-1 text-sm text-white font-semibold">{currentBet}</span>
                    </div>
                )}
                <div className="flex space-x-1">
                    {isDealer && <div className="w-6 h-6 rounded-full bg-white text-black font-bold text-sm flex items-center justify-center">D</div>}
                    {isSmallBlind && <div className="w-6 h-6 rounded-full bg-blue-500 text-white font-bold text-sm flex items-center justify-center">SB</div>}
                    {isBigBlind && <div className="w-6 h-6 rounded-full bg-red-500 text-white font-bold text-sm flex items-center justify-center">BB</div>}
                </div>
            </div>
        </div>
    </div>
  );
};

export default PlayerDisplay;
