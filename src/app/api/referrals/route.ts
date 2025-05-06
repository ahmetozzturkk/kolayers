import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// Create a new referral
export async function POST(request: Request) {
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
    const { referredEmail } = body;

    if (!referredEmail) {
      return NextResponse.json(
        { error: 'Referred email is required' },
        { status: 400 }
      );
    }

    // Check if the referred email already exists as a user
    const existingUser = await prisma.user.findUnique({
      where: { email: referredEmail }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Check if a referral already exists for this email
    const existingReferral = await prisma.referral.findFirst({
      where: {
        referredEmail
      }
    });

    if (existingReferral) {
      return NextResponse.json(
        { error: 'Referral for this email already exists' },
        { status: 400 }
      );
    }

    // Create the referral
    const referral = await prisma.referral.create({
      data: {
        referrerId: userId,
        referredEmail,
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
export async function GET(request: Request) {
  try {
    // Verify authentication
    const userId = await verifyAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all referrals made by the user
    const referrals = await prisma.referral.findMany({
      where: {
        referrerId: userId
      },
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