import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('=== /api/auth/me called ===');
    
    // Check all cookies
    const allCookies = request.cookies.getAll();
    console.log('All cookies:', allCookies);
    
    const token = request.cookies.get('auth-token')?.value;
    console.log('Auth token from cookie:', token ? 'Present' : 'Missing');

    if (!token) {
      console.log('No auth token found in cookies');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.log('Token value:', token.substring(0, 20) + '...');

    const user = await getUserFromToken(token);
    console.log('User from token:', user ? user.email : 'null');
    
    if (!user) {
      console.log('Invalid token or user not found');
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    console.log('Auth successful for user:', user.email);
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}