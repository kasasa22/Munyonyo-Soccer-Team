import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getAuthUser, unauthorizedResponse, successResponse, errorResponse } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    // Get all payments and calculate statistics in one query
    const paymentsSnapshot = await adminDb.collection('payments').get();

    const stats = {
      annual_total: 0,
      monthly_total: 0,
      pitch_total: 0,
      matchday_total: 0,
      total_amount: 0,
      total_payments: paymentsSnapshot.size
    };

    paymentsSnapshot.forEach(doc => {
      const payment = doc.data();
      const amount = parseFloat(payment.amount) || 0;
      stats.total_amount += amount;

      switch (payment.paymentType) {
        case 'annual':
          stats.annual_total += amount;
          break;
        case 'monthly':
          stats.monthly_total += amount;
          break;
        case 'pitch':
          stats.pitch_total += amount;
          break;
        case 'matchday':
          stats.matchday_total += amount;
          break;
      }
    });

    return successResponse(stats);
  } catch (error) {
    console.error('Payment summary error:', error);
    return errorResponse('Internal server error', 500);
  }
}
