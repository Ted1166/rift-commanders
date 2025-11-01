import { Trophy, Target, Skull, Zap } from 'lucide-react';
import { StatusBar } from '../../components/ui';

interface GameStatsProps {
  playerKills: number;
  opponentKills: number;
  turnsPlayed: number;
  damageDealt: number;
}

export function GameStats({ playerKills, opponentKills, turnsPlayed, damageDealt }: GameStatsProps) {
  return (
    <div className="border-2 border-tactical-green/30 rounded bg-bg-secondary p-4">
      <h3 className="text-tactical-green font-bold text-sm uppercase mb-4 tracking-wider">
        Battle Statistics
      </h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-tactical-green" />
            <span className="text-tactical-green/60">Turns Survived</span>
          </div>
          <span className="text-tactical-green font-bold">{turnsPlayed}</span>
        </div>

        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-accent-red" />
            <span className="text-tactical-green/60">Damage Dealt</span>
          </div>
          <span className="text-accent-red font-bold">{damageDealt}</span>
        </div>

        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2">
            <Skull className="w-4 h-4 text-tactical-green" />
            <span className="text-tactical-green/60">Your Kills</span>
          </div>
          <span className="text-tactical-green font-bold">{playerKills}</span>
        </div>

        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2">
            <Skull className="w-4 h-4 text-accent-red" />
            <span className="text-tactical-green/60">Enemy Kills</span>
          </div>
          <span className="text-accent-red font-bold">{opponentKills}</span>
        </div>

        <div className="pt-3 border-t border-tactical-green/20">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-accent-yellow" />
              <span className="text-tactical-green/60">Kill Score</span>
            </div>
            <span className="text-accent-yellow font-bold">
              {playerKills - opponentKills > 0 ? '+' : ''}{playerKills - opponentKills}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}