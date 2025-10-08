import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getAuthUser, unauthorizedResponse, successResponse, errorResponse } from '@/lib/auth-utils';
import { CreatePaymentRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const body: CreatePaymentRequest = await request.json();
    const { playerId, playerName, paymentType, amount, date } = body;

    if (!playerId || !playerName || !paymentType || !amount) {
      return errorResponse('All required fields must be provided', 400);
    }

    const paymentRef = adminDb.collection('payments').doc();
    const now = new Date().toISOString();

    const newPayment = {
      playerId,
      playerName,
      paymentType,
      amount,
      date: date || new Date().toISOString().split('T')[0],
      createdBy: authUser.uid,
      createdAt: now,
      updatedAt: now,
    };

    await paymentRef.set(newPayment);

    return successResponse({ id: paymentRef.id, ...newPayment }, 201);
  } catch (error) {
    console.error('Create payment error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0');
    const limit = parseInt(searchParams.get('limit') || '100');
    const playerId = searchParams.get('player_id');
    const paymentType = searchParams.get('payment_type');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    let query: any = adminDb.collection('payments');

    // Apply filters
    if (playerId) {
      query = query.where('playerId', '==', playerId);
    }
    if (paymentType) {
      query = query.where('paymentType', '==', paymentType);
    }
    if (startDate) {
      query = query.where('date', '>=', startDate);
    }
    if (endDate) {
      query = query.where('date', '<=', endDate);
    }

    query = query.orderBy('date', 'desc').limit(limit).offset(skip);

    const snapshot = await query.get();
    const payments = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    return successResponse(payments);
  } catch (error) {
    console.error('Get payments error:', error);
    return errorResponse('Internal server error', 500);
  }
}
