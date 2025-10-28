import { useState } from "react";
import { Link } from "react-router-dom";
import { Globe, Shield, Zap, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

type NetworkType = "mainnet" | "testnet" | "devnet" | null;

const networks = [
  {
    id: "mainnet" as const,
    name: "MAINNET",
    icon: Globe,
    description: "Production network with real transactions. Your assets have real value and permanence.",
    status: "offline",
    statusText: "System Offline",
  },
  {
    id: "testnet" as const,
    name: "TESTNET",
    icon: Shield,
    description: "Testing network with free tokens. Safe environment for learning without financial risk.",
    status: "online",
    statusText: "Ready",
  },
  {
    id: "devnet" as const,
    name: "DEVNET",
    icon: Zap,
    description: "Development network for testing. Fastest transactions and unlimited resources for development.",
    status: "online",
    statusText: "Ready",
  },
];

const Network = () => {
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>(null);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-primary/30 px-6 py-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Zap className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold text-primary text-glow tracking-wider">
            RIFT COMMANDERS
          </h1>
        </div>
        <p className="text-primary/60 text-sm tracking-widest">
          ⚡ SELECT BLOCKCHAIN NETWORK ⚡
        </p>
      </header>

      {/* Network cards */}
      <main className="flex-1 px-6 py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {networks.map((network) => {
            const Icon = network.icon;
            const isSelected = selectedNetwork === network.id;
            const isOffline = network.status === "offline";

            return (
              <Card
                key={network.id}
                className={`
                  relative bg-card border-2 p-6 cursor-pointer transition-all duration-300
                  ${isSelected ? "border-primary border-glow-intense" : "border-primary/30 hover:border-primary/50"}
                  ${isOffline ? "opacity-60" : ""}
                `}
                onClick={() => !isOffline && setSelectedNetwork(network.id)}
              >
                {/* Network badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`
                    flex items-center gap-2 px-3 py-1 rounded-full border text-xs
                    ${isOffline ? "border-destructive/50 text-destructive/70" : "border-primary/50 text-primary"}
                  `}>
                    <span className={`w-2 h-2 rounded-full ${isOffline ? "bg-destructive/70" : "bg-primary animate-pulse-glow"}`} />
                    {network.name}
                  </div>
                  <Icon className="w-8 h-8 text-primary/70" />
                </div>

                {/* Description */}
                <p className="text-primary/70 text-sm leading-relaxed mb-6 min-h-[4rem]">
                  {network.description}
                </p>

                {/* Connect button */}
                <Button
                  variant="outline"
                  className={`
                    w-full border-primary/50 bg-transparent text-primary
                    ${isOffline 
                      ? "opacity-50 cursor-not-allowed" 
                      : "hover:bg-primary/10 hover:border-primary border-glow"
                    }
                  `}
                  disabled={isOffline}
                >
                  {isOffline ? network.statusText : "CONNECT"}
                </Button>

                {/* Status indicator */}
                {isOffline && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-destructive/70">
                    <AlertCircle className="w-3 h-3" />
                    <span>{network.statusText}</span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Continue button */}
        {selectedNetwork && (
          <div className="max-w-6xl mx-auto mt-8 text-center animate-fade-in">
            <Link to="/setup">
              <Button
                size="lg"
                className="border-primary bg-primary/10 text-primary hover:bg-primary/20 border-glow-intense px-12"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                PROCEED TO DEPLOYMENT
              </Button>
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-primary/30 px-6 py-4 text-center">
        <p className="text-xs text-primary/40 tracking-widest">
          ⚡ RIFT COMMANDERS OPERATIONS NETWORK ⚡
        </p>
      </footer>
    </div>
  );
};

export default Network;