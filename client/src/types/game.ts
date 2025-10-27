export type GamePhase = 'Lobby' | 'Setup' | 'Planning' | 'Execution' | 'Finished';
export type UnitType = 'Commander' | 'Warrior' | 'Archer';
export type TileType = 'Normal' | 'Lava' | 'Wall' | 'Portal' | 'Boost' | 'Heal';
export type ActionType = 'Move' | 'Attack' | 'Defend' | 'Special' | 'Wait';

export interface Game {
  game_id: number;
  player1: string;
  player2: string;
  creator: string;
  current_phase: GamePhase;
  current_turn: number;
  winner: string;
  is_started: boolean;
  is_finished: boolean;
  created_at: number;
}

export interface Player {
  game_id: number;
  address: string;
  player_number: number;
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
  is_alive: boolean;
}

export interface Tile {
  game_id: number;
  x: number;
  y: number;
  tile_type: TileType;
  is_occupied: boolean;
  occupant_owner: string;
  occupant_unit_id: number;
}

export interface Position {
  x: number;
  y: number;
}