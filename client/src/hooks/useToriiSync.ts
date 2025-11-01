import { useState, useEffect } from 'react';
import { useAccount } from '@starknet-react/core';

interface GameState {
  gameId: number;
  currentPhase: string;
  currentTurn: number;
  player1: string;
  player2: string;
  winner: string | null;
}

export function useToriiSync(gameId: number) {
  const { address } = useAccount();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGameState = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // TODO: Replace with real Torii query
        console.log('📡 Syncing game state from Torii for game:', gameId);
        
        // Mock game state for now
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockState: GameState = {
          gameId,
          currentPhase: 'planning',
          currentTurn: 1,
          player1: address || '0x123...',
          player2: '0x456...',
          winner: null,
        };

        setGameState(mockState);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to sync game state';
        setError(message);
        console.error('❌ Torii sync failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameState();

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchGameState, 5000);
    return () => clearInterval(interval);
  }, [gameId, address]);

  return { gameState, isLoading, error };
}