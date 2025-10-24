// Fix: Re-export types from `types.ts` to make them available to other modules importing from `useGameReducer`.
export * from '../types';
import { GameState, Player, GamePhase } from '../types';

export const STARTING_STACK = 1000;
export const SMALL_BLIND_AMOUNT = 10;
export const BIG_BLIND_AMOUNT = 20;

export const initialState: GameState = {
  gameId: null,
  players: [],
  pot: 0,
  currentPlayerIndex: -1,
  lastRaiserIndex: -1,
  currentBetToCall: 0,
  gamePhase: 'waiting',
  handHistory: [],
  minRaiseAmount: BIG_BLIND_AMOUNT,
};

export type GameAction =
  | { type: 'CREATE_GAME'; payload: { gameId: string; playerName: string; playerId: string } }
  | { type: 'JOIN_GAME'; payload: { playerName: string; playerId: string; existingState: GameState } }
  | { type: 'START_HAND' }
  | { type: 'PLAYER_ACTION'; payload: { action: 'fold' | 'call' | 'raise'; amount?: number } }
  | { type: 'SYNC_STATE'; payload: GameState };

const getNextActivePlayerIndex = (players: Player[], currentIndex: number): number => {
    let nextIndex = (currentIndex + 1) % players.length;
    while (players[nextIndex].isFolded || players[nextIndex].isAllIn) {
        if (nextIndex === currentIndex) return -1; // Everyone else folded/all-in
        nextIndex = (nextIndex + 1) % players.length;
    }
    return nextIndex;
};

const endBettingRound = (state: GameState): GameState => {
    const newState = { ...state };
    newState.pot += newState.players.reduce((sum, p) => sum + p.currentBet, 0);
    newState.players = newState.players.map(p => ({ ...p, currentBet: 0 }));
    newState.currentBetToCall = 0;
    newState.lastRaiserIndex = -1;

    const dealerIndex = newState.players.findIndex(p => p.isDealer);
    const firstToActIndex = getNextActivePlayerIndex(newState.players, dealerIndex);

    newState.currentPlayerIndex = firstToActIndex;
    
    // For simplicity, we'll just restart betting. A full game would cycle through flop, turn, river.
    newState.handHistory.push('Betting round ended. New round begins.');

    return newState;
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  let newState = { ...state };

  switch (action.type) {
    case 'SYNC_STATE':
        return action.payload;

    case 'CREATE_GAME': {
      const { gameId, playerName, playerId } = action.payload;
      const newPlayer: Player = {
        id: playerId, name: playerName, stack: STARTING_STACK, currentBet: 0,
        isFolded: false, isAllIn: false, isDealer: false, isSmallBlind: false, isBigBlind: false, seatIndex: 0
      };
      return { ...initialState, gameId, players: [newPlayer], handHistory: [`Game created by ${playerName}.`] };
    }

    case 'JOIN_GAME': {
        const { playerName, playerId, existingState } = action.payload;
        if (existingState.players.some(p => p.id === playerId)) return existingState; // Already joined
        const newPlayer: Player = {
            id: playerId, name: playerName, stack: STARTING_STACK, currentBet: 0,
            isFolded: false, isAllIn: false, isDealer: false, isSmallBlind: false, isBigBlind: false, seatIndex: existingState.players.length
        };
        return { ...existingState, players: [...existingState.players, newPlayer], handHistory: [...existingState.handHistory, `${playerName} joined the game.`] };
    }

    case 'START_HAND': {
        if (newState.players.length < 2) return state;

        const players = newState.players.map(p => ({...p, isFolded: false, isAllIn: false, currentBet: 0, isDealer: false, isSmallBlind: false, isBigBlind: false}));
        
        const lastDealerIndex = state.players.findIndex(p => p.isDealer);
        const dealerIndex = (lastDealerIndex + 1) % players.length;
        const smallBlindIndex = (dealerIndex + 1) % players.length;
        const bigBlindIndex = (smallBlindIndex + 1) % players.length;

        players[dealerIndex].isDealer = true;

        // Small Blind
        const sbBet = Math.min(SMALL_BLIND_AMOUNT, players[smallBlindIndex].stack);
        players[smallBlindIndex].stack -= sbBet;
        players[smallBlindIndex].currentBet = sbBet;
        players[smallBlindIndex].isSmallBlind = true;

        // Big Blind
        const bbBet = Math.min(BIG_BLIND_AMOUNT, players[bigBlindIndex].stack);
        players[bigBlindIndex].stack -= bbBet;
        players[bigBlindIndex].currentBet = bbBet;
        players[bigBlindIndex].isBigBlind = true;

        const pot = sbBet + bbBet;
        const currentPlayerIndex = (bigBlindIndex + 1) % players.length;

        return {
            ...newState,
            players,
            pot: 0,
            gamePhase: 'betting',
            currentBetToCall: BIG_BLIND_AMOUNT,
            minRaiseAmount: BIG_BLIND_AMOUNT,
            currentPlayerIndex,
            lastRaiserIndex: bigBlindIndex,
            handHistory: [`Hand started. ${players[dealerIndex].name} is the dealer.`],
        };
    }
    
    case 'PLAYER_ACTION': {
        const { action: playerAction, amount } = action.payload;
        const player = newState.players[newState.currentPlayerIndex];
        
        switch (playerAction) {
            case 'fold':
                player.isFolded = true;
                newState.handHistory.push(`${player.name} folds.`);
                break;
            case 'call': {
                const callAmount = newState.currentBetToCall - player.currentBet;
                const actualCallAmount = Math.min(callAmount, player.stack);
                player.stack -= actualCallAmount;
                player.currentBet += actualCallAmount;
                if (player.stack === 0) player.isAllIn = true;
                newState.handHistory.push(`${player.name} calls ${actualCallAmount}.`);
                break;
            }
            case 'raise': {
                const raiseAmount = amount || 0;
                player.stack -= raiseAmount - player.currentBet;
                player.currentBet = raiseAmount;
                if (player.stack === 0) player.isAllIn = true;
                
                newState.minRaiseAmount = raiseAmount - newState.currentBetToCall;
                newState.currentBetToCall = raiseAmount;
                newState.lastRaiserIndex = newState.currentPlayerIndex;
                newState.handHistory.push(`${player.name} raises to ${raiseAmount}.`);
                break;
            }
        }

        const activePlayers = newState.players.filter(p => !p.isFolded);
        if (activePlayers.length <= 1) {
             // End of hand, award pot
            const winner = activePlayers[0];
            const totalPot = newState.pot + newState.players.reduce((sum, p) => sum + p.currentBet, 0);
            if(winner) {
                winner.stack += totalPot;
                newState.handHistory.push(`${winner.name} wins the pot of ${totalPot}.`);
            }
            newState.pot = 0;
            newState.players.forEach(p => p.currentBet = 0);
            newState.gamePhase = 'end_of_hand';
            return newState;
        }

        const nextPlayerIndex = getNextActivePlayerIndex(newState.players, newState.currentPlayerIndex);
        
        if (nextPlayerIndex === newState.lastRaiserIndex || (newState.lastRaiserIndex === -1 && nextPlayerIndex === newState.players.findIndex(p=>p.isBigBlind))) {
            return endBettingRound(newState);
        } else {
            newState.currentPlayerIndex = nextPlayerIndex;
        }
        
        return newState;
    }

    default:
      return state;
  }
}