import { createDojoConfig } from '@dojoengine/core';

// ✅ Production Dojo Configuration
export const dojoConfig = createDojoConfig({
  manifest: {
    world: {
      address: import.meta.env.VITE_PUBLIC_WORLD_ADDRESS,
    },
  },
  rpcUrl: import.meta.env.VITE_PUBLIC_RPC_URL || 'https://api.cartridge.gg/x/starknet/sepolia',
  toriiUrl: import.meta.env.VITE_PUBLIC_TORII_URL || 'https://api.cartridge.gg/x/rift-commanders/torii',
});

// Contract addresses
export const CONTRACTS = {
  GAME_ACTIONS: import.meta.env.VITE_PUBLIC_GAME_ACTIONS_ADDRESS,
  WORLD: import.meta.env.VITE_PUBLIC_WORLD_ADDRESS,
};

// Network configuration
export const NETWORK = {
  chainId: import.meta.env.VITE_PUBLIC_CHAIN_ID || 'SN_SEPOLIA',
  name: 'Starknet Sepolia',
};