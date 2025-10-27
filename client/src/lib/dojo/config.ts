export const dojoConfig = {
  worldAddress: import.meta.env.VITE_PUBLIC_WORLD_ADDRESS,
  rpcUrl: import.meta.env.VITE_PUBLIC_RPC_URL,
  toriiUrl: import.meta.env.VITE_PUBLIC_TORII_URL,
  chainId: import.meta.env.VITE_PUBLIC_CHAIN_ID,
} as const;