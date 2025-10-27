import { useState } from 'react';
import { Plus, LogIn, Gamepad2, Zap, Shield, Swords } from 'lucide-react';

interface LobbyProps {
  onCreateGame: () => void;
  onJoinGame: (gameId: number) => void;
}

export default function Lobby({ onCreateGame, onJoinGame }: LobbyProps) {
  const [joinGameId, setJoinGameId] = useState('');

  const handleJoin = () => {
    const id = parseInt(joinGameId);
    if (!isNaN(id) && id > 0) {
      onJoinGame(id);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* System Status Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-black/60 border border-green-500/30">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-mono">TACTICAL COMMAND NETWORK ONLINE</span>
          </div>
        </div>

        {/* Main Title */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400">
            RIFT COMMANDERS
          </h1>
          <div className="inline-flex items-center space-x-2 text-purple-300/80 text-sm font-mono">
            <Zap className="w-4 h-4" />
            <span>SELECT DEPLOYMENT MODE</span>
            <Zap className="w-4 h-4" />
          </div>
        </div>

        {/* Mission Briefing */}
        <div className="mb-8 bg-black/60 border border-purple-500/30 rounded-lg p-6">
          <div className="text-center">
            <p className="text-purple-200/80 text-lg font-light leading-relaxed">
              Strategic turn-based warfare on a 5×5 battlefield. Deploy Commander, Warrior, and Archer units.
              <br />
              Plan moves secretly. Execute simultaneously. Survive chaos rifts. Eliminate enemy commander to win.
            </p>
          </div>
        </div>

        {/* Battle Mode Selection */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Create Game */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-black/80 border border-purple-500/40 rounded-lg p-8 h-full hover:border-purple-400/60 transition-all duration-300">
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 mb-4">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                    <span className="text-purple-300 text-xs font-mono uppercase">New Battle</span>
                  </div>
                </div>

                <div className="flex items-center justify-center mb-6">
                  <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/30">
                    <Swords className="w-12 h-12 text-purple-400" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-3 text-center">CREATE MISSION</h3>
                
                <p className="text-purple-200/70 text-sm text-center mb-6 flex-grow">
                  Initialize new tactical engagement. Deploy as Commander Alpha. Await enemy contact.
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 mb-6 text-xs">
                  <div className="bg-black/40 border border-purple-500/20 rounded p-2 text-center">
                    <div className="text-purple-400 font-mono">5×5</div>
                    <div className="text-white/50">GRID</div>
                  </div>
                  <div className="bg-black/40 border border-purple-500/20 rounded p-2 text-center">
                    <div className="text-purple-400 font-mono">3</div>
                    <div className="text-white/50">UNITS</div>
                  </div>
                  <div className="bg-black/40 border border-purple-500/20 rounded p-2 text-center">
                    <div className="text-purple-400 font-mono">TURN</div>
                    <div className="text-white/50">BASED</div>
                  </div>
                  <div className="bg-black/40 border border-purple-500/20 rounded p-2 text-center">
                    <div className="text-purple-400 font-mono">PVP</div>
                    <div className="text-white/50">MODE</div>
                  </div>
                </div>

                <button
                  onClick={onCreateGame}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] border border-purple-400/50 group"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <Gamepad2 className="w-5 h-5" />
                    <span className="font-mono">INITIALIZE</span>
                    <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Join Game */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-black/80 border border-blue-500/40 rounded-lg p-8 h-full hover:border-blue-400/60 transition-all duration-300">
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 mb-4">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-blue-300 text-xs font-mono uppercase">Join Battle</span>
                  </div>
                </div>

                <div className="flex items-center justify-center mb-6">
                  <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
                    <LogIn className="w-12 h-12 text-blue-400" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-3 text-center">JOIN MISSION</h3>
                
                <p className="text-blue-200/70 text-sm text-center mb-6">
                  Enter tactical operation ID. Deploy as Commander Beta.
                </p>

                <div className="mb-6">
                  <label className="text-blue-300/80 text-xs font-mono uppercase mb-2 block">
                    MISSION ID
                  </label>
                  <input
                    type="text"
                    placeholder="000000"
                    value={joinGameId}
                    onChange={(e) => setJoinGameId(e.target.value)}
                    className="w-full bg-black/60 border border-blue-500/30 rounded-lg px-4 py-3 text-white text-center text-2xl font-mono placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <button
                  onClick={handleJoin}
                  disabled={!joinGameId}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] border border-blue-400/50 mt-auto"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <LogIn className="w-5 h-5" />
                    <span className="font-mono">CONNECT</span>
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Active Battles */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-black/80 border border-green-500/40 rounded-lg p-8 h-full hover:border-green-400/60 transition-all duration-300">
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/40 mb-4">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-300 text-xs font-mono uppercase">Live Operations</span>
                  </div>
                </div>

                <div className="flex items-center justify-center mb-6">
                  <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/30">
                    <Shield className="w-12 h-12 text-green-400" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-3 text-center">ACTIVE BATTLES</h3>
                
                <p className="text-green-200/70 text-sm text-center mb-6">
                  Join ongoing tactical engagements. Quick deployment available.
                </p>

                <div className="space-y-3 flex-grow overflow-y-auto max-h-64">
                  {[
                    { id: 123456, status: 'WAITING' },
                    { id: 789012, status: 'WAITING' },
                    { id: 345678, status: 'WAITING' }
                  ].map((mission) => (
                    <button
                      key={mission.id}
                      onClick={() => onJoinGame(mission.id)}
                      className="w-full bg-black/60 border border-green-500/30 hover:border-green-400/60 hover:bg-black/80 rounded-lg p-4 transition-all duration-200 group/mission"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <div className="text-white font-mono text-lg font-bold group-hover/mission:text-green-400 transition-colors">
                            #{mission.id}
                          </div>
                          <div className="text-white/40 text-xs font-mono">OPERATION CODE</div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 text-sm font-mono">{mission.status}</div>
                          <div className="text-white/40 text-xs">1/2 PLAYERS</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="bg-black/60 border border-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between flex-wrap gap-4 text-xs font-mono">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400">SYSTEM OPERATIONAL</span>
              </div>
              <div className="text-white/40">|</div>
              <span className="text-white/60">NETWORK: STARKNET SEPOLIA</span>
            </div>
            <div className="text-white/40">
              RIFT COMMANDERS v1.0.0 • DOJO ENGINE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}