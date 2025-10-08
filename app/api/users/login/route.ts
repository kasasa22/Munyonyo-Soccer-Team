import { NextRequest } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { successResponse, errorResponse } from '@/lib/auth-utils';
import { LoginRequest, UserStatus } from '@/lib/types';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    // Get user from Firestore
    const usersRef = adminDb.collection('users');
    const snapshot = await usersRef.where('email', '==', email).limit(1).get();

    if (snapshot.empty) {
      return errorResponse('Invalid credentials', 401);
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    // Verify password
    const isValidPassword = await bcrypt.compare(password, userData.passwordHash || '');
    if (!isValidPassword) {
      return errorResponse('Invalid credentials', 401);
    }

    // Check user status
    if (userData.status !== UserStatus.ACTIVE) {
      return errorResponse('User account is not active', 401);
    }

    // Create custom token for Firebase Auth
    const customToken = await adminAuth.createCustomToken(userDoc.id, {
      email: userData.email,
      role: userData.role,
    });

    // Return user data without password hash
    const { passwordHash, ...userWithoutPassword } = userData;

    return successResponse({
      message: 'Login successful',
      user: { id: userDoc.id, ...userWithoutPassword },
      token: customToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Internal server error', 500);
  }
}
