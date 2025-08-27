import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { jwtVerify, SignJWT } from 'jose';
import * as jose from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Verify JWT token from request cookies
export async function verifyAuth(request: NextRequest): Promise<string | null> {
  try {
    console.log('🔑 verifyAuth: Starting token verification...');
    
    // Get the token from cookies
    const token = request.cookies.get('token')?.value;
    console.log('🍪 verifyAuth: Token found?', !!token);
    
    if (!token) {
      console.log('❌ verifyAuth: No token found in cookies');
      return null;
    }
    
    console.log('🔐 verifyAuth: JWT_SECRET length:', JWT_SECRET?.length || 0);
    console.log('🔐 verifyAuth: Using secret:', JWT_SECRET ? 'SECRET_EXISTS' : 'NO_SECRET');
    
    // Verify the token using jose (same library as used in registration)
    const secret = new TextEncoder().encode(JWT_SECRET);
    console.log('🔐 verifyAuth: Encoded secret length:', secret.length);
    
    const { payload } = await jwtVerify(token, secret);
    console.log('✅ verifyAuth: Token verified successfully');
    console.log('👤 verifyAuth: Payload:', payload);
    
    return payload.id as string;
  } catch (error) {
    console.error('❌ verifyAuth: Auth verification error:', error);
    return null;
  }
}

// Sign up a new user
export async function signUp(email: string, password: string, name?: string) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return { error: 'User already exists' };
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create the user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0]
      }
    });
    
    // Create JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    return { user: { id: user.id, email: user.email, name: user.name }, token };
  } catch (error) {
    console.error('Sign up error:', error);
    return { error: 'Failed to create user' };
  }
}

// Log in a user  
export async function login(email: string, password: string) {
  try {
    console.log('🔐 lib/auth login: Finding user with email:', email);
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.log('❌ lib/auth login: User not found');
      return { error: 'Invalid credentials' };
    }
    
    console.log('👤 lib/auth login: User found:', user.id);
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log('❌ lib/auth login: Invalid password');
      return { error: 'Invalid credentials' };
    }
    
    console.log('✅ lib/auth login: Password valid, creating token...');
    
    // Create JWT token using jose (consistent with registration and verification)
    const secret = new TextEncoder().encode(JWT_SECRET);
    const payload = { 
      id: user.id,  // Use 'id' not 'userId' to match verification
      email: user.email,
      name: user.name 
    };
    
    const token = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret);
    
    console.log('🎫 lib/auth login: Token created successfully');
    
    return { user: { id: user.id, email: user.email, name: user.name }, token };
  } catch (error) {
    console.error('❌ lib/auth login error:', error);
    return { error: 'Failed to log in' };
  }
}

// Helper function to set auth cookie
export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: 'token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  });
  
  return response;
} 