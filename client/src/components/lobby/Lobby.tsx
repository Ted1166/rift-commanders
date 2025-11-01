import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount, useDisconnect } from '@starknet-react/core';
import { useGameActions } from '../../hooks';
import { Button, Card, StatusBar } from '../../components/ui';
import { formatAddress } from '../../utils';
import { MOCK_MODE } from '../../utils/mock';

export default function Lobby() {
  const navigate = useNavigate();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { createGame, joinGame, isLoading } = useGameActions();
  const [joinGameId, setJoinGameId] = useState('');

  const handleCreateGame = async () => {
    const txHash = await createGame();
    if (txHash) {
      // In production, parse game_id from events
      const mockGameId = Math.floor(Math.random() * 1000000);
      navigate(`/deploy/${mockGameId}`);
    }
  };

  const handleJoinGame = async () => {
    const gameId = parseInt(joinGameId);
    if (!isNaN(gameId) && gameId > 0) {
      const txHash = await joinGame(gameId);
      if (txHash) {
        navigate(`/deploy/${gameId}`);
      }
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  // Mock active games
  const activeGames = [
    { id: 123456, player: '0x1234...5678', time: '30s', type: 'RANKED' },
    { id: 789012, player: '0xabcd...ef01', time: '1m', type: 'CASUAL' },
    { id: 345678, player: '0x9999...1111', time: '2m', type: 'QUICK' },
  ];

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Top Bar */}
      <div className="border-b border-tactical-green/20 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-tactical-green font-bold text-xl uppercase tracking-wider">
              Rift Commanders
            </h1>
            <div className="w-2 h-2 bg-tactical-green rounded-full animate-pulse" />
            <span className="text-tactical-green/60 text-xs font-mono uppercase">Online</span>
          </div>
          <div className="flex items-center space-x-4">
            {address && (
              <>
                <span className="text-tactical-green text-sm font-mono">
                  {formatAddress(address)}
                </span>
                <Button size="sm" variant="secondary" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* MOCK MODE BANNER */}
      {MOCK_MODE && (
        <div className="bg-accent-yellow/10 border-b border-accent-yellow/30 px-6 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
            <span className="text-accent-yellow text-xs font-mono uppercase tracking-wider">
              ⚠️ Mock Mode Active - Frontend Testing (No Real Transactions)
            </span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-tactical-green text-glow-intense mb-3 uppercase tracking-wider">
            Command Center
          </h2>
          <p className="text-tactical-green/60 text-sm font-mono">
            Select your deployment mode
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Create Game */}
          <Card>
            <div className="flex items-start justify-between">
              <div className="flex-grow">
                <h3 className="text-tactical-green font-bold text-lg mb-2 uppercase tracking-wide">
                  Create Mission
                </h3>
                <p className="text-tactical-green/60 text-sm font-mono mb-4">
                  Initialize new tactical engagement. Deploy as Commander Alpha.
                </p>
                <div className="flex items-center space-x-4 text-xs font-mono mb-4">
                  <StatusBar label="Grid" value="5×5" />
                  <StatusBar label="Units" value="3" />
                  <StatusBar label="Mode" value="PVP" />
                </div>
              </div>
              <Button
                onClick={handleCreateGame}
                isLoading={isLoading}
                className="ml-4"
              >
                Create Game
              </Button>
            </div>
          </Card>

          {/* Join Game */}
          <Card>
            <div className="flex items-start justify-between">
              <div className="flex-grow">
                <h3 className="text-tactical-green font-bold text-lg mb-2 uppercase tracking-wide">
                  Join Mission
                </h3>
                <p className="text-tactical-green/60 text-sm font-mono mb-4">
                  Enter tactical operation ID. Deploy as Commander Beta.
                </p>
                <input
                  type="text"
                  placeholder="000000"
                  value={joinGameId}
                  onChange={(e) => setJoinGameId(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full max-w-xs bg-bg-primary border border-tactical-green/30 focus:border-tactical-green focus:outline-none px-4 py-2 text-tactical-green text-center font-mono rounded"
                  maxLength={6}
                />
              </div>
              <Button
                onClick={handleJoinGame}
                isLoading={isLoading}
                disabled={!joinGameId}
                className="ml-4"
              >
                Join Game
              </Button>
            </div>
          </Card>

          {/* Active Games */}
          <Card>
            <h3 className="text-tactical-green font-bold text-lg mb-4 uppercase tracking-wide">
              Active Battles
            </h3>
            <div className="space-y-2">
              {activeGames.map((game) => (
                <button
                  key={game.id}
                  onClick={() => navigate(`/deploy/${game.id}`)}
                  className="w-full bg-bg-primary border border-tactical-green/20 hover:border-tactical-green/50 rounded p-3 transition-all text-left"
                >
                  <div className="flex items-center justify-between text-sm font-mono">
                    <div>
                      <span className="text-tactical-green font-bold">#{game.id}</span>
                      <span className="text-tactical-green/50 ml-2 text-xs">{game.type}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs">
                      <span className="text-tactical-green/60">{game.player}</span>
                      <span className="text-tactical-green">{game.time}</span>
                      <span className="text-tactical-green uppercase">Available</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-tactical-green/20 flex items-center justify-between text-xs font-mono">
              <StatusBar label="Active" value="3" />
              <StatusBar label="Online" value="156" />
              <StatusBar label="Today" value="2.4K" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}