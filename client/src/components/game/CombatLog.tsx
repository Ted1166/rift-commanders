import { useEffect, useRef } from 'react';
import { Swords, Shield, Activity, Skull, Zap } from 'lucide-react';

export interface LogEntry {
  id: number;
  type: 'move' | 'attack' | 'defend' | 'damage' | 'death' | 'rift';
  message: string;
  timestamp: number;
}

interface CombatLogProps {
  entries: LogEntry[];
}

export function CombatLog({ entries }: CombatLogProps) {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [entries]);

  const getIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'move':
        return <Activity className="w-4 h-4 text-tactical-green" />;
      case 'attack':
        return <Swords className="w-4 h-4 text-accent-red" />;
      case 'defend':
        return <Shield className="w-4 h-4 text-accent-blue" />;
      case 'damage':
        return <Zap className="w-4 h-4 text-accent-yellow" />;
      case 'death':
        return <Skull className="w-4 h-4 text-accent-red" />;
      case 'rift':
        return <Zap className="w-4 h-4 text-tactical-green" />;
      default:
        return null;
    }
  };

  const getColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'move':
        return 'text-tactical-green';
      case 'attack':
        return 'text-accent-red';
      case 'defend':
        return 'text-accent-blue';
      case 'damage':
        return 'text-accent-yellow';
      case 'death':
        return 'text-accent-red';
      case 'rift':
        return 'text-tactical-green';
      default:
        return 'text-tactical-green/60';
    }
  };

  return (
    <div className="border-2 border-tactical-green/30 rounded bg-bg-secondary p-4">
      <h3 className="text-tactical-green font-bold text-sm uppercase mb-3 tracking-wider flex items-center justify-between">
        <span>Combat Log</span>
        <span className="text-tactical-green/60 text-xs font-normal">
          {entries.length} Events
        </span>
      </h3>
      
      <div 
        ref={logRef}
        className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar"
      >
        {entries.length === 0 ? (
          <div className="text-center text-tactical-green/40 text-xs font-mono py-8">
            No events yet. Plan your moves to begin!
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start space-x-2 text-xs font-mono animate-fadeIn"
            >
              <div className="mt-0.5">{getIcon(entry.type)}</div>
              <div className="flex-grow">
                <p className={`${getColor(entry.type)} leading-relaxed`}>
                  {entry.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}