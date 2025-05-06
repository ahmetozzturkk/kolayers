import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function GET() {
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
      // Verify token
      const decoded = verify(
        token,
        process.env.NEXTAUTH_SECRET || 'fallback-secret'
      ) as { id: string; email: string; name: string };

      // Get user from database (excluding password)
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Return user data
      return NextResponse.json(user);
    } catch (verifyError) {
      console.error('Token verification error:', verifyError);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Server error when authenticating user' },
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
      // Verify token
      const decoded = verify(
        token,
        process.env.NEXTAUTH_SECRET || 'fallback-secret'
      ) as { id: string; email: string; name: string };

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