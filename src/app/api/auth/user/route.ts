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
    
    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        points: true,
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

// Add PATCH method to update user profile
export async function PATCH(request: Request) {
  try {
    // Get token from cookies safely using await
    const cookieJar = await cookies();
    const token = cookieJar.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    try {
      // Verify token using jose
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret');
      const { payload } = await jose.jwtVerify(token, secret);
      const decoded = payload as { id: string; email: string; name: string };

      // Get request body
      const body = await request.json();
      const { name, image } = body;

      // Update user in database
      const updatedUser = await prisma.user.update({
        where: { id: decoded.id },
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
    } catch (verifyError) {
      console.error('Token verification error:', verifyError);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
} 