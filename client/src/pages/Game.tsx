import { useState } from "react";
import { Crown, Sword, Target, Flame, Droplet, Square, Zap, Shield as ShieldIcon } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

type TerrainType = "normal" | "lava" | "wall" | "heal" | "boost";
type UnitType = "commander" | "warrior" | "archer" | null;

interface GridCell {
  terrain: TerrainType;
  unit: UnitType;
  player: 1 | 2 | null;
}

const terrainIcons = {
  normal: Square,
  lava: Flame,
  wall: Square,
  heal: Droplet,
  boost: Zap,
};

const terrainColors = {
  normal: "border-primary/20 bg-background",
  lava: "border-destructive bg-destructive/10",
  wall: "border-muted bg-muted/30",
  heal: "border-blue-500/50 bg-blue-500/10",
  boost: "border-yellow-500/50 bg-yellow-500/10",
};

const unitIcons = {
  commander: Crown,
  warrior: Sword,
  archer: Target,
};

const Game = () => {
  const [turn, setTurn] = useState(1);
  const [phase, setPhase] = useState<"planning" | "execution">("planning");
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);

  // Initialize 5x5 grid
  const [grid, setGrid] = useState<GridCell[][]>(() => {
    const initialGrid: GridCell[][] = Array(5).fill(null).map(() =>
      Array(5).fill(null).map(() => ({
        terrain: "normal" as TerrainType,
        unit: null,
        player: null,
      }))
    );
    
    // Place some example units
    initialGrid[4][2] = { terrain: "normal", unit: "commander", player: 1 };
    initialGrid[3][1] = { terrain: "normal", unit: "warrior", player: 1 };
    initialGrid[3][3] = { terrain: "normal", unit: "archer", player: 1 };
    
    initialGrid[0][2] = { terrain: "normal", unit: "commander", player: 2 };
    initialGrid[1][1] = { terrain: "normal", unit: "warrior", player: 2 };
    initialGrid[1][3] = { terrain: "normal", unit: "archer", player: 2 };
    
    // Add some terrain variety
    initialGrid[2][0].terrain = "lava";
    initialGrid[2][4].terrain = "lava";
    initialGrid[2][2].terrain = "heal";
    
    return initialGrid;
  });

  const handleCellClick = (row: number, col: number) => {
    setSelectedCell({ row, col });
  };

  const handleEndTurn = () => {
    setPhase("execution");
    setTimeout(() => {
      setPhase("planning");
      setTurn(turn + 1);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top HUD */}
      <header className="border-b border-primary/30 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-primary text-sm">
              <span className="text-primary/50">TURN:</span> {turn}
            </div>
            <div className="text-primary text-sm uppercase">
              <span className="text-primary/50">PHASE:</span>{" "}
              <span className={phase === "planning" ? "text-glow" : "animate-pulse-glow"}>
                {phase}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse-glow" />
              <span className="text-primary/70">P1: YOU</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 bg-destructive rounded-full" />
              <span className="text-primary/50">P2: ENEMY</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Battlefield */}
          <div className="lg:col-span-3">
            <div className="mb-4 text-primary/80 text-sm tracking-wider">
              BATTLEFIELD GRID
            </div>
            
            <div className="border-2 border-primary/30 rounded-lg p-8 bg-card/30 border-glow">
              <div className="grid grid-cols-5 gap-3 max-w-2xl mx-auto">
                {grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    const TerrainIcon = terrainIcons[cell.terrain];
                    const UnitIcon = cell.unit ? unitIcons[cell.unit] : null;
                    const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;

                    return (
                      <button
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        className={`
                          aspect-square border-2 rounded-lg relative transition-all
                          ${terrainColors[cell.terrain]}
                          ${isSelected ? "border-primary border-glow-intense scale-105" : "border-opacity-50"}
                          hover:scale-105
                        `}
                      >
                        {/* Terrain indicator */}
                        {cell.terrain !== "normal" && (
                          <TerrainIcon className="absolute top-1 right-1 w-3 h-3 opacity-50" />
                        )}

                        {/* Unit */}
                        {UnitIcon && (
                          <div className={`
                            absolute inset-0 flex items-center justify-center
                            ${cell.player === 1 ? "text-primary" : "text-destructive"}
                          `}>
                            <div className="w-10 h-10 border-2 border-current rounded-full bg-current/20 flex items-center justify-center">
                              <UnitIcon className="w-5 h-5" />
                            </div>
                          </div>
                        )}

                        {/* Coordinates */}
                        <span className="absolute bottom-0 left-0 text-[8px] text-primary/20 px-1">
                          {rowIndex},{colIndex}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Terrain legend */}
              <div className="mt-6 flex flex-wrap gap-4 justify-center text-xs">
                <div className="flex items-center gap-2">
                  <Flame className="w-3 h-3 text-destructive" />
                  <span className="text-primary/50">Lava (-2 HP)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplet className="w-3 h-3 text-blue-500" />
                  <span className="text-primary/50">Heal (+3 HP)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-yellow-500" />
                  <span className="text-primary/50">Boost (+2 ATK)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Square className="w-3 h-3 text-muted-foreground" />
                  <span className="text-primary/50">Wall (Block)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action panel */}
          <div className="lg:col-span-1 space-y-4">
            <div className="text-primary/80 text-sm tracking-wider mb-4">
              ACTION PANEL
            </div>

            {selectedCell && grid[selectedCell.row][selectedCell.col].unit && (
              <Card className="bg-card border-primary/30 p-4">
                <div className="flex items-center gap-3 mb-4">
                  {(() => {
                    const cell = grid[selectedCell.row][selectedCell.col];
                    const UnitIcon = cell.unit ? unitIcons[cell.unit] : null;
                    return UnitIcon && (
                      <>
                        <div className={`
                          w-12 h-12 border-2 rounded-full flex items-center justify-center
                          ${cell.player === 1 ? "border-primary text-primary" : "border-destructive text-destructive"}
                        `}>
                          <UnitIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-primary font-bold uppercase text-sm">
                            {cell.unit}
                          </h3>
                          <p className="text-primary/50 text-xs">
                            Player {cell.player}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full border-primary/50 bg-transparent text-primary hover:bg-primary/10 text-sm"
                  >
                    MOVE
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-primary/50 bg-transparent text-primary hover:bg-primary/10 text-sm"
                  >
                    ATTACK
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-primary/50 bg-transparent text-primary hover:bg-primary/10 text-sm"
                  >
                    <ShieldIcon className="w-3 h-3 mr-2" />
                    DEFEND
                  </Button>
                </div>
              </Card>
            )}

            {phase === "planning" && (
              <Button
                onClick={handleEndTurn}
                size="lg"
                className="w-full border-primary bg-primary/10 text-primary hover:bg-primary/20 border-glow"
              >
                END TURN
              </Button>
            )}

            {phase === "execution" && (
              <div className="border border-primary/30 rounded p-4 text-center">
                <div className="text-primary animate-pulse-glow text-sm mb-2">
                  EXECUTING MOVES...
                </div>
                <div className="w-full bg-primary/20 h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-1/2 animate-pulse" />
                </div>
              </div>
            )}

            <Card className="bg-card border-primary/20 p-4">
              <div className="text-primary/70 text-xs leading-relaxed">
                <p className="mb-2 font-bold">COMBAT LOG</p>
                <p className="text-primary/50">Turn {turn} - Planning phase initiated</p>
                <p className="text-primary/50 mt-1">Awaiting commander orders...</p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Game;