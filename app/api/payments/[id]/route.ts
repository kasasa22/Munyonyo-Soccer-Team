import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getAuthUser, unauthorizedResponse, successResponse, errorResponse } from '@/lib/auth-utils';
import { UpdatePaymentRequest } from '@/lib/types';

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

    const paymentDoc = await adminDb.collection('payments').doc(id).get();

    if (!paymentDoc.exists) {
      return errorResponse('Payment not found', 404);
    }

    return successResponse({ id: paymentDoc.id, ...paymentDoc.data() });
  } catch (error) {
    console.error('Get payment error:', error);
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

    const body: UpdatePaymentRequest = await request.json();

    const paymentDoc = await adminDb.collection('payments').doc(id).get();
    if (!paymentDoc.exists) {
      return errorResponse('Payment not found', 404);
    }

    const updateData = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await adminDb.collection('payments').doc(id).update(updateData);

    const updatedDoc = await adminDb.collection('payments').doc(id).get();
    return successResponse({ id: id, ...updatedDoc.data() });
  } catch (error) {
    console.error('Update payment error:', error);
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

    const paymentDoc = await adminDb.collection('payments').doc(id).get();
    if (!paymentDoc.exists) {
      return errorResponse('Payment not found', 404);
    }

    await adminDb.collection('payments').doc(id).delete();

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Delete payment error:', error);
    return errorResponse('Internal server error', 500);
  }
}
