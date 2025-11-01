import { Connector } from "@starknet-react/core";
import { ControllerConnector } from "@cartridge/connector";
import type { ControllerOptions } from "@cartridge/controller";
import { constants } from "starknet";
import { manifest } from "./manifest";

const VITE_PUBLIC_DEPLOY_TYPE = import.meta.env.VITE_PUBLIC_DEPLOY_TYPE || "sepolia";

console.log("🌍 Deploy Type:", VITE_PUBLIC_DEPLOY_TYPE);

const getRpcUrl = () => {
  switch (VITE_PUBLIC_DEPLOY_TYPE) {
    case "localhost":
      return "http://localhost:5050"; // Katana localhost
    case "mainnet":
      return "https://api.cartridge.gg/x/starknet/mainnet";
    case "sepolia":
      return "https://api.cartridge.gg/x/starknet/sepolia";
    default:
      return "https://api.cartridge.gg/x/starknet/sepolia";
  }
};

const getDefaultChainId = () => {
  switch (VITE_PUBLIC_DEPLOY_TYPE) {
    case "localhost":
      return "0x4b4154414e41"; // KATANA in ASCII
    case "mainnet":
      return constants.StarknetChainId.SN_MAIN;
    case "sepolia":
      return constants.StarknetChainId.SN_SEPOLIA;
    default:
      return constants.StarknetChainId.SN_SEPOLIA;
  }
};

const getWorldAddress = () => {
  return manifest.contracts[0].address;
};

const WORLD_ADDRESS = getWorldAddress();
console.log("🎮 Using world contract address:", WORLD_ADDRESS);

// Define all game methods/entrypoints
const policies = {
  contracts: {
    [WORLD_ADDRESS]: {
      methods: [
        // Lobby Actions
        { name: "Create Game", entrypoint: "create_game" },
        { name: "Join Game", entrypoint: "join_game" },
        { name: "Start Game", entrypoint: "start_game" },
        
        // Setup Actions
        { name: "Place Units", entrypoint: "place_units" },
        { name: "Confirm Setup", entrypoint: "confirm_setup" },
        
        // Game Actions
        { name: "Commit Moves", entrypoint: "commit_moves" },
        { name: "Execute Turn", entrypoint: "execute_turn" },
        { name: "Resolve Combat", entrypoint: "resolve_combat" },
        
        // Rift Actions
        { name: "Trigger Rift", entrypoint: "trigger_rift" },
        { name: "Manual Rift", entrypoint: "manual_rift_trigger" },
      ],
    },
  },
};

const options: ControllerOptions = {
  chains: [{ rpcUrl: getRpcUrl() }],
  defaultChainId: getDefaultChainId(),
  policies,
  namespace: "rift_commanders",
  slot: "rift_commanders_slot",
};

const cartridgeConnector = new ControllerConnector(
  options
) as never as Connector;

export default cartridgeConnector;