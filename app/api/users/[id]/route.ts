import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getAuthUser, unauthorizedResponse, forbiddenResponse, successResponse, errorResponse } from '@/lib/auth-utils';
import { UpdateUserRequest, UserRole } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(request);
    const { id } = await params;
    if (!authUser) {
      return unauthorizedResponse();
    }

    const userDoc = await adminDb.collection('users').doc(id).get();

    if (!userDoc.exists) {
      return errorResponse('User not found', 404);
    }

    const userData = userDoc.data();
    const { passwordHash, ...userWithoutPassword } = userData!;

    return successResponse({ id: userDoc.id, ...userWithoutPassword });
  } catch (error) {
    console.error('Get user error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(request);
    const { id } = await params;
    if (!authUser) {
      return unauthorizedResponse();
    }

    // Get current user's role
    const currentUserDoc = await adminDb.collection('users').doc(authUser.uid).get();
    const currentUserData = currentUserDoc.data();

    // Users can only update their own profile unless they're admin
    if (authUser.uid !== id && currentUserData?.role !== UserRole.ADMIN) {
      return forbiddenResponse('Not enough permissions');
    }

    const body: UpdateUserRequest = await request.json();

    // Get existing user
    const userDoc = await adminDb.collection('users').doc(id).get();
    if (!userDoc.exists) {
      return errorResponse('User not found', 404);
    }

    // Update user
    const updateData: any = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await adminDb.collection('users').doc(id).update(updateData);

    // Get updated user
    const updatedDoc = await adminDb.collection('users').doc(id).get();
    const { passwordHash, ...userWithoutPassword } = updatedDoc.data()!;

    return successResponse({ id: id, ...userWithoutPassword });
  } catch (error) {
    console.error('Update user error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(request);
    const { id } = await params;
    if (!authUser) {
      return unauthorizedResponse();
    }

    // Check if admin
    const currentUserDoc = await adminDb.collection('users').doc(authUser.uid).get();
    if (!currentUserDoc.exists || currentUserDoc.data()?.role !== UserRole.ADMIN) {
      return forbiddenResponse('Admin access required');
    }

    const userDoc = await adminDb.collection('users').doc(id).get();
    if (!userDoc.exists) {
      return errorResponse('User not found', 404);
    }

    await adminDb.collection('users').doc(id).delete();

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Delete user error:', error);
    return errorResponse('Internal server error', 500);
  }
}
