import type { UnitType } from '@/types/game';

export const GRID_SIZE = 5;
export const PLANNING_TIME = 30; // seconds
export const RIFT_INTERVAL = [3, 5]; // turns between rifts

export const UNIT_STATS = {
  commander: {
    health: 20,
    attack: 5,
    defense: 3,
    range: 1,
  },
  warrior: {
    health: 15,
    attack: 7,
    defense: 2,
    range: 1,
  },
  archer: {
    health: 10,
    attack: 6,
    defense: 1,
    range: 2,
  },
} as const;

export const TERRAIN_EFFECTS = {
  normal: { damage: 0, healing: 0, attackBonus: 0 },
  lava: { damage: 2, healing: 0, attackBonus: 0 },
  heal: { damage: 0, healing: 3, attackBonus: 0 },
  boost: { damage: 0, healing: 0, attackBonus: 2 },
  wall: { damage: 0, healing: 0, attackBonus: 0 },
} as const;

export const PLAYER_DEPLOY_ZONES = {
  1: { rows: [3, 4] }, // Player 1: bottom 2 rows
  2: { rows: [0, 1] }, // Player 2: top 2 rows
} as const;