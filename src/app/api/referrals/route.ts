import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Create a new referral
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
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if the user is referring themselves
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });
    
    if (currentUser && currentUser.email === email) {
      return NextResponse.json(
        { error: 'You cannot refer yourself' },
        { status: 400 }
      );
    }

    // Check if the email is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'This email is already registered in the system' },
        { status: 400 }
      );
    }

    // Check if the email has already been referred
    const existingReferral = await prisma.referral.findFirst({
      where: { referredEmail: email }
    });
    
    if (existingReferral) {
      return NextResponse.json(
        { error: 'This email has already been referred' },
        { status: 400 }
      );
    }

    // Create the referral
    const referral = await prisma.referral.create({
      data: {
        referrerId: userId,
        referredEmail: email,
        status: 'pending'
      }
    });

    // TODO: Send email to the referred person (in a real implementation)

    return NextResponse.json(referral, { status: 201 });
  } catch (error) {
    console.error('Error creating referral:', error);
    return NextResponse.json(
      { error: 'Failed to create referral' },
      { status: 500 }
    );
  }
}

// GET user's referrals
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

    // Get referrals made by the user
    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(referrals);
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referrals' },
      { status: 500 }
    );
  }
} 