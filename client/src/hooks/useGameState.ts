import { useEffect, useState } from 'react';
import { useGameStore } from './useGameStore';
import type { Game, Player, Unit } from '../types/game';

interface UseGameStateOptions {
  gameId?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useGameState(options: UseGameStateOptions = {}) {
  const { gameId, autoRefresh = false, refreshInterval = 5000 } = options;
  const { game, player, units, setGame, setPlayer, setUnits } = useGameStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch game state (placeholder for now - will connect to Torii later)
  const fetchGameState = async () => {
    if (!gameId) return;

    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual Torii query
      console.log('📡 Fetching game state for game:', gameId);
      
      // Mock data for now
      const mockGame: Game = {
        game_id: gameId,
        player1: '0x123...',
        player2: '0x456...',
        creator: '0x123...',
        current_phase: 'planning',
        current_turn: 1,
        winner: null,
        is_started: true,
        is_finished: false,
        created_at: Date.now(),
      };

      setGame(mockGame);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch game state';
      setError(message);
      console.error('Failed to fetch game state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (gameId) {
      fetchGameState();
    }
  }, [gameId]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh || !gameId) return;

    const interval = setInterval(() => {
      fetchGameState();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, gameId, refreshInterval]);

  return {
    game,
    player,
    units,
    isLoading,
    error,
    refetch: fetchGameState,
  };
}