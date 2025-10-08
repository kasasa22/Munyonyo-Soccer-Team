import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getAuthUser, unauthorizedResponse, successResponse, errorResponse } from '@/lib/auth-utils';

interface PlayerMonthlyData {
  playerId: string;
  playerName: string;
  phone: string;
  expectedAmount: number;
  amountPaid: number;
  balance: number;
  lastPaymentDate: string | null;
  paymentCount: number;
  status: 'Paid' | 'Partial' | 'Unpaid';
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const limit = parseInt(searchParams.get('limit') || '0');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch all players and payments
    const [playersSnapshot, paymentsSnapshot] = await Promise.all([
      adminDb.collection('players').get(),
      adminDb.collection('payments').where('paymentType', '==', 'monthly').get()
    ]);

    const players = playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const allPayments = paymentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const reportData: PlayerMonthlyData[] = [];

    for (const player of players) {
      // Filter payments for this player in the specified month/year
      const monthPayments = allPayments.filter((p: any) => {
        const paymentDate = new Date(p.date);
        return p.playerId === player.id &&
               paymentDate.getMonth() + 1 === month &&
               paymentDate.getFullYear() === year;
      });

      const expectedAmount = player.monthly || 10000;
      const amountPaid = monthPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
      const balance = expectedAmount - amountPaid;

      const sortedPayments = monthPayments.sort((a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const lastPaymentDate = sortedPayments.length > 0 ? sortedPayments[0].date : null;

      let status: 'Paid' | 'Partial' | 'Unpaid';
      if (amountPaid >= expectedAmount) {
        status = 'Paid';
      } else if (amountPaid > 0) {
        status = 'Partial';
      } else {
        status = 'Unpaid';
      }

      reportData.push({
        playerId: player.id,
        playerName: player.name,
        phone: player.phone,
        expectedAmount,
        amountPaid,
        balance,
        lastPaymentDate,
        paymentCount: monthPayments.length,
        status
      });
    }

    // Sort by balance (highest first)
    reportData.sort((a, b) => b.balance - a.balance);

    // Calculate summary
    const summary = {
      month,
      year,
      totalPlayers: reportData.length,
      totalExpected: reportData.reduce((sum, p) => sum + p.expectedAmount, 0),
      totalPaid: reportData.reduce((sum, p) => sum + p.amountPaid, 0),
      totalBalance: reportData.reduce((sum, p) => sum + p.balance, 0),
      paidCount: reportData.filter(p => p.status === 'Paid').length,
      partialCount: reportData.filter(p => p.status === 'Partial').length,
      unpaidCount: reportData.filter(p => p.status === 'Unpaid').length,
    };

    const paginatedData = limit > 0
      ? reportData.slice(offset, offset + limit)
      : reportData;

    return successResponse({
      summary,
      data: paginatedData,
      totalRecords: reportData.length,
      hasMore: limit > 0 && (offset + limit) < reportData.length
    });
  } catch (error) {
    console.error('Monthly report error:', error);
    return errorResponse('Internal server error', 500);
  }
}
