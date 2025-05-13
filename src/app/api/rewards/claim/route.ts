import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const userId = await verifyAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { rewardId } = body;
    
    if (!rewardId) {
      return NextResponse.json(
        { error: 'Reward ID is required' },
        { status: 400 }
      );
    }
    
    // Check if the reward exists
    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
      include: {
        badgeRequired: true
      }
    });
    
    if (!reward) {
      return NextResponse.json(
        { error: 'Reward not found' },
        { status: 404 }
      );
    }
    
    // Check if the user has already claimed this reward
    const existingClaim = await prisma.claimedReward.findUnique({
      where: {
        userId_rewardId: {
          userId,
          rewardId
        }
      }
    });
    
    if (existingClaim) {
      return NextResponse.json(
        { error: 'You have already claimed this reward' },
        { status: 400 }
      );
    }
    
    // Get user data to check eligibility
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        points: true,
        earnedBadges: {
          select: {
            badgeId: true
          }
        }
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check badge requirement
    if (reward.badgeRequiredId) {
      const hasBadge = user.earnedBadges.some(eb => eb.badgeId === reward.badgeRequiredId);
      
      if (!hasBadge) {
        return NextResponse.json(
          { error: 'You do not have the required badge to claim this reward' },
          { status: 400 }
        );
      }
    }
    
    // Check point requirement
    if (reward.pointCost && reward.pointCost > user.points) {
      return NextResponse.json(
        { error: 'You do not have enough points to claim this reward' },
        { status: 400 }
      );
    }
    
    // Process in transaction to ensure atomicity
    return await prisma.$transaction(async (tx) => {
      // Claim the reward
      const claimedReward = await tx.claimedReward.create({
        data: {
          userId,
          rewardId
        }
      });
      
      // Deduct points if it's a point-based reward
      if (reward.pointCost) {
        await tx.user.update({
          where: { id: userId },
          data: {
            points: {
              decrement: reward.pointCost
            }
          }
        });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Reward claimed successfully',
        claimedReward
      });
    });
  } catch (error) {
    console.error('Error claiming reward:', error);
    return NextResponse.json(
      { error: 'Failed to claim reward' },
      { status: 500 }
    );
  }
} 