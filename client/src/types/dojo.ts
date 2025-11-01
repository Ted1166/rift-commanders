import { AccountInterface } from 'starknet';

export interface DojoConfig {
  worldAddress: string;
  rpcUrl: string;
  toriiUrl: string;
  chainId: string;
}

export interface DojoContext {
  account: AccountInterface | null;
  isConnected: boolean;
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export interface SystemCall {
  contractAddress: string;
  entrypoint: string;
  calldata: any[];
}