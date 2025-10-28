import { useState } from "react";
import { Link } from "react-router-dom";
import { Crown, Sword, Target, Info, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

type UnitType = "commander" | "warrior" | "archer";

interface Unit {
  type: UnitType;
  health: number;
  attack: number;
  defense: number;
  range: number;
}

const units: Unit[] = [
  { type: "commander", health: 20, attack: 5, defense: 3, range: 1 },
  { type: "warrior", health: 15, attack: 7, defense: 2, range: 1 },
  { type: "archer", health: 10, attack: 6, defense: 1, range: 2 },
];

const unitIcons = {
  commander: Crown,
  warrior: Sword,
  archer: Target,
};

const Setup = () => {
  const [deployedUnits, setDeployedUnits] = useState<Set<string>>(new Set());

  const toggleDeploy = (row: number, col: number) => {
    const key = `${row}-${col}`;
    const newDeployed = new Set(deployedUnits);
    if (newDeployed.has(key)) {
      newDeployed.delete(key);
    } else if (newDeployed.size < 3) {
      newDeployed.add(key);
    }
    setDeployedUnits(newDeployed);
  };

  const isDeployed = (row: number, col: number) => deployedUnits.has(`${row}-${col}`);
  const canDeploy = (row: number) => row >= 3; // Bottom 2 rows for player 1

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-primary/30 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-primary text-glow tracking-wider mb-2">
            UNIT DEPLOYMENT
          </h1>
          <p className="text-primary/60 text-sm">Deploy your 3 units on the bottom 2 rows</p>
        </div>
      </header>

      <main className="flex-1 px-6 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Unit info cards */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2 text-primary/80 mb-4">
              <Info className="w-4 h-4" />
              <span className="text-sm">AVAILABLE UNITS</span>
            </div>
            
            {units.map((unit) => {
              const Icon = unitIcons[unit.type];
              return (
                <Card key={unit.type} className="bg-card border-primary/30 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 border border-primary/50 rounded flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-primary font-bold uppercase tracking-wide text-sm">
                        {unit.type}
                      </h3>
                      <p className="text-primary/50 text-xs">
                        Range: {unit.range} tile{unit.range > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="border border-primary/20 rounded px-2 py-1">
                      <div className="text-primary/50">HP</div>
                      <div className="text-primary font-bold">{unit.health}</div>
                    </div>
                    <div className="border border-primary/20 rounded px-2 py-1">
                      <div className="text-primary/50">ATK</div>
                      <div className="text-primary font-bold">{unit.attack}</div>
                    </div>
                    <div className="border border-primary/20 rounded px-2 py-1">
                      <div className="text-primary/50">DEF</div>
                      <div className="text-primary font-bold">{unit.defense}</div>
                    </div>
                  </div>
                </Card>
              );
            })}

            <div className="border border-primary/20 rounded p-3 text-xs text-primary/60">
              <p className="leading-relaxed">
                Click on tiles in rows 3-4 to deploy your units. You must deploy exactly 3 units before starting.
              </p>
            </div>
          </div>

          {/* Battlefield grid */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <span className="text-primary/80 text-sm">BATTLEFIELD - 5×5 GRID</span>
              <span className="text-primary/60 text-sm">
                Deployed: {deployedUnits.size}/3
              </span>
            </div>

            <div className="border border-primary/30 rounded-lg p-6 bg-card/50">
              <div className="grid grid-cols-5 gap-2 max-w-xl mx-auto">
                {Array.from({ length: 25 }, (_, i) => {
                  const row = Math.floor(i / 5);
                  const col = i % 5;
                  const deployed = isDeployed(row, col);
                  const deployable = canDeploy(row);

                  return (
                    <button
                      key={i}
                      onClick={() => deployable && toggleDeploy(row, col)}
                      className={`
                        aspect-square border-2 rounded transition-all relative
                        ${deployable 
                          ? deployed
                            ? "border-primary bg-primary/20 border-glow"
                            : "border-primary/30 hover:border-primary/50 hover:bg-primary/5"
                          : "border-destructive/20 bg-destructive/5 cursor-not-allowed"
                        }
                      `}
                    >
                      {deployed && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-primary rounded-full bg-primary/30" />
                        </div>
                      )}
                      <span className="absolute top-1 left-1 text-[10px] text-primary/30">
                        {row},{col}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-destructive/40 rounded" />
                    <span className="text-primary/50">Enemy Zone</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-primary/40 rounded" />
                    <span className="text-primary/50">Deploy Zone</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Start battle button */}
            <div className="mt-6 text-center">
              <Link to="/game/1">
                <Button
                  size="lg"
                  disabled={deployedUnits.size !== 3}
                  className={`
                    border-primary px-12
                    ${deployedUnits.size === 3
                      ? "bg-primary/10 text-primary hover:bg-primary/20 border-glow-intense"
                      : "bg-primary/5 text-primary/40 border-primary/20 cursor-not-allowed"
                    }
                  `}
                >
                  BEGIN COMBAT
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Setup;