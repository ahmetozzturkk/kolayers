import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { sign } from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, referralCode } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      }
    });

    // If referral code was provided, handle the referral
    if (referralCode) {
      try {
        // Find the referring user by their ID
        const referringUser = await prisma.user.findFirst({
          where: {
            id: referralCode
          }
        });

        // Only create a referral if the referring user exists
        if (referringUser) {
          await prisma.referral.create({
            data: {
              referrerId: referringUser.id,
              referredEmail: email,
              status: 'accepted'
            }
          });
        } else {
          console.log(`No user found with referral code/ID: ${referralCode}`);
        }
      } catch (referralError) {
        console.error('Error processing referral:', referralError);
        // Continue with registration even if referral processing fails
      }
    }

    // Create token
    const token = sign(
      { 
        id: user.id,
        email: user.email,
        name: user.name 
      },
      process.env.NEXTAUTH_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    // Create response with user data and set cookie
    const response = NextResponse.json(userWithoutPassword);
    
    // Set token cookie
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    return response;
  } catch (error) {
    console.error('Error during registration:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
} 