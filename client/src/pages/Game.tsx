import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAccount } from '@starknet-react/core';
import { useGameActions } from '../hooks';
import { Button, Card, StatusBar } from '../components/ui';
import { formatAddress } from '../utils';
import { MOCK_MODE } from '../utils/mock';
import { Crown, Sword, Target, Zap, Shield, Activity } from 'lucide-react';
import { CombatLog, type LogEntry } from '../components/game/CombatLog';
import { GameStats, GameOverModal } from '../components/game';


type UnitType = 'commander' | 'warrior' | 'archer';
type ActionType = 'move' | 'attack' | 'defend';

interface Unit {
  id: number;
  type: UnitType;
  owner: 'player' | 'opponent';
  health: number;
  maxHealth: number;
  position: { row: number; col: number };
  hasMoved: boolean;
}

interface PlannedMove {
  unitId: number;
  action: ActionType;
  targetRow?: number;
  targetCol?: number;
}

const UNIT_STATS = {
  commander: { health: 20, attack: 5, defense: 3, range: 1, icon: Crown },
  warrior: { health: 15, attack: 7, defense: 2, range: 1, icon: Sword },
  archer: { health: 10, attack: 6, defense: 1, range: 2, icon: Target },
};

export default function Game() {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const { address } = useAccount();
  const { commitMoves, executeTurn, isLoading } = useGameActions();

  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);
  const [plannedMoves, setPlannedMoves] = useState<PlannedMove[]>([]);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [phase, setPhase] = useState<'planning' | 'executing' | 'waiting'>('planning');
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<'player' | 'opponent' | null>(null);
  const [totalDamage, setTotalDamage] = useState(0);

  // Mock units for demo
  const [units, setUnits] = useState<Unit[]>([
    // Player units (bottom rows)
    { id: 1, type: 'commander', owner: 'player', health: 20, maxHealth: 20, position: { row: 4, col: 2 }, hasMoved: false },
    { id: 2, type: 'warrior', owner: 'player', health: 15, maxHealth: 15, position: { row: 3, col: 1 }, hasMoved: false },
    { id: 3, type: 'archer', owner: 'player', health: 10, maxHealth: 10, position: { row: 3, col: 3 }, hasMoved: false },
    // Opponent units (top rows)
    { id: 4, type: 'commander', owner: 'opponent', health: 20, maxHealth: 20, position: { row: 0, col: 2 }, hasMoved: false },
    { id: 5, type: 'warrior', owner: 'opponent', health: 15, maxHealth: 15, position: { row: 1, col: 1 }, hasMoved: false },
    { id: 6, type: 'archer', owner: 'opponent', health: 10, maxHealth: 10, position: { row: 1, col: 3 }, hasMoved: false },
  ]);

  const [combatLog, setCombatLog] = useState<LogEntry[]>([
    { id: 1, type: 'move', message: 'Game started. Plan your first move!', timestamp: Date.now() }
    ]);

  const grid = Array(5).fill(null).map((_, row) =>
    Array(5).fill(null).map((_, col) => ({ row, col }))
  );

  const getUnitAt = (row: number, col: number) => {
    return units.find(u => u.position.row === row && u.position.col === col);
  };

  const handleCellClick = (row: number, col: number) => {
    if (phase !== 'planning') return;

    const clickedUnit = getUnitAt(row, col);

    // Select unit
    if (clickedUnit && clickedUnit.owner === 'player' && !clickedUnit.hasMoved) {
      setSelectedUnit(clickedUnit);
      setSelectedAction(null);
      return;
    }

    // Execute action
    if (selectedUnit && selectedAction) {
      const newMove: PlannedMove = {
        unitId: selectedUnit.id,
        action: selectedAction,
        targetRow: row,
        targetCol: col,
      };

      setPlannedMoves(prev => [...prev.filter(m => m.unitId !== selectedUnit.id), newMove]);
      
      // Mark unit as having moved
      setUnits(prev => prev.map(u => 
        u.id === selectedUnit.id ? { ...u, hasMoved: true } : u
      ));

      setSelectedUnit(null);
      setSelectedAction(null);
    }
  };

  const handleCommitMoves = async () => {
    if (plannedMoves.length === 0) return;

    const moves = plannedMoves.map(m => ({
        unit_id: m.unitId,
        action: m.action,
        target_x: m.targetCol ?? 0,
        target_y: m.targetRow ?? 0,
    }));

    const txHash = await commitMoves(parseInt(gameId!), moves);
    if (txHash) {
        setCombatLog(prev => [...prev, {
        id: Date.now(),
        type: 'move',
        message: `You committed ${plannedMoves.length} move(s). Waiting for opponent...`,
        timestamp: Date.now()
        }]);
        setPhase('waiting');
    }
    };

  const handleExecuteTurn = async () => {
    const txHash = await executeTurn(parseInt(gameId!));
    if (txHash) {
        setPhase('executing');
        
        setCombatLog(prev => [...prev, {
        id: Date.now(),
        type: 'attack',
        message: '⚔️ Turn executing... Resolving combat!',
        timestamp: Date.now()
        }]);

        // Simulate combat
        setTimeout(() => {
        // Random damage simulation
        const damage1 = Math.floor(Math.random() * 8) + 3;
        const damage2 = Math.floor(Math.random() * 6) + 2;
        
        setCombatLog(prev => [...prev, 
            {
            id: Date.now() + 1,
            type: 'damage',
            message: `Your Warrior attacked Enemy Archer for ${damage1} damage!`,
            timestamp: Date.now()
            },
            {
            id: Date.now() + 2,
            type: 'damage',
            message: `Enemy Commander attacked your Warrior for ${damage2} damage!`,
            timestamp: Date.now()
            }
        ]);

        setTotalDamage(prev => prev + damage1);

        // Update unit health
        setUnits(prev => prev.map(u => {
            if (u.id === 6 && u.owner === 'opponent') {
            const newHealth = Math.max(0, u.health - damage1);
            return { ...u, health: newHealth };
            }
            if (u.id === 2 && u.owner === 'player') {
            const newHealth = Math.max(0, u.health - damage2);
            return { ...u, health: newHealth };
            }
            return u;
        }));

        // Check for game over (commander dead)
        setTimeout(() => {
            const playerCommander = units.find(u => u.type === 'commander' && u.owner === 'player');
            const opponentCommander = units.find(u => u.type === 'commander' && u.owner === 'opponent');

            if (playerCommander && playerCommander.health <= 0) {
            setWinner('opponent');
            setGameOver(true);
            setCombatLog(prev => [...prev, {
                id: Date.now() + 3,
                type: 'death',
                message: '💀 Your Commander has fallen! DEFEAT!',
                timestamp: Date.now()
            }]);
            } else if (opponentCommander && opponentCommander.health <= 0) {
            setWinner('player');
            setGameOver(true);
            setCombatLog(prev => [...prev, {
                id: Date.now() + 3,
                type: 'death',
                message: '🎉 Enemy Commander eliminated! VICTORY!',
                timestamp: Date.now()
            }]);
            } else {
            setCombatLog(prev => [...prev, {
                id: Date.now() + 3,
                type: 'move',
                message: 'Turn complete! Planning next turn...',
                timestamp: Date.now()
            }]);
            setCurrentTurn(prev => prev + 1);
            setPhase('planning');
            setPlannedMoves([]);
            setUnits(prev => prev.map(u => ({ ...u, hasMoved: false })));
            }
        }, 1000);
        }, 2000);
    }
    };

  const playerUnits = units.filter(u => u.owner === 'player' && u.health > 0);
  const opponentUnits = units.filter(u => u.owner === 'opponent' && u.health > 0);
  const handlePlayAgain = () => {
      navigate('/lobby');
    };

    const handleReturnToLobby = () => {
      navigate('/lobby');
    };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Top Bar */}
      <div className="border-b border-tactical-green/20 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-tactical-green font-bold text-xl uppercase tracking-wider">
              Tactical Combat
            </h1>
            <span className="text-tactical-green/60 text-sm font-mono">
              Game #{gameId} • Turn {currentTurn}
            </span>
          </div>
          {address && (
            <span className="text-tactical-green text-sm font-mono">
              {formatAddress(address)}
            </span>
          )}
        </div>
      </div>

      {/* MOCK MODE BANNER */}
      {MOCK_MODE && (
        <div className="bg-accent-yellow/10 border-b border-accent-yellow/30 px-6 py-2">
          <div className="max-w-7xl mx-auto text-center">
            <span className="text-accent-yellow text-xs font-mono uppercase tracking-wider">
              ⚠️ Mock Mode - Frontend Testing Only
            </span>
          </div>
        </div>
      )}

      {/* Phase Banner */}
      <div className={`
        border-b px-6 py-2
        ${phase === 'planning' ? 'bg-tactical-green/10 border-tactical-green/30' : ''}
        ${phase === 'waiting' ? 'bg-accent-blue/10 border-accent-blue/30' : ''}
        ${phase === 'executing' ? 'bg-accent-red/10 border-accent-red/30' : ''}
      `}>
        <div className="max-w-7xl mx-auto text-center">
          <span className={`
            text-xs font-mono uppercase tracking-wider font-bold
            ${phase === 'planning' ? 'text-tactical-green' : ''}
            ${phase === 'waiting' ? 'text-accent-blue' : ''}
            ${phase === 'executing' ? 'text-accent-red' : ''}
          `}>
            {phase === 'planning' && '📋 Planning Phase - Plan Your Moves'}
            {phase === 'waiting' && '⏳ Waiting for Opponent...'}
            {phase === 'executing' && '⚔️ Executing Turn...'}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Panel - Player Units */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <h3 className="text-tactical-green font-bold text-sm uppercase mb-4 tracking-wider">
                Your Forces
              </h3>
              <div className="space-y-2">
                {playerUnits.map((unit) => {
                  const stats = UNIT_STATS[unit.type];
                  const UnitIcon = stats.icon;
                  const isSelected = selectedUnit?.id === unit.id;
                  const hasPlannedMove = plannedMoves.some(m => m.unitId === unit.id);

                  return (
                    <button
                      key={unit.id}
                      onClick={() => !unit.hasMoved && setSelectedUnit(unit)}
                      disabled={unit.hasMoved || phase !== 'planning'}
                      className={`
                        w-full border-2 rounded p-3 transition-all text-left
                        ${isSelected 
                          ? 'border-tactical-green bg-tactical-green/20 border-glow' 
                          : hasPlannedMove
                          ? 'border-tactical-green/50 bg-tactical-green/10'
                          : unit.hasMoved
                          ? 'border-tactical-green/20 bg-bg-primary opacity-50 cursor-not-allowed'
                          : 'border-tactical-green/30 bg-bg-primary hover:border-tactical-green/60'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`
                          w-8 h-8 border-2 rounded-full flex items-center justify-center
                          ${isSelected ? 'border-tactical-green bg-tactical-green/20' : 'border-tactical-green/50 bg-tactical-green/10'}
                        `}>
                          <UnitIcon className="w-4 h-4 text-tactical-green" />
                        </div>
                        <div className="flex-grow">
                          <h4 className="text-tactical-green text-xs font-bold uppercase">
                            {unit.type}
                          </h4>
                          {hasPlannedMove && (
                            <span className="text-tactical-green/60 text-[10px]">✓ Move Planned</span>
                          )}
                          {unit.hasMoved && !hasPlannedMove && (
                            <span className="text-tactical-green/40 text-[10px]">Moved</span>
                          )}
                        </div>
                      </div>
                      {/* Health Bar */}
                      <div className="mb-2">
                        <div className="flex justify-between text-[10px] font-mono mb-1">
                          <span className="text-tactical-green/60">HP</span>
                          <span className="text-tactical-green">{unit.health}/{unit.maxHealth}</span>
                        </div>
                        <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-tactical-green transition-all"
                            style={{ width: `${(unit.health / unit.maxHealth) * 100}%` }}
                          />
                        </div>
                      </div>
                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-1 text-[10px] font-mono">
                        <div className="text-center">
                          <div className="text-tactical-green/60">ATK</div>
                          <div className="text-tactical-green font-bold">{stats.attack}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-tactical-green/60">DEF</div>
                          <div className="text-tactical-green font-bold">{stats.defense}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-tactical-green/60">RNG</div>
                          <div className="text-tactical-green font-bold">{stats.range}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Actions */}
            {selectedUnit && phase === 'planning' && (
              <Card>
                <h3 className="text-tactical-green font-bold text-sm uppercase mb-4 tracking-wider">
                  Actions
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedAction('move')}
                    className={`
                      w-full border-2 rounded p-3 flex items-center space-x-3 transition-all
                      ${selectedAction === 'move' 
                        ? 'border-tactical-green bg-tactical-green/20' 
                        : 'border-tactical-green/30 hover:border-tactical-green/60'}
                    `}
                  >
                    <Activity className="w-5 h-5 text-tactical-green" />
                    <span className="text-tactical-green text-sm font-bold uppercase">Move</span>
                  </button>
                  <button
                    onClick={() => setSelectedAction('attack')}
                    className={`
                      w-full border-2 rounded p-3 flex items-center space-x-3 transition-all
                      ${selectedAction === 'attack' 
                        ? 'border-accent-red bg-accent-red/20' 
                        : 'border-accent-red/30 hover:border-accent-red/60'}
                    `}
                  >
                    <Zap className="w-5 h-5 text-accent-red" />
                    <span className="text-accent-red text-sm font-bold uppercase">Attack</span>
                  </button>
                  <button
                    onClick={() => setSelectedAction('defend')}
                    className={`
                      w-full border-2 rounded p-3 flex items-center space-x-3 transition-all
                      ${selectedAction === 'defend' 
                        ? 'border-accent-blue bg-accent-blue/20' 
                        : 'border-accent-blue/30 hover:border-accent-blue/60'}
                    `}
                  >
                    <Shield className="w-5 h-5 text-accent-blue" />
                    <span className="text-accent-blue text-sm font-bold uppercase">Defend</span>
                  </button>
                </div>
              </Card>
            )}

            {/* Commit Button */}
            <Button
              onClick={handleCommitMoves}
              disabled={plannedMoves.length === 0 || phase !== 'planning' || isLoading}
              isLoading={isLoading}
              className="w-full"
              size="lg"
            >
              {plannedMoves.length === 0 
                ? 'Plan Moves First' 
                : `Commit ${plannedMoves.length} Move${plannedMoves.length > 1 ? 's' : ''}`}
            </Button>
          </div>

          {/* Center - Battlefield */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-tactical-green font-bold text-sm uppercase tracking-wider">
                  Battlefield - 5×5 Grid
                </h3>
                <div className="flex items-center space-x-4 text-xs font-mono">
                  <StatusBar label="Turn" value={currentTurn} color="green" />
                  <StatusBar label="Phase" value={phase} color="blue" />
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {grid.map((row, rowIndex) =>
                  row.map((cell) => {
                    const unit = getUnitAt(cell.row, cell.col);
                    const UnitIcon = unit ? UNIT_STATS[unit.type].icon : null;
                    const isPlayerTerritory = cell.row >= 3;
                    const isOpponentTerritory = cell.row <= 1;
                    const isTargeted = selectedUnit && selectedAction && 
                      plannedMoves.some(m => m.unitId === selectedUnit.id && m.targetRow === cell.row && m.targetCol === cell.col);

                    return (
                      <button
                        key={`${cell.row}-${cell.col}`}
                        onClick={() => handleCellClick(cell.row, cell.col)}
                        className={`
                          aspect-square border-2 rounded relative transition-all
                          ${isTargeted ? 'border-tactical-green bg-tactical-green/30 border-glow' : ''}
                          ${unit 
                            ? unit.owner === 'player' 
                              ? 'border-tactical-green bg-tactical-green/20 cursor-pointer hover:bg-tactical-green/30' 
                              : 'border-accent-red bg-accent-red/20 cursor-pointer hover:bg-accent-red/30'
                            : isPlayerTerritory
                            ? 'border-tactical-green/30 bg-tactical-green/5 cursor-pointer hover:bg-tactical-green/10'
                            : isOpponentTerritory
                            ? 'border-accent-red/30 bg-accent-red/5 cursor-pointer hover:bg-accent-red/10'
                            : 'border-tactical-green/20 bg-bg-tertiary cursor-pointer hover:bg-tactical-green/5'
                          }
                        `}
                      >
                        {/* Unit Icon */}
                        {UnitIcon && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className={`
                              w-10 h-10 border-2 rounded-full flex items-center justify-center
                              ${unit?.owner === 'player' 
                                ? 'border-tactical-green bg-tactical-green/30' 
                                : 'border-accent-red bg-accent-red/30'}
                            `}>
                              <UnitIcon className={`
                                w-5 h-5 
                                ${unit?.owner === 'player' ? 'text-tactical-green' : 'text-accent-red'}
                              `} />
                            </div>
                          </div>
                        )}

                        {/* Health indicator */}
                        {unit && (
                          <div className="absolute bottom-1 left-1 right-1">
                            <div className="h-1 bg-bg-tertiary rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${unit.owner === 'player' ? 'bg-tactical-green' : 'bg-accent-red'}`}
                                style={{ width: `${(unit.health / unit.maxHealth) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Coordinates */}
                        <span className="absolute top-1 left-1 text-[8px] text-tactical-green/30 font-mono">
                          {cell.row},{cell.col}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Legend */}
              <div className="mt-4 flex items-center justify-center space-x-6 text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-tactical-green bg-tactical-green/20 rounded"></div>
                  <span className="text-tactical-green/60">Your Units</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-accent-red bg-accent-red/20 rounded"></div>
                  <span className="text-tactical-green/60">Enemy Units</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Panel - Opponent Units */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <h3 className="text-accent-red font-bold text-sm uppercase mb-4 tracking-wider">
                Enemy Forces
              </h3>
              <div className="space-y-2">
                {opponentUnits.map((unit) => {
                  const stats = UNIT_STATS[unit.type];
                  const UnitIcon = stats.icon;

                  return (
                    <div
                      key={unit.id}
                      className="border-2 border-accent-red/30 bg-bg-primary rounded p-3"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 border-2 border-accent-red/50 bg-accent-red/10 rounded-full flex items-center justify-center">
                          <UnitIcon className="w-4 h-4 text-accent-red" />
                        </div>
                        <div className="flex-grow">
                          <h4 className="text-accent-red text-xs font-bold uppercase">
                            {unit.type}
                          </h4>
                        </div>
                      </div>
                      {/* Health Bar */}
                      <div className="mb-2">
                        <div className="flex justify-between text-[10px] font-mono mb-1">
                          <span className="text-tactical-green/60">HP</span>
                          <span className="text-accent-red">{unit.health}/{unit.maxHealth}</span>
                        </div>
                        <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-accent-red transition-all"
                            style={{ width: `${(unit.health / unit.maxHealth) * 100}%` }}
                          />
                        </div>
                      </div>
                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-1 text-[10px] font-mono">
                        <div className="text-center">
                          <div className="text-tactical-green/60">ATK</div>
                          <div className="text-accent-red font-bold">{stats.attack}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-tactical-green/60">DEF</div>
                          <div className="text-accent-red font-bold">{stats.defense}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-tactical-green/60">RNG</div>
                          <div className="text-accent-red font-bold">{stats.range}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

           {/* Combat Log */}
            <CombatLog entries={combatLog} />

            {/* Game Stats */}
            <GameStats 
                playerKills={units.filter(u => u.owner === 'opponent' && u.health <= 0).length}
                opponentKills={units.filter(u => u.owner === 'player' && u.health <= 0).length}
                turnsPlayed={currentTurn}
                damageDealt={totalDamage}
                />

            {/* Turn Actions */}
            {phase === 'waiting' && (
            <Card>
                <p className="text-tactical-green/60 text-center text-xs font-mono mb-3">
                Waiting for opponent to commit moves...
                </p>
                <Button
                onClick={handleExecuteTurn}
                disabled={isLoading}
                isLoading={isLoading}
                className="w-full"
                size="sm"
                >
                Execute Turn (Mock)
                </Button>
            </Card>
            )}

            {/* Game Controls */}
            <div className="space-y-2">
              <Button
                onClick={() => navigate('/lobby')}
                variant="secondary"
                className="w-full"
                size="sm"
              >
                Return to Lobby
              </Button>

              {/* Game Over Modal */}
              <GameOverModal
                isOpen={gameOver}
                winner={winner}
                playerKills={units.filter(u => u.owner === 'opponent' && u.health <= 0).length}
                opponentKills={units.filter(u => u.owner === 'player' && u.health <= 0).length}
                turnsPlayed={currentTurn}
                damageDealt={totalDamage}
                onPlayAgain={handlePlayAgain}
                onReturnToLobby={handleReturnToLobby}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}