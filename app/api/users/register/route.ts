import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getAuthUser, unauthorizedResponse, forbiddenResponse, successResponse, errorResponse } from '@/lib/auth-utils';
import { CreateUserRequest, UserRole, UserStatus } from '@/lib/types';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    // Get user role from Firestore
    const userDoc = await adminDb.collection('users').doc(authUser.uid).get();
    if (!userDoc.exists || userDoc.data()?.role !== UserRole.ADMIN) {
      return forbiddenResponse('Admin access required');
    }

    const body: CreateUserRequest = await request.json();
    const { name, email, role, password } = body;

    if (!name || !email || !role || !password) {
      return errorResponse('All fields are required', 400);
    }

    // Check if user already exists
    const existingUser = await adminDb.collection('users').where('email', '==', email).limit(1).get();
    if (!existingUser.empty) {
      return errorResponse('User with this email already exists', 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user in Firestore
    const userRef = adminDb.collection('users').doc();
    const now = new Date().toISOString();

    const newUser = {
      name,
      email,
      role,
      status: UserStatus.ACTIVE,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    };

    await userRef.set(newUser);

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = newUser;

    return successResponse(
      { id: userRef.id, ...userWithoutPassword },
      201
    );
  } catch (error) {
    console.error('Register error:', error);
    return errorResponse('Internal server error', 500);
  }
}
