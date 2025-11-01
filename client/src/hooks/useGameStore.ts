import { create } from 'zustand';
import type { Game, Player, Unit, Tile, GameState } from '../types/game';

interface GameStore extends GameState {
  // Connection
  isConnected: boolean;
  address: string | null;

  // Actions
  setConnected: (isConnected: boolean, address: string | null) => void;
  setGame: (game: Game | null) => void;
  setPlayer: (player: Player | null) => void;
  setUnits: (units: Unit[]) => void;
  setTiles: (tiles: Tile[][]) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  // Initial state
  isConnected: false,
  address: null,
  game: null,
  player: null,
  units: [],
  tiles: [],

  // Actions
  setConnected: (isConnected, address) =>
    set({ isConnected, address }),

  setGame: (game) =>
    set({ game }),

  setPlayer: (player) =>
    set({ player }),

  setUnits: (units) =>
    set({ units }),

  setTiles: (tiles) =>
    set({ tiles }),

  reset: () =>
    set({
      game: null,
      player: null,
      units: [],
      tiles: [],
    }),
}));