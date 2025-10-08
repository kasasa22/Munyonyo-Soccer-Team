import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getAuthUser, unauthorizedResponse, successResponse, errorResponse } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0');
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search');

    let query = adminDb.collection('users').orderBy('createdAt', 'desc');

    // Apply search filter if provided
    if (search) {
      // Note: Firestore doesn't support full-text search natively
      // This is a simple case-insensitive search on name and email
      const usersSnapshot = await query.get();
      const filteredUsers = usersSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => {
          const searchLower = search.toLowerCase();
          return (
            user.name.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower)
          );
        })
        .slice(skip, skip + limit)
        .map(({ passwordHash, ...user }) => user);

      return successResponse(filteredUsers);
    }

    // Without search, use pagination
    const snapshot = await query.limit(limit).offset(skip).get();

    const users = snapshot.docs.map(doc => {
      const { passwordHash, ...userData } = doc.data();
      return { id: doc.id, ...userData };
    });

    return successResponse(users);
  } catch (error) {
    console.error('Get users error:', error);
    return errorResponse('Internal server error', 500);
  }
}
