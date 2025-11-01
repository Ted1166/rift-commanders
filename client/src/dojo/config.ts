import { DOJO_CONFIG } from '../constants';

export const dojoConfig = {
  worldAddress: DOJO_CONFIG.worldAddress,
  rpcUrl: DOJO_CONFIG.rpcUrl,
  toriiUrl: DOJO_CONFIG.toriiUrl,
  chainId: DOJO_CONFIG.chainId,
} as const;

if (!dojoConfig.worldAddress) {
  throw new Error('VITE_PUBLIC_WORLD_ADDRESS is not set');
}

if (!dojoConfig.rpcUrl) {
  throw new Error('VITE_PUBLIC_RPC_URL is not set');
}

if (!dojoConfig.toriiUrl) {
  throw new Error('VITE_PUBLIC_TORII_URL is not set');
}