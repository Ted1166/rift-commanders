import { constants } from "starknet";
import type { ControllerOptions } from "@cartridge/controller";

export const getCartridgeOptions = (worldAddress: string): ControllerOptions => {
  return {
    chains: [
      {
        rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia",
      },
      // REMOVED localhost:5050 - we're only using Sepolia
    ],
    defaultChainId: constants.StarknetChainId.SN_SEPOLIA,
    namespace: "rift_commanders",
    policies: {
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
    },
  };
};