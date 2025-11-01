import { Trophy, Skull, RotateCcw, Home } from 'lucide-react';
import { Button } from '../../components/ui';

interface GameOverModalProps {
  isOpen: boolean;
  winner: 'player' | 'opponent' | null;
  playerKills: number;
  opponentKills: number;
  turnsPlayed: number;
  damageDealt: number;
  onPlayAgain: () => void;
  onReturnToLobby: () => void;
}

export function GameOverModal({
  isOpen,
  winner,
  playerKills,
  opponentKills,
  turnsPlayed,
  damageDealt,
  onPlayAgain,
  onReturnToLobby,
}: GameOverModalProps) {
  if (!isOpen) return null;

  const isVictory = winner === 'player';

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fadeIn">
      <div className="max-w-2xl w-full mx-4">
        <div className={`
          border-4 rounded-lg p-8
          ${isVictory 
            ? 'border-tactical-green bg-tactical-green/10' 
            : 'border-accent-red bg-accent-red/10'}
        `}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              {isVictory ? (
                <div className="w-24 h-24 border-4 border-tactical-green rounded-full bg-tactical-green/20 flex items-center justify-center animate-pulse-glow">
                  <Trophy className="w-12 h-12 text-tactical-green" />
                </div>
              ) : (
                <div className="w-24 h-24 border-4 border-accent-red rounded-full bg-accent-red/20 flex items-center justify-center">
                  <Skull className="w-12 h-12 text-accent-red" />
                </div>
              )}
            </div>
            
            <h2 className={`
              text-5xl font-bold uppercase tracking-wider mb-2
              ${isVictory ? 'text-tactical-green text-glow-intense' : 'text-accent-red'}
            `}>
              {isVictory ? 'VICTORY' : 'DEFEAT'}
            </h2>
            
            <p className="text-tactical-green/60 text-lg font-mono">
              {isVictory 
                ? 'Mission Accomplished - Enemy Commander Eliminated!' 
                : 'Mission Failed - Your Commander Has Fallen'}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="border-2 border-tactical-green/30 rounded p-4 bg-bg-secondary text-center">
              <div className="text-tactical-green/60 text-xs uppercase mb-2 font-mono">
                Turns Survived
              </div>
              <div className="text-tactical-green text-3xl font-bold">
                {turnsPlayed}
              </div>
            </div>

            <div className="border-2 border-tactical-green/30 rounded p-4 bg-bg-secondary text-center">
              <div className="text-tactical-green/60 text-xs uppercase mb-2 font-mono">
                Damage Dealt
              </div>
              <div className="text-accent-red text-3xl font-bold">
                {damageDealt}
              </div>
            </div>

            <div className="border-2 border-tactical-green/30 rounded p-4 bg-bg-secondary text-center">
              <div className="text-tactical-green/60 text-xs uppercase mb-2 font-mono">
                Your Kills
              </div>
              <div className="text-tactical-green text-3xl font-bold">
                {playerKills}
              </div>
            </div>

            <div className="border-2 border-tactical-green/30 rounded p-4 bg-bg-secondary text-center">
              <div className="text-tactical-green/60 text-xs uppercase mb-2 font-mono">
                Enemy Kills
              </div>
              <div className="text-accent-red text-3xl font-bold">
                {opponentKills}
              </div>
            </div>
          </div>

          {/* Performance Rating */}
          <div className="border-2 border-tactical-green/30 rounded p-6 bg-bg-secondary mb-8">
            <h3 className="text-tactical-green font-bold text-sm uppercase mb-4 tracking-wider text-center">
              Mission Performance
            </h3>
            <div className="flex items-center justify-center space-x-2">
              {Array.from({ length: 5 }).map((_, i) => {
                const rating = Math.floor((playerKills / Math.max(playerKills + opponentKills, 1)) * 5);
                return (
                  <div
                    key={i}
                    className={`w-8 h-8 border-2 rounded ${
                      i < rating
                        ? 'border-tactical-green bg-tactical-green/30'
                        : 'border-tactical-green/30 bg-bg-tertiary'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={onPlayAgain}
              variant="primary"
              size="lg"
              className="flex-1 flex items-center justify-center space-x-2"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Play Again</span>
            </Button>
            <Button
              onClick={onReturnToLobby}
              variant="secondary"
              size="lg"
              className="flex-1 flex items-center justify-center space-x-2"
            >
              <Home className="w-5 h-5" />
              <span>Return to Lobby</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}