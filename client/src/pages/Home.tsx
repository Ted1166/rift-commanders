import { useNavigate } from 'react-router-dom';
import { useAccount, useConnect, useDisconnect } from '@starknet-react/core';
import { Button } from '../components/ui';
import { formatAddress } from '../utils';
import { useState } from 'react';

export default function Home() {
  const navigate = useNavigate();
  const { address, status } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [showWallets, setShowWallets] = useState(false);

  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';

  const handleConnect = (connectorId: string) => {
    const connector = connectors.find((c) => c.id === connectorId);
    if (connector) {
      connect({ connector });
      setShowWallets(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="max-w-4xl w-full px-6">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-7xl font-bold text-tactical-green text-glow-intense tracking-wider mb-4">
            RIFT COMMANDERS
          </h1>
          <div className="flex items-center justify-center space-x-2 text-tactical-green/70 mb-6">
            <div className="w-2 h-2 bg-tactical-green rounded-full animate-pulse" />
            <span className="text-sm uppercase tracking-widest">
              Tactical Warfare on Starknet
            </span>
            <div className="w-2 h-2 bg-tactical-green rounded-full animate-pulse" />
          </div>
          <p className="text-tactical-green/60 text-sm font-mono max-w-2xl mx-auto leading-relaxed">
            Strategic turn-based combat on a 5×5 battlefield. Deploy your Commander, Warrior, and Archer.
            <br />
            Plan moves secretly. Execute simultaneously. Survive chaos rifts. Eliminate enemy commander to win.
          </p>
        </div>

        {/* Main Card */}
        <div className="border-2 border-tactical-green/30 border-glow rounded-lg p-8 bg-bg-secondary">
          {isConnected && address ? (
            <div className="text-center space-y-6">
              <div>
                <p className="text-tactical-green/60 text-xs uppercase mb-2 tracking-wider">
                  Connected Wallet
                </p>
                <p className="text-tactical-green font-mono text-lg font-bold">
                  {formatAddress(address)}
                </p>
              </div>
              <div className="flex gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/lobby')}
                  className="flex-1"
                >
                  Enter Command Center
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => disconnect()}
                >
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div>
                <h2 className="text-tactical-green text-2xl font-bold mb-2 uppercase tracking-wide">
                  Initialize System
                </h2>
                <p className="text-tactical-green/60 text-sm font-mono mb-4">
                  Connect your wallet to begin
                </p>
              </div>

              {!showWallets ? (
                <Button
                  size="lg"
                  onClick={() => setShowWallets(true)}
                  isLoading={isConnecting}
                  className="w-full"
                >
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </Button>
              ) : (
                <div className="space-y-3">
                  {connectors.map((connector) => (
                    <button
                      key={connector.id}
                      onClick={() => handleConnect(connector.id)}
                      disabled={isConnecting}
                      className="w-full border-2 border-tactical-green/30 bg-bg-primary hover:border-tactical-green/60 hover:bg-tactical-green/5 text-tactical-green font-mono py-4 px-6 rounded transition-all disabled:opacity-50 flex items-center justify-between group"
                    >
                      <span className="uppercase tracking-wider font-bold">
                        {connector.name}
                      </span>
                      <span className="text-tactical-green/60 text-xs group-hover:text-tactical-green transition-colors">
                        {connector.id.includes('controller') && '🎮 Best for Gaming'}
                        {connector.id === 'argentX' && '🦊 Most Popular'}
                        {connector.id === 'braavos' && '⚡ Fast & Secure'}
                      </span>
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setShowWallets(false)}
                    className="w-full text-tactical-green/60 text-sm font-mono hover:text-tactical-green transition-colors py-2"
                  >
                    ← Back
                  </button>
                </div>
              )}

              <p className="text-tactical-green/40 text-xs font-mono">
                Supports Cartridge Controller, Argent X, and Braavos
              </p>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="border border-tactical-green/20 rounded p-4 bg-bg-secondary">
            <h3 className="text-tactical-green font-mono text-sm uppercase mb-2">⚔️ Strategic</h3>
            <p className="text-tactical-green/60 text-xs">Plan your moves carefully. Every decision matters.</p>
          </div>
          <div className="border border-tactical-green/20 rounded p-4 bg-bg-secondary">
            <h3 className="text-tactical-green font-mono text-sm uppercase mb-2">⚡ Simultaneous</h3>
            <p className="text-tactical-green/60 text-xs">Actions execute at once. Predict your opponent.</p>
          </div>
          <div className="border border-tactical-green/20 rounded p-4 bg-bg-secondary">
            <h3 className="text-tactical-green font-mono text-sm uppercase mb-2">🌀 Chaotic</h3>
            <p className="text-tactical-green/60 text-xs">Chaos rifts change terrain. Adapt or perish.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-tactical-green/50 text-xs font-mono">
          <p>POWERED BY DOJO ENGINE • STARKNET SEPOLIA</p>
        </div>
      </div>
    </div>
  );
}