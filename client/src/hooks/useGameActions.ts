import { useState } from 'react';
import { useAccount } from '@starknet-react/core';
import { SystemCalls } from '../dojo/systemCalls';
import type { PlannedMove } from '../types/game';

export function useGameActions() {
  const { account } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeAction = async <T,>(
    action: () => Promise<T>
  ): Promise<T | null> => {
    if (!account) {
      setError('Wallet not connected');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await action();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Action failed:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createGame = async () => {
    if (!account) return null;
    return executeAction(async () => {
      const systemCalls = new SystemCalls({ account });
      return await systemCalls.createGame();
    });
  };

  const joinGame = async (gameId: number) => {
    if (!account) return null;
    return executeAction(async () => {
      const systemCalls = new SystemCalls({ account });
      return await systemCalls.joinGame(gameId);
    });
  };

  const placeUnits = async (
    gameId: number,
    positions: Array<{ x: number; y: number; unitType: number }>
  ) => {
    if (!account) return null;
    return executeAction(async () => {
      const systemCalls = new SystemCalls({ account });
      return await systemCalls.placeUnits(gameId, positions);
    });
  };

  const commitMoves = async (gameId: number, moves: PlannedMove[]) => {
    if (!account) return null;
    return executeAction(async () => {
      const systemCalls = new SystemCalls({ account });
      const formattedMoves = moves.map((m) => ({
        unitId: m.unit_id,
        action: getActionCode(m.action),
        targetX: m.target_x,
        targetY: m.target_y,
      }));
      return await systemCalls.commitMoves(gameId, formattedMoves);
    });
  };

  const executeTurn = async (gameId: number) => {
    if (!account) return null;
    return executeAction(async () => {
      const systemCalls = new SystemCalls({ account });
      return await systemCalls.executeTurn(gameId);
    });
  };

  return {
    createGame,
    joinGame,
    placeUnits,
    commitMoves,
    executeTurn,
    isLoading,
    error,
  };
}

function getActionCode(action: string): number {
  const codes: Record<string, number> = {
    move: 0,
    attack: 1,
    defend: 2,
  };
  return codes[action] ?? 0;
}