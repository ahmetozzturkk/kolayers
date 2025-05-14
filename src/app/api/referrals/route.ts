import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface ReferralFormData {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  message?: string;
  taskId: string;
}

// Create a new referral
export async function POST(request: NextRequest) {
  try {
    const body: ReferralFormData = await request.json();
    const { firstName, lastName, email, department, message, taskId } = body;

    // Basic validation
    if (!firstName || !lastName || !email || !department || !taskId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Save the referral data to the database
    try {
      const referral = await prisma.referral.create({
        data: {
          firstName,
          lastName,
          email,
          department,
          message: message || '',
          taskId,
          status: 'pending',
        }
      });

      return NextResponse.json(referral, { status: 201 });
    } catch (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to store referral data in database');
    }
  } catch (error) {
    console.error('Error creating referral:', error);
    return NextResponse.json(
      { error: 'Failed to create referral' },
      { status: 500 }
    );
  }
}

// Retrieve referrals
export async function GET(request: NextRequest) {
  try {
    const referrals = await prisma.referral.findMany({
      orderBy: { createdAt: 'desc' }
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