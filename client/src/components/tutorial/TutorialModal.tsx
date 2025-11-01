import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Crown, Sword, Target, Activity, Zap, Shield } from 'lucide-react';
import { Button } from '../../components/ui';

interface TutorialStep {
  title: string;
  description: string;
  icon: any;
  tips: string[];
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'Welcome to Rift Commanders',
    description: 'A tactical turn-based strategy game on Starknet. Eliminate the enemy Commander to win!',
    icon: Crown,
    tips: [
      'Each player controls 3 units: Commander, Warrior, and Archer',
      'Games are played on a 5×5 grid battlefield',
      'Plan your moves carefully - all actions execute simultaneously!',
    ],
  },
  {
    title: 'Unit Types & Stats',
    description: 'Each unit has unique strengths and weaknesses.',
    icon: Sword,
    tips: [
      '👑 Commander: 20 HP, 5 ATK, 3 DEF, 1 Range - Your leader. Protect at all costs!',
      '⚔️ Warrior: 15 HP, 7 ATK, 2 DEF, 1 Range - High damage melee fighter',
      '🎯 Archer: 10 HP, 6 ATK, 1 DEF, 2 Range - Ranged attacker with long reach',
    ],
  },
  {
    title: 'Deployment Phase',
    description: 'Place your units on the bottom 2 rows of the battlefield.',
    icon: Target,
    tips: [
      'Click a unit from the left panel to select it',
      'Click a green tile to place your unit',
      'Position matters! Keep your Commander protected',
      'Once all 3 units are placed, confirm deployment',
    ],
  },
  {
    title: 'Planning Phase',
    description: 'Plan your moves secretly before turn execution.',
    icon: Activity,
    tips: [
      'Select one of your units from the left panel',
      'Choose an action: Move, Attack, or Defend',
      'Click a target tile on the battlefield',
      'Plan moves for all your units, then commit',
    ],
  },
  {
    title: 'Actions Explained',
    description: 'Three action types determine your strategy.',
    icon: Zap,
    tips: [
      '🚶 MOVE: Reposition your unit. Move up to 1 tile in any direction',
      '⚔️ ATTACK: Deal damage to an enemy unit within your range',
      '🛡️ DEFEND: Reduce incoming damage by your defense stat this turn',
    ],
  },
  {
    title: 'Execution Phase',
    description: 'All planned moves execute simultaneously!',
    icon: Shield,
    tips: [
      'Both players\' moves execute at the same time',
      'Combat is resolved automatically based on stats',
      'Units can die if health reaches 0',
      'Predict your opponent\'s moves to gain advantage!',
    ],
  },
  {
    title: 'Victory Conditions',
    description: 'How to win the battle.',
    icon: Crown,
    tips: [
      '🎯 Primary Goal: Eliminate the enemy Commander',
      '⚔️ Secondary: Eliminate all enemy units',
      '🧠 Strategy: Protect your Commander while attacking theirs',
      '🔄 Turns continue until one Commander falls',
    ],
  },
];

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function TutorialModal({ isOpen, onClose, onComplete }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = TUTORIAL_STEPS[currentStep];
  const StepIcon = step.icon;
  const isFirst = currentStep === 0;
  const isLast = currentStep === TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
      onClose();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 animate-fadeIn px-4">
      <div className="max-w-2xl w-full">
        <div className="border-2 border-tactical-green/30 rounded-lg bg-bg-secondary p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 border-2 border-tactical-green rounded-full bg-tactical-green/20 flex items-center justify-center">
                <StepIcon className="w-6 h-6 text-tactical-green" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-tactical-green uppercase tracking-wider">
                  {step.title}
                </h2>
                <p className="text-tactical-green/60 text-xs font-mono">
                  Step {currentStep + 1} of {TUTORIAL_STEPS.length}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-tactical-green/60 hover:text-tactical-green transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-tactical-green/80 text-base mb-4 font-mono leading-relaxed">
              {step.description}
            </p>

            <div className="space-y-2">
              {step.tips.map((tip, idx) => (
                <div
                  key={idx}
                  className="flex items-start space-x-3 p-3 border border-tactical-green/20 rounded bg-bg-tertiary"
                >
                  <div className="w-6 h-6 border border-tactical-green/30 rounded-full bg-tactical-green/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-tactical-green text-xs font-bold">{idx + 1}</span>
                  </div>
                  <p className="text-tactical-green/70 text-sm font-mono flex-grow">
                    {tip}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex space-x-1 mb-6">
            {TUTORIAL_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`
                  h-1 flex-1 rounded-full transition-all
                  ${idx <= currentStep ? 'bg-tactical-green' : 'bg-tactical-green/20'}
                `}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between space-x-4">
            <Button
              onClick={handlePrev}
              disabled={isFirst}
              variant="secondary"
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </Button>

            <button
              onClick={onClose}
              className="text-tactical-green/60 hover:text-tactical-green text-sm font-mono uppercase tracking-wider transition-colors"
            >
              Skip Tutorial
            </button>

            <Button
              onClick={handleNext}
              className="flex items-center space-x-2"
            >
              <span>{isLast ? 'Start Playing' : 'Next'}</span>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}