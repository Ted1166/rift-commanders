import { useState } from 'react';
import { Swords, Shield } from 'lucide-react';
import Lobby from './components/game/Lobby';
import GameBoard from './components/game/GameBoard';

type GameScreen = 'lobby' | 'placement' | 'playing';

function App() {
  const [screen, setScreen] = useState<GameScreen>('lobby');
  const [gameId, setGameId] = useState<number | null>(null);
  const [playerNumber, setPlayerNumber] = useState<1 | 2>(1);

  const handleCreateGame = () => {
    const newGameId = Math.floor(Math.random() * 1000000);
    setGameId(newGameId);
    setPlayerNumber(1);
    setScreen('placement');
  };

  const handleJoinGame = (id: number) => {
    setGameId(id);
    setPlayerNumber(2);
    setScreen('placement');
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-black/80 backdrop-blur-sm border-b border-purple-500/30 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Swords className="w-8 h-8 text-purple-400" />
              <div>
                <h1 className="text-2xl font-bold text-white font-mono">RIFT COMMANDERS</h1>
                <div className="text-xs text-purple-400/60 font-mono">TACTICAL WARFARE SYSTEM</div>
              </div>
              <Shield className="w-8 h-8 text-pink-400" />
            </div>
            
            {gameId && (
              <div className="text-right">
                <div className="text-white/80 text-sm font-mono">MISSION #{gameId}</div>
                <div className="text-purple-400/60 text-xs font-mono">COMMANDER {playerNumber === 1 ? 'ALPHA' : 'BETA'}</div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          {screen === 'lobby' && (
            <Lobby 
              onCreateGame={handleCreateGame}
              onJoinGame={handleJoinGame}
            />
          )}

          {(screen === 'placement' || screen === 'playing') && gameId && (
            <GameBoard 
              gameId={gameId}
              playerNumber={playerNumber}
              phase={screen === 'placement' ? 'setup' : 'planning'}
              onPhaseComplete={() => setScreen('playing')}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;