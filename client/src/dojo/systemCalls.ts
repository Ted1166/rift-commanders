import type { AccountInterface } from 'starknet';
import { dojoConfig } from './config';
import { MOCK_MODE, generateMockTxHash, delay } from '../utils/mock';

export interface SystemCallOptions {
  account: AccountInterface;
}

export class SystemCalls {
  private account: AccountInterface;

  constructor(options: SystemCallOptions) {
    this.account = options.account;
  }

  // Lobby Actions
  async createGame(): Promise<string> {
    try {
      // MOCK MODE: Simulate transaction
      if (MOCK_MODE) {
        console.log('🎮 [MOCK] Creating game...');
        await delay(1500); // Simulate network delay
        const txHash = generateMockTxHash();
        console.log('✅ [MOCK] Game created! TX:', txHash);
        return txHash;
      }

      // REAL MODE: Actual blockchain transaction
      const tx = await this.account.execute({
        contractAddress: dojoConfig.worldAddress,
        entrypoint: 'create_game',
        calldata: [],
      });

      console.log('✅ Game created! TX:', tx.transaction_hash);
      return tx.transaction_hash;
    } catch (error) {
      console.error('❌ Failed to create game:', error);
      throw error;
    }
  }

  async joinGame(gameId: number): Promise<string> {
    try {
      // MOCK MODE
      if (MOCK_MODE) {
        console.log('🎮 [MOCK] Joining game:', gameId);
        await delay(1500);
        const txHash = generateMockTxHash();
        console.log('✅ [MOCK] Joined game! TX:', txHash);
        return txHash;
      }

      // REAL MODE
      const tx = await this.account.execute({
        contractAddress: dojoConfig.worldAddress,
        entrypoint: 'join_game',
        calldata: [gameId],
      });

      console.log('✅ Joined game! TX:', tx.transaction_hash);
      return tx.transaction_hash;
    } catch (error) {
      console.error('❌ Failed to join game:', error);
      throw error;
    }
  }

  async placeUnits(
    gameId: number,
    positions: Array<{ x: number; y: number; unitType: number }>
  ): Promise<string> {
    try {
      // MOCK MODE
      if (MOCK_MODE) {
        console.log('🎮 [MOCK] Placing units:', positions);
        await delay(2000);
        const txHash = generateMockTxHash();
        console.log('✅ [MOCK] Units placed! TX:', txHash);
        return txHash;
      }

      // REAL MODE
      const calldata = [
        gameId,
        positions.length,
        ...positions.flatMap((p) => [p.x, p.y, p.unitType]),
      ];

      const tx = await this.account.execute({
        contractAddress: dojoConfig.worldAddress,
        entrypoint: 'place_units',
        calldata,
      });

      console.log('✅ Units placed! TX:', tx.transaction_hash);
      return tx.transaction_hash;
    } catch (error) {
      console.error('❌ Failed to place units:', error);
      throw error;
    }
  }

  async commitMoves(
    gameId: number,
    moves: Array<{ unitId: number; action: number; targetX?: number; targetY?: number }>
  ): Promise<string> {
    try {
      // MOCK MODE
      if (MOCK_MODE) {
        console.log('🎮 [MOCK] Committing moves:', moves);
        await delay(2000);
        const txHash = generateMockTxHash();
        console.log('✅ [MOCK] Moves committed! TX:', txHash);
        return txHash;
      }

      // REAL MODE
      const calldata = [
        gameId,
        moves.length,
        ...moves.flatMap((m) => [
          m.unitId,
          m.action,
          m.targetX ?? 0,
          m.targetY ?? 0,
        ]),
      ];

      const tx = await this.account.execute({
        contractAddress: dojoConfig.worldAddress,
        entrypoint: 'commit_moves',
        calldata,
      });

      console.log('✅ Moves committed! TX:', tx.transaction_hash);
      return tx.transaction_hash;
    } catch (error) {
      console.error('❌ Failed to commit moves:', error);
      throw error;
    }
  }

  async executeTurn(gameId: number): Promise<string> {
    try {
      // MOCK MODE
      if (MOCK_MODE) {
        console.log('🎮 [MOCK] Executing turn for game:', gameId);
        await delay(2000);
        const txHash = generateMockTxHash();
        console.log('✅ [MOCK] Turn executed! TX:', txHash);
        return txHash;
      }

      // REAL MODE
      const tx = await this.account.execute({
        contractAddress: dojoConfig.worldAddress,
        entrypoint: 'execute_turn',
        calldata: [gameId],
      });

      console.log('✅ Turn executed! TX:', tx.transaction_hash);
      return tx.transaction_hash;
    } catch (error) {
      console.error('❌ Failed to execute turn:', error);
      throw error;
    }
  }
}