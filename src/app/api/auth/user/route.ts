import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API /auth/user: Starting authentication check...');
    
    // Check for token in cookies
    const token = request.cookies.get('token')?.value;
    console.log('🍪 API /auth/user: Token exists?', !!token);
    if (token) {
      console.log('🍪 API /auth/user: Token preview:', token.substring(0, 20) + '...');
    }
    
    // Verify authentication
    const userId = await verifyAuth(request);
    console.log('👤 API /auth/user: UserId from verifyAuth:', userId);
    
    if (!userId) {
      console.log('❌ API /auth/user: Authentication failed - returning 401');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get user data
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
        earnedBadges: {
          include: {
            badge: true
          }
        },
        earnedCertificates: {
          include: {
            certificate: true
          }
        },
        claimedRewards: {
          include: {
            reward: true
          }
        },
        userProgress: {
          select: {
            taskId: true,
            completed: true,
            completedAt: true,
            score: true
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
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}

// Update user profile
export async function PATCH(request: NextRequest) {
  try {
    // Verify authentication
    const userId = await verifyAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { name, image } = body;
    
    // Prevent updating critical fields
    if (body.email || body.password || body.points || body.isAdmin) {
      return NextResponse.json(
        { error: 'Cannot update email, password, points, or admin status through this endpoint' },
        { status: 400 }
      );
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(image && { image }),
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

    // Return updated user data
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
} 