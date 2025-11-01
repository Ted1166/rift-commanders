export interface Reward {
  id: string;
  type: 'xp' | 'token' | 'nft' | 'achievement';
  name: string;
  description: string;
  amount?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  reward: Reward;
}