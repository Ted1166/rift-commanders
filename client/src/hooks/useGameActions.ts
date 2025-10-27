import { useState } from 'react';
import { useGameStore } from '../lib/stores/gameStore';

export const useGameActions = (account: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setCurrentGame } = useGameStore();

  const createGame = async () => {
    if (!account) {
      setError('No account connected');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const worldAddress = import.meta.env.VITE_PUBLIC_WORLD_ADDRESS;

      // Call create_game on the lobby system
      const tx = await account.execute({
        contractAddress: worldAddress,
        entrypoint: 'create_game',
        calldata: [],
      });

      console.log('Game created! Transaction:', tx.transaction_hash);
      
      // Wait for transaction
      // await account.waitForTransaction(tx.transaction_hash);

      return tx.transaction_hash;
    } catch (err: any) {
      console.error('Failed to create game:', err);
      setError(err.message || 'Failed to create game');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const joinGame = async (gameId: number) => {
    if (!account) {
      setError('No account connected');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const worldAddress = import.meta.env.VITE_PUBLIC_WORLD_ADDRESS;

      const tx = await account.execute({
        contractAddress: worldAddress,
        entrypoint: 'join_game',
        calldata: [gameId],
      });

      console.log('Joined game! Transaction:', tx.transaction_hash);

      return tx.transaction_hash;
    } catch (err: any) {
      console.error('Failed to join game:', err);
      setError(err.message || 'Failed to join game');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createGame,
    joinGame,
    isLoading,
    error,
  };
};