// lib/edge-auth.ts - Edge Runtime compatible JWT verification

import { JWTPayload } from './auth';
import type { NextRequest } from 'next/server';

/**
 * Edge Runtime compatible JWT verification using Web Crypto API
 */
export async function verifyJWTEdge(token: string): Promise<JWTPayload> {
  if (!token) {
    throw new Error('No token provided');
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  const [headerBase64, payloadBase64, signatureBase64] = parts;

  // Decode header and payload
  const header = JSON.parse(atob(headerBase64.replace(/-/g, '+').replace(/_/g, '/')));
  const payload = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));

  // Check if token is expired
  if (payload.exp && Date.now() >= payload.exp * 1000) {
    throw new Error('Token expired');
  }

  // Verify signature using Web Crypto API
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET not configured');
  }

  // Convert secret to Uint8Array
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);

  // Import the key
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  // Create the signature data
  const signatureData = encoder.encode(`${headerBase64}.${payloadBase64}`);

  // Convert base64url signature to ArrayBuffer
  const signature = Uint8Array.from(
    atob(signatureBase64.replace(/-/g, '+').replace(/_/g, '/')), 
    c => c.charCodeAt(0)
  );

  // Verify the signature
  const isValid = await crypto.subtle.verify(
    'HMAC',
    cryptoKey,
    signature,
    signatureData
  );

  if (!isValid) {
    throw new Error('Invalid signature');
  }

  // Return the payload
  return {
    userId: payload.userId,
    email: payload.email,
    role: payload.role
  };
}

/**
 * Authenticate a request using the auth-token cookie and Edge JWT verification
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<{ isAuthenticated: boolean; user?: JWTPayload }> {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return { isAuthenticated: false };
    }

    const decoded = await verifyJWTEdge(token);
    return { isAuthenticated: true, user: decoded };
  } catch {
    return { isAuthenticated: false };
  }
}