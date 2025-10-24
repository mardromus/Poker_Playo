
export interface Player {
  id: string;
  name: string;
  stack: number;
  currentBet: number;
  isFolded: boolean;
  isAllIn: boolean;
  isDealer: boolean;
  isSmallBlind: boolean;
  isBigBlind: boolean;
  seatIndex: number;
}

export type GamePhase = 'waiting' | 'betting' | 'showdown' | 'end_of_hand';

export interface GameState {
  gameId: string | null;
  players: Player[];
  pot: number;
  currentPlayerIndex: number;
  lastRaiserIndex: number; 
  currentBetToCall: number;
  gamePhase: GamePhase;
  handHistory: string[];
  minRaiseAmount: number;
}
