import { useState } from 'react';
import { Trophy, Star, Coins, Gem, Award, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui';
import type { Reward } from '../../types/rewards';

interface RewardsModalProps {
  isOpen: boolean;
  rewards: Reward[];
  onClose: () => void;
}

export function RewardsModal({ isOpen, rewards, onClose }: RewardsModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen || rewards.length === 0) return null;

  const currentReward = rewards[currentIndex];
  const isLast = currentIndex === rewards.length - 1;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-tactical-green border-tactical-green';
      case 'rare': return 'text-accent-blue border-accent-blue';
      case 'epic': return 'text-purple-500 border-purple-500';
      case 'legendary': return 'text-accent-yellow border-accent-yellow';
      default: return 'text-tactical-green border-tactical-green';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'xp': return <Star className="w-12 h-12" />;
      case 'token': return <Coins className="w-12 h-12" />;
      case 'nft': return <Gem className="w-12 h-12" />;
      case 'achievement': return <Award className="w-12 h-12" />;
      default: return <Trophy className="w-12 h-12" />;
    }
  };

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 animate-fadeIn">
      <div className="max-w-lg w-full mx-4">
        <div className={`
          border-4 rounded-lg p-8 bg-bg-secondary
          ${getRarityColor(currentReward.rarity)}
          animate-pulse-glow
        `}>
          {/* Header */}
          <div className="text-center mb-6">
            <p className="text-tactical-green/60 text-xs uppercase tracking-wider mb-2">
              Reward {currentIndex + 1} of {rewards.length}
            </p>
            <h2 className="text-3xl font-bold uppercase tracking-wider mb-1 text-tactical-green">
              Mission Complete!
            </h2>
            <p className={`text-sm uppercase tracking-wider ${getRarityColor(currentReward.rarity).split(' ')[0]}`}>
              {currentReward.rarity} Reward
            </p>
          </div>

          {/* Reward Display */}
          <div className="flex flex-col items-center mb-6">
            <div className={`
              w-32 h-32 rounded-full border-4 flex items-center justify-center mb-4
              ${getRarityColor(currentReward.rarity)}
              bg-bg-tertiary animate-pulse-glow
            `}>
              <div className={getRarityColor(currentReward.rarity).split(' ')[0]}>
                {getIcon(currentReward.type)}
              </div>
            </div>

            <h3 className="text-2xl font-bold text-tactical-green mb-2">
              {currentReward.name}
            </h3>
            
            {currentReward.amount && (
              <div className="text-4xl font-bold text-accent-yellow mb-2">
                +{currentReward.amount}
              </div>
            )}
            
            <p className="text-tactical-green/60 text-sm text-center font-mono">
              {currentReward.description}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center space-x-2 mb-6">
            {rewards.map((_, idx) => (
              <div
                key={idx}
                className={`
                  h-1 rounded-full transition-all
                  ${idx === currentIndex 
                    ? 'w-8 bg-tactical-green' 
                    : idx < currentIndex 
                    ? 'w-4 bg-tactical-green/50'
                    : 'w-4 bg-tactical-green/20'}
                `}
              />
            ))}
          </div>

          {/* Action Button */}
          <Button
            onClick={handleNext}
            size="lg"
            className="w-full flex items-center justify-center space-x-2"
          >
            <span>{isLast ? 'Claim All Rewards' : 'Next Reward'}</span>
            {!isLast && <ChevronRight className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}