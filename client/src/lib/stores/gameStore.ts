import { create } from 'zustand';
import type { Game, Player, Unit, Tile } from '../../types/game';

interface GameState {
  // Connection
  isConnected: boolean;
  address: string | null;
  
  // Current game
  currentGame: Game | null;
  currentPlayer: Player | null;
  units: Unit[];
  tiles: Tile[][];
  
  // Actions
  setConnected: (isConnected: boolean, address: string | null) => void;
  setCurrentGame: (game: Game | null) => void;
  setCurrentPlayer: (player: Player | null) => void;
  setUnits: (units: Unit[]) => void;
  setTiles: (tiles: Tile[][]) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  // Initial state
  isConnected: false,
  address: null,
  currentGame: null,
  currentPlayer: null,
  units: [],
  tiles: [],
  
  // Actions
  setConnected: (isConnected, address) => set({ isConnected, address }),
  setCurrentGame: (currentGame) => set({ currentGame }),
  setCurrentPlayer: (currentPlayer) => set({ currentPlayer }),
  setUnits: (units) => set({ units }),
  setTiles: (tiles) => set({ tiles }),
  reset: () => set({
    currentGame: null,
    currentPlayer: null,
    units: [],
    tiles: [],
  }),
}));