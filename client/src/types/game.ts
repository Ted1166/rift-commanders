export type GamePhase = 'lobby' | 'setup' | 'planning' | 'execution' | 'finished';
export type UnitType = 'commander' | 'warrior' | 'archer';
export type TerrainType = 'normal' | 'lava' | 'wall' | 'heal' | 'boost';
export type ActionType = 'move' | 'attack' | 'defend';

export interface Game {
  game_id: number;
  player1: string;
  player2: string | null;
  creator: string;
  current_phase: GamePhase;
  current_turn: number;
  winner: string | null;
  is_started: boolean;
  is_finished: boolean;
  created_at: number;
}

export interface Player {
  game_id: number;
  address: string;
  player_number: 1 | 2;
  units_alive: number;
  has_committed_moves: boolean;
  setup_complete: boolean;
  commander_alive: boolean;
}

export interface Unit {
  game_id: number;
  owner: string;
  unit_id: number;
  unit_type: UnitType;
  position_x: number;
  position_y: number;
  health: number;
  max_health: number;
  attack: number;
  defense: number;
  range: number;
  is_alive: boolean;
}

export interface Tile {
  game_id: number;
  x: number;
  y: number;
  tile_type: TerrainType;
  is_occupied: boolean;
  occupant_owner: string | null;
  occupant_unit_id: number | null;
}

export interface Position {
  x: number;
  y: number;
}

export interface PlannedMove {
  unit_id: number;
  action: ActionType;
  target_x?: number;
  target_y?: number;
}

export interface GameState {
  game: Game | null;
  player: Player | null;
  units: Unit[];
  tiles: Tile[][];
}