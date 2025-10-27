import { DojoProvider } from "@dojoengine/core";
import { RpcProvider } from "starknet";
import { dojoConfig } from "./config";
import manifest from "../../../public/manifest_sepolia.json";

export interface SetupResult {
  provider: RpcProvider;
  dojoProvider: DojoProvider;
}

export async function setup(): Promise<SetupResult> {
  // Create RPC provider
  const provider = new RpcProvider({
    nodeUrl: dojoConfig.rpcUrl,
  });

  // Create Dojo provider
  const dojoProvider = new DojoProvider(manifest as any, dojoConfig.worldAddress);

  return {
    provider,
    dojoProvider,
  };
}