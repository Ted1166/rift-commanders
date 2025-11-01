import { DojoProvider } from '@dojoengine/core';
import { Account, RpcProvider } from 'starknet';
import { dojoConfig } from './config';

export interface SetupResult {
  provider: RpcProvider;
  dojoProvider: DojoProvider;
}

let setupPromise: Promise<SetupResult> | null = null;

export async function setup(): Promise<SetupResult> {
  // Return existing setup if already initialized
  if (setupPromise) {
    return setupPromise;
  }

  setupPromise = (async () => {
    try {
      // Create RPC provider
      const provider = new RpcProvider({
        nodeUrl: dojoConfig.rpcUrl,
      });

      // Note: manifest will be loaded dynamically once available
      // For now, we create a minimal DojoProvider
      const dojoProvider = new DojoProvider(
        {} as any, // Manifest placeholder
        dojoConfig.worldAddress
      );

      console.log('✅ Dojo setup complete');
      console.log('World Address:', dojoConfig.worldAddress);
      console.log('RPC URL:', dojoConfig.rpcUrl);
      console.log('Torii URL:', dojoConfig.toriiUrl);

      return {
        provider,
        dojoProvider,
      };
    } catch (error) {
      console.error('❌ Dojo setup failed:', error);
      throw error;
    }
  })();

  return setupPromise;
}