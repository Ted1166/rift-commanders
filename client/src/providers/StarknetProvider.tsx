import type { PropsWithChildren } from 'react';
import { sepolia, mainnet } from '@starknet-react/chains';
import {
  jsonRpcProvider,
  StarknetConfig,
  starkscan,
  argent,
  braavos,
} from '@starknet-react/core';
import cartridgeConnector from '../config/cartridgeConnector';

export function StarknetProvider({ children }: PropsWithChildren) {
  const deployType = import.meta.env.VITE_PUBLIC_DEPLOY_TYPE || 'sepolia';

  // Get RPC URL based on environment
  const getRpcUrl = () => {
    switch (deployType) {
      case 'mainnet':
        return 'https://api.cartridge.gg/x/starknet/mainnet';
      case 'sepolia':
        return 'https://api.cartridge.gg/x/starknet/sepolia';
      case 'localhost':
        return 'http://localhost:5050';
      default:
        return 'https://api.cartridge.gg/x/starknet/sepolia';
    }
  };

  // Create provider with the correct RPC URL
  const provider = jsonRpcProvider({
    rpc: () => ({ nodeUrl: getRpcUrl() }),
  });

  // Determine which chain to use
  const chains = deployType === 'mainnet' ? [mainnet] : [sepolia];

  // Connectors - Cartridge first, then Argent & Braavos as fallbacks
  const connectors = [
    cartridgeConnector,
    argent(),
    braavos(),
  ];

  return (
    <StarknetConfig
      autoConnect
      chains={chains}
      connectors={connectors}
      explorer={starkscan}
      provider={provider}
    >
      {children}
    </StarknetConfig>
  );
}