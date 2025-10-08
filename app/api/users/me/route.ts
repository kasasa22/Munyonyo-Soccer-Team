import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getAuthUser, unauthorizedResponse, successResponse, errorResponse } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const userDoc = await adminDb.collection('users').doc(authUser.uid).get();

    if (!userDoc.exists) {
      return errorResponse('User not found', 404);
    }

    const userData = userDoc.data();
    const { passwordHash, ...userWithoutPassword } = userData!;

    return successResponse({
      id: userDoc.id,
      ...userWithoutPassword,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return errorResponse('Internal server error', 500);
  }
}
