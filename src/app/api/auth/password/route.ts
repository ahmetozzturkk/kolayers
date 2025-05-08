import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import { prisma } from '@/lib/prisma';
import bcryptjs from 'bcryptjs';

// Change password endpoint
export async function POST(request: Request) {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    try {
      // Verify token using jose
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret');
      const { payload } = await jose.jwtVerify(token, secret);
      const decoded = payload as { id: string; email: string; name: string };
      
      // Parse the request body
      const { currentPassword, newPassword } = await request.json();
      
      // Validate request body
      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { error: 'Current password and new password are required' },
          { status: 400 }
        );
      }
      
      // Find the user
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      // Verify current password
      const isPasswordValid = await bcryptjs.compare(currentPassword, user.password);
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }
      
      // Hash the new password
      const hashedPassword = await bcryptjs.hash(newPassword, 10);
      
      // Update the user's password
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
      
      return NextResponse.json(
        { message: 'Password updated successfully' },
        { status: 200 }
      );
    } catch (verifyError) {
      console.error('Token verification error:', verifyError);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the password' },
      { status: 500 }
    );
  }
} 