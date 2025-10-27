import type { ReactNode } from 'react';
import ControllerConnector from '@cartridge/connector/controller';
import { sepolia } from '@starknet-react/chains';
import { Connector, StarknetConfig, starkscan } from '@starknet-react/core';
import { RpcProvider, constants } from 'starknet';
import type { Chain } from '@starknet-react/chains';
import type { ControllerOptions } from '@cartridge/controller';

interface StarknetProviderProps {
  children: ReactNode;
}

export function StarknetProvider({ children }: StarknetProviderProps) {
  const worldAddress = import.meta.env.VITE_PUBLIC_WORLD_ADDRESS;

  // Define session policies
  const policies = {
    contracts: {
      [worldAddress]: {
        methods: [
          // Lobby system
          { entrypoint: "create_game" },
          { entrypoint: "join_game" },
          { entrypoint: "start_game" },
          { entrypoint: "place_units" },
          
          // Planning system
          { entrypoint: "commit_moves" },
          { entrypoint: "auto_advance_if_ready" },
          
          // Execution system
          { entrypoint: "execute_turn" },
          { entrypoint: "resolve_combat" },
          
          // Rift system
          { entrypoint: "trigger_rift" },
          { entrypoint: "manual_rift_trigger" },
        ],
      },
    },
  };

  const options: ControllerOptions = {
    chains: [
      {
        rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia",
      },
    ],
    defaultChainId: constants.StarknetChainId.SN_SEPOLIA,
    namespace: "rift_commanders",
    policies,
  };

  const cartridge = new ControllerConnector(options) as never as Connector;

  function provider(chain: Chain) {
    return new RpcProvider({
      nodeUrl: 'https://api.cartridge.gg/x/starknet/sepolia',
    });
  }

  return (
    <StarknetConfig
      autoConnect
      chains={[sepolia]}
      connectors={[cartridge]}
      explorer={starkscan}
      provider={provider}
    >
      {children}
    </StarknetConfig>
  );
}