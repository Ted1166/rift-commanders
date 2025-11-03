import { useState } from 'react';
import { useAccount, useContract } from '@starknet-react/core';
import { CallData } from 'starknet';
import { CONTRACTS } from '../dojo/config';

// ✅ Define ABI with 'as const' for proper typing
const GAME_ACTIONS_ABI = [
  {
    name: 'create_game',
    type: 'function',
    inputs: [],
    outputs: [{ name: 'game_id', type: 'felt252' }],
    state_mutability: 'external',
  },
  {
    name: 'join_game',
    type: 'function',
    inputs: [{ name: 'game_id', type: 'felt252' }],
    outputs: [],
    state_mutability: 'external',
  },
  {
    name: 'deploy_units',
    type: 'function',
    inputs: [
      { name: 'game_id', type: 'felt252' },
      { name: 'positions', type: 'core::array::Array::<Position>' },
    ],
    outputs: [],
    state_mutability: 'external',
  },
  {
    name: 'commit_moves',
    type: 'function',
    inputs: [
      { name: 'game_id', type: 'felt252' },
      { name: 'moves', type: 'core::array::Array::<Move>' },
    ],
    outputs: [],
    state_mutability: 'external',
  },
  {
    name: 'execute_turn',
    type: 'function',
    inputs: [{ name: 'game_id', type: 'felt252' }],
    outputs: [],
    state_mutability: 'external',
  },
] as const; // ✅ CRITICAL: Add 'as const'

export function useGameActions() {
  const { account } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Use contract with proper typing
  const { contract } = useContract({
    address: CONTRACTS.GAME_ACTIONS,
    abi: GAME_ACTIONS_ABI,
  });

  // Create Game
  const createGame = async (): Promise<string | null> => {
    if (!account || !contract) {
      setError('Wallet not connected');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const tx = await account.execute({
        contractAddress: CONTRACTS.GAME_ACTIONS!,
        entrypoint: 'create_game',
        calldata: [],
      });

      console.log('✅ Game created, tx:', tx.transaction_hash);
      await account.waitForTransaction(tx.transaction_hash);

      setIsLoading(false);
      return tx.transaction_hash;
    } catch (err: any) {
      console.error('❌ Failed to create game:', err);
      setError(err.message);
      setIsLoading(false);
      return null;
    }
  };

  // Join Game
  const joinGame = async (gameId: number): Promise<string | null> => {
    if (!account || !contract) {
      setError('Wallet not connected');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const tx = await account.execute({
        contractAddress: CONTRACTS.GAME_ACTIONS!,
        entrypoint: 'join_game',
        calldata: CallData.compile({ game_id: gameId }),
      });

      console.log('✅ Joined game, tx:', tx.transaction_hash);
      await account.waitForTransaction(tx.transaction_hash);

      setIsLoading(false);
      return tx.transaction_hash;
    } catch (err: any) {
      console.error('❌ Failed to join game:', err);
      setError(err.message);
      setIsLoading(false);
      return null;
    }
  };

  // Deploy Units
  const deployUnits = async (
    gameId: number,
    positions: Array<{ x: number; y: number; unitType: number }>
  ): Promise<string | null> => {
    if (!account || !contract) {
      setError('Wallet not connected');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const tx = await account.execute({
        contractAddress: CONTRACTS.GAME_ACTIONS!,
        entrypoint: 'deploy_units',
        calldata: CallData.compile({
          game_id: gameId,
          positions,
        }),
      });

      console.log('✅ Units deployed, tx:', tx.transaction_hash);
      await account.waitForTransaction(tx.transaction_hash);

      setIsLoading(false);
      return tx.transaction_hash;
    } catch (err: any) {
      console.error('❌ Failed to deploy units:', err);
      setError(err.message);
      setIsLoading(false);
      return null;
    }
  };

  // Commit Moves
  const commitMoves = async (
    gameId: number,
    moves: Array<{
      unit_id: number;
      action: string;
      target_x: number;
      target_y: number;
    }>
  ): Promise<string | null> => {
    if (!account || !contract) {
      setError('Wallet not connected');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const tx = await account.execute({
        contractAddress: CONTRACTS.GAME_ACTIONS!,
        entrypoint: 'commit_moves',
        calldata: CallData.compile({
          game_id: gameId,
          moves,
        }),
      });

      console.log('✅ Moves committed, tx:', tx.transaction_hash);
      await account.waitForTransaction(tx.transaction_hash);

      setIsLoading(false);
      return tx.transaction_hash;
    } catch (err: any) {
      console.error('❌ Failed to commit moves:', err);
      setError(err.message);
      setIsLoading(false);
      return null;
    }
  };

  // Execute Turn
  const executeTurn = async (gameId: number): Promise<string | null> => {
    if (!account || !contract) {
      setError('Wallet not connected');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const tx = await account.execute({
        contractAddress: CONTRACTS.GAME_ACTIONS!,
        entrypoint: 'execute_turn',
        calldata: CallData.compile({ game_id: gameId }),
      });

      console.log('✅ Turn executed, tx:', tx.transaction_hash);
      await account.waitForTransaction(tx.transaction_hash);

      setIsLoading(false);
      return tx.transaction_hash;
    } catch (err: any) {
      console.error('❌ Failed to execute turn:', err);
      setError(err.message);
      setIsLoading(false);
      return null;
    }
  };

  return {
    createGame,
    joinGame,
    deployUnits,
    commitMoves,
    executeTurn,
    isLoading,
    error,
  };
}