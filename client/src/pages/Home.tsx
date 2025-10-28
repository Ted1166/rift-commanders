import { Link } from "react-router-dom";
import { Rocket, Shield, Zap } from "lucide-react";
import { Button } from "../components/ui/button";

const Home = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-full h-px bg-primary/20 animate-scan-line" />
      </div>

      {/* Top status bar */}
      <header className="border-b border-primary/30 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary text-sm">
          <Zap className="w-4 h-4" />
          <span>Sol System 2387</span>
        </div>
        <div className="flex items-center gap-2">
          <Rocket className="w-4 h-4 text-primary animate-pulse-glow" />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-4xl w-full space-y-12">
          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-bold text-primary text-glow-intense tracking-wider">
              RIFT COMMANDERS
            </h1>
            <div className="text-2xl md:text-3xl text-primary/80 font-light tracking-widest">
              TACTICAL WARFARE
            </div>
            <p className="text-primary/60 max-w-2xl leading-relaxed">
              Command specialized units in turn-based combat. Deploy your Commander, Warrior, and Archer 
              on a dynamic 5×5 battlefield. Plan moves in secret, execute simultaneously, and survive 
              unpredictable Chaos Rifts.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-4">
            <Link to="/network">
              <Button 
                variant="outline" 
                size="lg"
                className="border-primary bg-transparent text-primary hover:bg-primary/10 border-glow text-lg px-8 group"
              >
                LAUNCH MISSION
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Button>
            </Link>
            <Link to="/manual">
              <Button 
                variant="outline" 
                size="lg"
                className="border-primary/50 bg-transparent text-primary/70 hover:bg-primary/5 text-lg px-8"
              >
                OPERATIONS MANUAL
              </Button>
            </Link>
            <Link to="/training">
              <Button 
                variant="outline" 
                size="lg"
                className="border-primary/50 bg-transparent text-primary/70 hover:bg-primary/5 text-lg px-8"
              >
                TRAINING
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-primary/30 px-6 py-3 flex items-center justify-between text-sm text-primary/50">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span>Rift Commanders © 2387</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse-glow" />
            System Online
          </span>
          <button className="hover:text-primary transition-colors">Support</button>
          <button className="hover:text-primary transition-colors">Terms</button>
        </div>
      </footer>
    </div>
  );
};

export default Home;