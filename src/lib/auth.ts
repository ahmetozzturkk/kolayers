import { cookies } from 'next/headers';
import * as jose from 'jose';

// Define the shape of the JWT payload
interface JwtPayload {
  id: string;
  email: string;
  name?: string;
  iat: number;
  exp: number;
}

/**
 * Verifies a user's authentication status from the request
 * @param request The incoming request
 * @returns The user ID if authenticated, null otherwise
 */
export async function verifyAuth(request: Request): Promise<string | null> {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    // If no token, check Authorization header (for API calls)
    if (!token) {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
      }
      
      const headerToken = authHeader.split(' ')[1];
      if (!headerToken) return null;
      
      try {
        const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret');
        const { payload } = await jose.jwtVerify<JwtPayload>(headerToken, secret);
        return payload.id;
      } catch (error) {
        console.error('Invalid token in header:', error);
        return null;
      }
    }
    
    // Verify the token from cookies
    try {
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret');
      const { payload } = await jose.jwtVerify<JwtPayload>(token, secret);
      return payload.id;
    } catch (error) {
      console.error('Invalid token in cookie:', error);
      return null;
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
} 