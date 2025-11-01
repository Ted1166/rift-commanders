import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAccount } from '@starknet-react/core';
import { useGameActions } from '../hooks';
import { Button, Card } from '../components/ui';
import { formatAddress } from '../utils';
import { Crown, Sword, Target } from 'lucide-react';
import { MOCK_MODE } from '../utils/mock';

type UnitType = 'commander' | 'warrior' | 'archer';

interface PlacedUnit {
  type: UnitType;
  row: number;
  col: number;
}

const UNIT_STATS = {
  commander: { health: 20, attack: 5, defense: 3, range: 1, icon: Crown },
  warrior: { health: 15, attack: 7, defense: 2, range: 1, icon: Sword },
  archer: { health: 10, attack: 6, defense: 1, range: 2, icon: Target },
};

export default function Deploy() {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const { address } = useAccount();
  const { placeUnits, isLoading } = useGameActions();

  const [selectedUnit, setSelectedUnit] = useState<UnitType | null>(null);
  const [placedUnits, setPlacedUnits] = useState<PlacedUnit[]>([]);

  // 5x5 grid
  const grid = Array(5).fill(null).map((_, row) =>
    Array(5).fill(null).map((_, col) => ({ row, col }))
  );

  // Deployment zones: rows 3-4 for player 1
  const isDeploymentZone = (row: number) => row === 3 || row === 4;

  const handleCellClick = (row: number, col: number) => {
    if (!selectedUnit || !isDeploymentZone(row)) return;

    // Check if cell is already occupied
    const isOccupied = placedUnits.some(u => u.row === row && u.col === col);
    if (isOccupied) return;

    // Check if unit type already placed
    const alreadyPlaced = placedUnits.some(u => u.type === selectedUnit);
    if (alreadyPlaced) {
      // Remove old placement
      setPlacedUnits(prev => prev.filter(u => u.type !== selectedUnit));
    }

    // Place unit
    setPlacedUnits(prev => [...prev, { type: selectedUnit, row, col }]);
    setSelectedUnit(null);
  };

  const handleConfirm = async () => {
    if (placedUnits.length !== 3) {
      alert('Please place all 3 units before confirming!');
      return;
    }

    const positions = placedUnits.map(u => ({
      x: u.col,
      y: u.row,
      unitType: u.type === 'commander' ? 0 : u.type === 'warrior' ? 1 : 2,
    }));

    const txHash = await placeUnits(parseInt(gameId!), positions);
    if (txHash) {
      navigate(`/game/${gameId}`);
    }
  };

  const getUnitAtPosition = (row: number, col: number) => {
    return placedUnits.find(u => u.row === row && u.col === col);
  };

  const availableUnits: UnitType[] = ['commander', 'warrior', 'archer'];

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Top Bar */}
      <div className="border-b border-tactical-green/20 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-tactical-green font-bold text-xl uppercase tracking-wider">
              Unit Deployment
            </h1>
            <span className="text-tactical-green/60 text-sm font-mono">
              Game #{gameId}
            </span>
          </div>
          {address && (
            <span className="text-tactical-green text-sm font-mono">
              {formatAddress(address)}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-6">
          <p className="text-tactical-green/60 text-sm font-mono">
            Deploy your 3 units on the bottom 2 rows
          </p>
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Unit Selection Panel */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <h3 className="text-tactical-green font-bold text-sm uppercase mb-4 tracking-wider">
                Available Units
              </h3>
              <p className="text-tactical-green/60 text-xs font-mono mb-4">
                Deployed: {placedUnits.length}/3
              </p>

              <div className="space-y-3">
                {availableUnits.map((unitType) => {
                  const stats = UNIT_STATS[unitType];
                  const UnitIcon = stats.icon;
                  const isPlaced = placedUnits.some(u => u.type === unitType);
                  const isSelected = selectedUnit === unitType;

                  return (
                    <button
                      key={unitType}
                      onClick={() => setSelectedUnit(unitType)}
                      className={`
                        w-full border-2 rounded p-3 transition-all text-left
                        ${isSelected 
                          ? 'border-tactical-green bg-tactical-green/20 border-glow' 
                          : isPlaced
                          ? 'border-tactical-green/30 bg-tactical-green/5'
                          : 'border-tactical-green/30 bg-bg-primary hover:border-tactical-green/60'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`
                          w-10 h-10 border-2 rounded-full flex items-center justify-center
                          ${isPlaced ? 'border-tactical-green/50 bg-tactical-green/10' : 'border-tactical-green bg-tactical-green/20'}
                        `}>
                          <UnitIcon className="w-5 h-5 text-tactical-green" />
                        </div>
                        <div className="flex-grow">
                          <h4 className="text-tactical-green text-sm font-bold uppercase">
                            {unitType}
                          </h4>
                          {isPlaced && (
                            <span className="text-tactical-green/60 text-xs">✓ Placed</span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs font-mono">
                        <div className="text-center">
                          <div className="text-tactical-green/60">HP</div>
                          <div className="text-tactical-green font-bold">{stats.health}</div>
                        </div>
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

              {selectedUnit && (
                <div className="mt-4 p-3 border border-tactical-green/30 rounded bg-tactical-green/5">
                  <p className="text-tactical-green text-xs font-mono">
                    Click a green tile to place {selectedUnit}
                  </p>
                </div>
              )}
            </Card>

            <Button
              onClick={handleConfirm}
              disabled={placedUnits.length !== 3 || isLoading}
              isLoading={isLoading}
              className="w-full"
              size="lg"
            >
              {placedUnits.length === 3 ? 'Confirm Deployment' : `Place ${3 - placedUnits.length} more`}
            </Button>
          </div>

          {/* Battlefield Grid */}
          <div className="lg:col-span-3">
            <Card>
              <h3 className="text-tactical-green font-bold text-sm uppercase mb-4 tracking-wider">
                Battlefield - 5×5 Grid
              </h3>

              <div className="grid grid-cols-5 gap-3 max-w-2xl mx-auto">
                {grid.map((row, rowIndex) =>
                  row.map((cell) => {
                    const isDeploy = isDeploymentZone(cell.row);
                    const unit = getUnitAtPosition(cell.row, cell.col);
                    const UnitIcon = unit ? UNIT_STATS[unit.type].icon : null;

                    return (
                      <button
                        key={`${cell.row}-${cell.col}`}
                        onClick={() => handleCellClick(cell.row, cell.col)}
                        disabled={!isDeploy && !unit}
                        className={`
                          aspect-square border-2 rounded relative transition-all
                          ${isDeploy 
                            ? 'border-tactical-green bg-tactical-green/10 hover:bg-tactical-green/20 cursor-pointer' 
                            : 'border-tactical-green/20 bg-bg-tertiary cursor-not-allowed opacity-50'
                          }
                          ${unit ? 'border-tactical-green border-glow' : ''}
                        `}
                      >
                        {/* Unit Icon */}
                        {UnitIcon && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 border-2 border-tactical-green rounded-full bg-tactical-green/20 flex items-center justify-center">
                              <UnitIcon className="w-6 h-6 text-tactical-green" />
                            </div>
                          </div>
                        )}

                        {/* Coordinates */}
                        <span className="absolute bottom-1 left-1 text-[8px] text-tactical-green/40 font-mono">
                          {cell.row},{cell.col}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Legend */}
              <div className="mt-6 flex items-center justify-center space-x-6 text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-tactical-green bg-tactical-green/10 rounded"></div>
                  <span className="text-tactical-green/60">Deployment Zone</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-tactical-green/20 bg-bg-tertiary rounded opacity-50"></div>
                  <span className="text-tactical-green/60">Enemy Territory</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}