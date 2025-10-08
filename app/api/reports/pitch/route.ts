import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getAuthUser, unauthorizedResponse, successResponse, errorResponse } from '@/lib/auth-utils';

interface PlayerPitchData {
  playerId: string;
  playerName: string;
  phone: string;
  expectedAmount: number;
  amountPaid: number;
  balance: number;
  paymentCount: number;
  paymentDates: string[];
  status: 'Complete' | 'Partial' | 'Unpaid';
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '0');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch players and pitch payments
    const [playersSnapshot, paymentsSnapshot] = await Promise.all([
      adminDb.collection('players').get(),
      adminDb.collection('payments').where('paymentType', '==', 'pitch').get()
    ]);

    const players = playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const allPayments = paymentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Filter by date range if provided
    const filteredPayments = allPayments.filter((p: any) => {
      if (!startDate && !endDate) return true;
      const paymentDate = new Date(p.date);
      if (startDate && paymentDate < new Date(startDate)) return false;
      if (endDate && paymentDate > new Date(endDate)) return false;
      return true;
    });

    const reportData: PlayerPitchData[] = [];

    for (const player of players) {
      const playerPayments = filteredPayments.filter((p: any) => p.playerId === player.id);

      const expectedAmount = player.pitch || 5000;
      const amountPaid = playerPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
      const balance = expectedAmount - amountPaid;

      const paymentDates = playerPayments.map((p: any) => p.date).sort();

      let status: 'Complete' | 'Partial' | 'Unpaid';
      if (amountPaid >= expectedAmount) {
        status = 'Complete';
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
        paymentCount: playerPayments.length,
        paymentDates,
        status
      });
    }

    // Sort by balance
    reportData.sort((a, b) => b.balance - a.balance);

    const summary = {
      startDate: startDate || null,
      endDate: endDate || null,
      totalPlayers: reportData.length,
      totalExpected: reportData.reduce((sum, p) => sum + p.expectedAmount, 0),
      totalPaid: reportData.reduce((sum, p) => sum + p.amountPaid, 0),
      totalBalance: reportData.reduce((sum, p) => sum + p.balance, 0),
      completeCount: reportData.filter(p => p.status === 'Complete').length,
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
    console.error('Pitch report error:', error);
    return errorResponse('Internal server error', 500);
  }
}
