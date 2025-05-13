import { Badge } from '@/types';

// Get all badges
export async function getAllBadges(): Promise<{ badges: Badge[] } | { error: string }> {
  try {
    const response = await fetch('/api/badges', {
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
      return { error: data.error || 'Failed to fetch badges' };
    }

    const badges = await response.json();
    return { badges };
  } catch (error) {
    console.error('Get badges error:', error);
    return { error: 'An unexpected error occurred while fetching badges' };
  }
}

// Create a new badge (admin only)
export async function createBadge(badge: Partial<Badge>): Promise<{ badge: Badge } | { error: string }> {
  try {
    const response = await fetch('/api/badges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(badge),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { error: 'unauthorized' };
      }
      
      const data = await response.json();
      return { error: data.error || 'Failed to create badge' };
    }

    const createdBadge = await response.json();
    return { badge: createdBadge };
  } catch (error) {
    console.error('Create badge error:', error);
    return { error: 'An unexpected error occurred while creating the badge' };
  }
} 