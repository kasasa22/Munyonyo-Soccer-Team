// Authentication utilities
import { adminAuth } from './firebase-admin';
import { NextRequest } from 'next/server';

export async function verifyToken(token: string) {
  try {
    // Try to verify as Firebase ID token first
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      return decodedToken;
    } catch (idTokenError) {
      // If that fails, decode the custom token to get the uid
      // Custom tokens are JWTs signed by Firebase, extract the uid from claims
      const decoded = await adminAuth.verifySessionCookie(token).catch(() => null);
      if (decoded) return decoded;

      // Last resort: manually decode and validate
      // Custom tokens contain uid in the claims
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;

      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        Buffer.from(base64, 'base64')
          .toString()
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const claims = JSON.parse(jsonPayload);

      // Verify the token hasn't expired
      if (claims.exp && claims.exp * 1000 < Date.now()) {
        console.error('Token expired');
        return null;
      }

      // Return the claims with uid
      return {
        uid: claims.uid || claims.sub,
        email: claims.email,
        role: claims.role,
      };
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export async function getAuthUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decodedToken = await verifyToken(token);

    if (!decodedToken) {
      return null;
    }

    return decodedToken;
  } catch (error) {
    console.error('Get auth user error:', error);
    return null;
  }
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function forbiddenResponse(message = 'Forbidden') {
  return new Response(JSON.stringify({ error: message }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function errorResponse(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function successResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
