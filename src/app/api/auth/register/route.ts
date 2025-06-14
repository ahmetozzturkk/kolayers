import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import * as jose from 'jose';

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
          // Temporarily log the issue and skip the referral creation
          console.log('Skipping referral creation in registration due to schema compatibility issues.');
          
          // TODO: Fix referral creation once schema is properly synchronized
          // Once the schema is updated and Prisma client is regenerated, uncomment this code:
          /*
          await prisma.referral.create({
            data: {
              referrer: {
                connect: {
                  id: referringUser.id
                }
              },
              firstName: name.split(' ')[0],
              lastName: name.split(' ').slice(1).join(' ') || '-',
              email: email,
              department: 'New User',
              taskId: 'registration',
              status: 'accepted'
            }
          });
          */
        } else {
          console.log(`No user found with referral code/ID: ${referralCode}`);
        }
      } catch (referralError) {
        console.error('Error processing referral:', referralError);
        // Continue with registration even if referral processing fails
      }
    }

    // Create payload
    const payload = { 
      id: user.id,
      email: user.email,
      name: user.name 
    };
    
    // Create token using jose
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret');
    const token = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    // Create response with user data and set cookie
    const response = NextResponse.json(userWithoutPassword);
    
    // Get host from request for dynamic cookie domain
    const host = request.headers.get('host') || '';
    const domain = host.includes('localhost') ? undefined : 
                  host.includes('.vercel.app') ? host : 
                  host;

    // Set token cookie with proper settings for both development and production
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: !host.includes('localhost'),
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      // Dynamic domain based on request
      domain: host.includes('localhost') ? undefined : undefined // Don't set domain to allow subdomains
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