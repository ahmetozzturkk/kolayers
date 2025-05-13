interface Reward {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  type: 'badge' | 'point';
  pointCost?: number;
  badgeRequiredId?: string;
  badgeRequired?: {
    id: string;
    title: string;
    imageUrl: string;
  };
  eligible?: boolean;
  claimed?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Get all rewards with eligibility information
export async function getAllRewards(): Promise<{ rewards: Reward[] } | { error: string }> {
  try {
    const response = await fetch('/api/rewards', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { error: 'unauthorized' };
      }
      
      const data = await response.json();
      return { error: data.error || 'Failed to fetch rewards' };
    }

    const rewards = await response.json();
    return { rewards };
  } catch (error) {
    console.error('Get rewards error:', error);
    return { error: 'An unexpected error occurred while fetching rewards' };
  }
}

// Create a new reward (admin only)
export async function createReward(reward: Partial<Reward>): Promise<{ reward: Reward } | { error: string }> {
  try {
    const response = await fetch('/api/rewards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reward),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { error: 'unauthorized' };
      }
      
      const data = await response.json();
      return { error: data.error || 'Failed to create reward' };
    }

    const createdReward = await response.json();
    return { reward: createdReward };
  } catch (error) {
    console.error('Create reward error:', error);
    return { error: 'An unexpected error occurred while creating the reward' };
  }
}

// Claim a reward
export async function claimReward(rewardId: string): Promise<{ success: boolean; message: string } | { error: string }> {
  try {
    const response = await fetch('/api/rewards/claim', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rewardId }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { error: 'unauthorized' };
      }
      
      const data = await response.json();
      return { error: data.error || 'Failed to claim reward' };
    }

    const result = await response.json();
    return { success: true, message: result.message || 'Reward claimed successfully' };
  } catch (error) {
    console.error('Claim reward error:', error);
    return { error: 'An unexpected error occurred while claiming the reward' };
  }
} 