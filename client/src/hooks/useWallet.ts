import { useAccount, useConnect, useDisconnect } from '@starknet-react/core';

export function useWallet() {
  const { address, account, status } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';

  const handleConnect = async () => {
    const cartridgeConnector = connectors[0];
    if (cartridgeConnector) {
      connect({ connector: cartridgeConnector });
    }
  };

  return {
    address,
    account,
    isConnected,
    isConnecting,
    connect: handleConnect,
    disconnect,
  };
}