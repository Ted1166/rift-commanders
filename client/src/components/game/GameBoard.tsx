interface GameBoardProps {
  gameId: number;
  playerNumber: 1 | 2;
  phase: 'setup' | 'planning' | 'execution';
  onPhaseComplete: () => void;
}

export default function GameBoard({ gameId, playerNumber, phase, onPhaseComplete }: GameBoardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-4">
        Game #{gameId} - Player {playerNumber} - Phase: {phase}
      </h2>
      
      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
        <p className="text-white/80">
          🎮 Game board will appear here
        </p>
        
        <button
          onClick={onPhaseComplete}
          className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg"
        >
          Continue to Game
        </button>
      </div>
    </div>
  );
}