import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getAuthUser, unauthorizedResponse, successResponse, errorResponse } from '@/lib/auth-utils';
import { UpdateMatchDayRequest } from '@/lib/types';

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

    const matchDayDoc = await adminDb.collection('match_days').doc(id).get();

    if (!matchDayDoc.exists) {
      return errorResponse('Match day not found', 404);
    }

    return successResponse({ id: matchDayDoc.id, ...matchDayDoc.data() });
  } catch (error) {
    console.error('Get match day error:', error);
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

    const body: UpdateMatchDayRequest = await request.json();

    const matchDayDoc = await adminDb.collection('match_days').doc(id).get();
    if (!matchDayDoc.exists) {
      return errorResponse('Match day not found', 404);
    }

    await adminDb.collection('match_days').doc(id).update(body);

    const updatedDoc = await adminDb.collection('match_days').doc(id).get();
    return successResponse({ id: id, ...updatedDoc.data() });
  } catch (error) {
    console.error('Update match day error:', error);
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

    const matchDayDoc = await adminDb.collection('match_days').doc(id).get();
    if (!matchDayDoc.exists) {
      return errorResponse('Match day not found', 404);
    }

    await adminDb.collection('match_days').doc(id).delete();

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Delete match day error:', error);
    return errorResponse('Internal server error', 500);
  }
}
