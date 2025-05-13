import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const userId = await verifyAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all rewards
    const rewards = await prisma.reward.findMany({
      include: {
        badgeRequired: true
      }
    });

    // Get user's earned badges and points
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        points: true,
        earnedBadges: {
          select: {
            badgeId: true
          }
        },
        claimedRewards: {
          select: {
            rewardId: true
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

    const earnedBadgeIds = user.earnedBadges.map(eb => eb.badgeId);
    const claimedRewardIds = user.claimedRewards.map(cr => cr.rewardId);

    // Check which rewards the user is eligible for
    const rewardsWithEligibility = rewards.map(reward => {
      // Check if user has already claimed this reward
      const claimed = claimedRewardIds.includes(reward.id);
      
      // Check badge requirement
      const badgeEligible = reward.badgeRequiredId 
        ? earnedBadgeIds.includes(reward.badgeRequiredId)
        : true;
      
      // Check point requirement
      const pointEligible = reward.pointCost 
        ? user.points >= reward.pointCost
        : true;
      
      // Reward is eligible if user meets all requirements and hasn't claimed it
      const eligible = !claimed && badgeEligible && pointEligible;

      return {
        ...reward,
        eligible,
        claimed
      };
    });

    return NextResponse.json(rewardsWithEligibility);
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rewards' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication (admin check would be here in production)
    const userId = await verifyAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.description || !body.type) {
      return NextResponse.json(
        { error: 'Title, description, and type are required' },
        { status: 400 }
      );
    }
    
    // For point-based rewards, pointCost is required
    if (body.type === 'point' && !body.pointCost) {
      return NextResponse.json(
        { error: 'Point cost is required for point-based rewards' },
        { status: 400 }
      );
    }
    
    // Create the reward
    const reward = await prisma.reward.create({
      data: {
        title: body.title,
        description: body.description,
        imageUrl: body.imageUrl || null,
        type: body.type,
        pointCost: body.pointCost || null,
        badgeRequiredId: body.badgeRequiredId || null
      },
      include: {
        badgeRequired: true
      }
    });
    
    return NextResponse.json(reward, { status: 201 });
  } catch (error) {
    console.error('Error creating reward:', error);
    return NextResponse.json(
      { error: 'Failed to create reward' },
      { status: 500 }
    );
  }
} 