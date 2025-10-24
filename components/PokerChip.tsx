
import React from 'react';

interface PokerChipProps {
  value: number;
}

const PokerChip: React.FC<PokerChipProps> = ({ value }) => {
  const getColor = (val: number) => {
    if (val < 25) return 'bg-blue-500';
    if (val < 100) return 'bg-red-500';
    if (val < 500) return 'bg-green-500';
    if (val < 1000) return 'bg-black';
    return 'bg-purple-500';
  };

  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs border-2 border-white/50 shadow-md ${getColor(value)}`}>
      <div className="w-6 h-6 rounded-full border-2 border-white/30 flex items-center justify-center">
      </div>
    </div>
  );
};

export default PokerChip;
