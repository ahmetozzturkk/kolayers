import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET user profile
export async function GET(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get user profile information
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        points: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
        earnedBadges: {
          select: {
            earnedAt: true,
            badge: true
          }
        },
        earnedCertificates: {
          select: {
            earnedAt: true,
            certificate: true
          }
        },
        claimedRewards: {
          select: {
            claimedAt: true,
            reward: true
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
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

// UPDATE user profile
export async function PATCH(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { name, image } = body;
    
    // Prevent updating critical fields
    if (body.email || body.password || body.points || body.isAdmin) {
      return NextResponse.json(
        { error: 'Cannot update email, password, points, or admin status through this endpoint' },
        { status: 400 }
      );
    }
    
    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(image && { image })
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
} 