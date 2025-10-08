import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getAuthUser, unauthorizedResponse, successResponse, errorResponse } from '@/lib/auth-utils';
import { UpdatePlayerRequest } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const playerDoc = await adminDb.collection('players').doc(id).get();

    if (!playerDoc.exists) {
      return errorResponse('Player not found', 404);
    }

    return successResponse({ id: playerDoc.id, ...playerDoc.data() });
  } catch (error) {
    console.error('Get player error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const body: UpdatePlayerRequest = await request.json();

    const playerDoc = await adminDb.collection('players').doc(id).get();
    if (!playerDoc.exists) {
      return errorResponse('Player not found', 404);
    }

    const updateData = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await adminDb.collection('players').doc(id).update(updateData);

    const updatedDoc = await adminDb.collection('players').doc(id).get();
    return successResponse({ id, ...updatedDoc.data() });
  } catch (error) {
    console.error('Update player error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const playerDoc = await adminDb.collection('players').doc(id).get();
    if (!playerDoc.exists) {
      return errorResponse('Player not found', 404);
    }

    await adminDb.collection('players').doc(id).delete();

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Delete player error:', error);
    return errorResponse('Internal server error', 500);
  }
}
