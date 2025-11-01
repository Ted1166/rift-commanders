import type { Position, UnitType } from '../types/game';
import { UNIT_STATS } from '../constants';

export function isValidPosition(x: number, y: number, gridSize: number = 5): boolean {
  return x >= 0 && x < gridSize && y >= 0 && y < gridSize;
}

export function calculateDistance(pos1: Position, pos2: Position): number {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
}

export function isInRange(
  unitPos: Position,
  targetPos: Position,
  unitType: UnitType
): boolean {
  const distance = calculateDistance(unitPos, targetPos);
  const range = UNIT_STATS[unitType].range;
  return distance <= range;
}

export function getUnitIcon(unitType: UnitType): string {
  const icons = {
    commander: '👑',
    warrior: '⚔️',
    archer: '🏹',
  };
  return icons[unitType];
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getPlayerColor(playerNumber: 1 | 2): string {
  return playerNumber === 1 ? 'tactical-green' : 'accent-red';
}