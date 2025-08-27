import { NextRequest, NextResponse } from 'next/server';
import { login, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Login: Starting login process...');
    
    const body = await request.json();
    const { email, password } = body;
    console.log('📧 Login: Email:', email);
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    const result = await login(email, password);
    console.log('🔑 Login: Result:', result.error ? 'FAILED' : 'SUCCESS');
    
    if (result.error) {
      console.log('❌ Login: Error:', result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }
    
    console.log('👤 Login: User:', result.user);
    console.log('🎫 Login: Token generated:', !!result.token);
    
    // Create response with user data
    const response = NextResponse.json(
      { user: result.user },
      { status: 200 }
    );
    
    // Set auth cookie
    console.log('🍪 Login: Setting auth cookie...');
    return setAuthCookie(response, result.token);
  } catch (error) {
    console.error('❌ Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
} 