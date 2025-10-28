import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";

const Manual = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-primary/30 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <Link to="/">
            <Button variant="ghost" className="text-primary/70 hover:text-primary mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              BACK
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-primary text-glow tracking-wider">
            OPERATIONS MANUAL
          </h1>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8 text-primary/70 leading-relaxed">
          <section>
            <h2 className="text-xl text-primary font-bold mb-3">GAME DESCRIPTION</h2>
            <p>
              Rift Commanders is a strategic 2-player turn-based combat game on a 5×5 battlefield. 
              Command 3 unique units - a powerful Commander, a close-range Warrior, and a long-range Archer. 
              Plan your moves in secret, then watch as both players' actions execute simultaneously. 
              Survive unpredictable Chaos Rifts that randomly swap terrain tiles. Victory comes to whoever 
              eliminates the enemy Commander first.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-primary font-bold mb-3">CORE GAMEPLAY</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-primary font-bold">Phase 1: Setup (30 seconds)</h3>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Deploy 3 units on your side of the battlefield</li>
                  <li>Player 1: Bottom 2 rows (rows 3-4)</li>
                  <li>Player 2: Top 2 rows (rows 0-1)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-primary font-bold">Phase 2: Planning (30 seconds per turn)</h3>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Secretly plan 1 action per unit: Move, Attack, or Defend</li>
                  <li>Commit moves without opponent seeing</li>
                </ul>
              </div>

              <div>
                <h3 className="text-primary font-bold">Phase 3: Execution (Automatic)</h3>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Both players' moves execute simultaneously</li>
                  <li>Combat resolves automatically</li>
                  <li>Damage dealt, units die if health reaches 0</li>
                </ul>
              </div>

              <div>
                <h3 className="text-primary font-bold">Phase 4: Chaos Rift (Every 3-5 turns)</h3>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Terrain tiles randomly swap positions</li>
                  <li>Units stay in place, terrain changes under them</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl text-primary font-bold mb-3">UNIT STATS</h2>
            <div className="grid gap-4">
              <div className="border border-primary/30 rounded p-4">
                <h3 className="text-primary font-bold">👑 COMMANDER</h3>
                <div className="grid grid-cols-4 gap-2 mt-2 text-sm">
                  <div>Health: 20</div>
                  <div>Attack: 5</div>
                  <div>Defense: 3</div>
                  <div>Range: 1</div>
                </div>
              </div>
              <div className="border border-primary/30 rounded p-4">
                <h3 className="text-primary font-bold">⚔️ WARRIOR</h3>
                <div className="grid grid-cols-4 gap-2 mt-2 text-sm">
                  <div>Health: 15</div>
                  <div>Attack: 7</div>
                  <div>Defense: 2</div>
                  <div>Range: 1</div>
                </div>
              </div>
              <div className="border border-primary/30 rounded p-4">
                <h3 className="text-primary font-bold">🏹 ARCHER</h3>
                <div className="grid grid-cols-4 gap-2 mt-2 text-sm">
                  <div>Health: 10</div>
                  <div>Attack: 6</div>
                  <div>Defense: 1</div>
                  <div>Range: 2</div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl text-primary font-bold mb-3">TERRAIN TYPES</h2>
            <ul className="space-y-2">
              <li><span className="text-primary">Normal:</span> No effect</li>
              <li><span className="text-destructive">Lava:</span> 2 damage per turn</li>
              <li><span className="text-muted-foreground">Wall:</span> Blocks movement</li>
              <li><span className="text-blue-500">Heal:</span> +3 health per turn</li>
              <li><span className="text-yellow-500">Boost:</span> +2 attack</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl text-primary font-bold mb-3">STRATEGY TIPS</h2>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Position Commander safely in back</li>
              <li>Use Archer for long-range harassment</li>
              <li>Warrior tanks damage on frontline</li>
              <li>Predict opponent's moves</li>
              <li>Adapt to Rift terrain changes</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Manual;