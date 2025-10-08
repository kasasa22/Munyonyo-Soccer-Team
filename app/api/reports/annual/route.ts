import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getAuthUser, unauthorizedResponse, successResponse, errorResponse } from '@/lib/auth-utils';

interface PlayerAnnualData {
  playerId: string;
  playerName: string;
  phone: string;
  expectedAmount: number;
  amountPaid: number;
  balance: number;
  carryover: number;
  totalDue: number;
  lastPaymentDate: string | null;
  paymentCount: number;
  status: 'Complete' | 'Partial' | 'Unpaid';
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || new Date().getFullYear().toString();
    const limit = parseInt(searchParams.get('limit') || '0'); // 0 = all data (for PDF)
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch all players and payments in parallel
    const [playersSnapshot, paymentsSnapshot] = await Promise.all([
      adminDb.collection('players').get(),
      adminDb.collection('payments').where('paymentType', '==', 'annual').get()
    ]);

    const players = playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const allPayments = paymentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const reportData: PlayerAnnualData[] = [];
    const yearInt = parseInt(year);

    for (const player of players) {
      // Get payments for selected year
      const yearPayments = allPayments.filter((p: any) => {
        const paymentYear = new Date(p.date).getFullYear();
        return p.playerId === player.id && paymentYear === yearInt;
      });

      // Get payments for previous year (for carryover calculation)
      const previousYearPayments = allPayments.filter((p: any) => {
        const paymentYear = new Date(p.date).getFullYear();
        return p.playerId === player.id && paymentYear === (yearInt - 1);
      });

      // Calculate amounts
      const expectedAmount = player.annual || 150000; // Default annual fee
      const amountPaid = yearPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

      // Calculate carryover from previous year (only for 2026+)
      let carryover = 0;
      if (yearInt >= 2026) {
        const previousYearPaid = previousYearPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
        const previousYearExpected = player.annual || 150000;
        carryover = Math.max(0, previousYearExpected - previousYearPaid);
      }

      const totalDue = expectedAmount + carryover;
      const balance = totalDue - amountPaid;

      // Get last payment date
      const sortedPayments = yearPayments.sort((a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const lastPaymentDate = sortedPayments.length > 0 ? sortedPayments[0].date : null;

      // Determine status
      let status: 'Complete' | 'Partial' | 'Unpaid';
      if (amountPaid >= totalDue) {
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
        carryover,
        totalDue,
        lastPaymentDate,
        paymentCount: yearPayments.length,
        status
      });
    }

    // Sort by balance (highest first)
    reportData.sort((a, b) => b.balance - a.balance);

    // Calculate summary
    const summary = {
      totalPlayers: reportData.length,
      totalExpected: reportData.reduce((sum, p) => sum + p.totalDue, 0),
      totalPaid: reportData.reduce((sum, p) => sum + p.amountPaid, 0),
      totalBalance: reportData.reduce((sum, p) => sum + p.balance, 0),
      totalCarryover: reportData.reduce((sum, p) => sum + p.carryover, 0),
      completeCount: reportData.filter(p => p.status === 'Complete').length,
      partialCount: reportData.filter(p => p.status === 'Partial').length,
      unpaidCount: reportData.filter(p => p.status === 'Unpaid').length,
    };

    // Apply pagination if limit is specified
    const paginatedData = limit > 0
      ? reportData.slice(offset, offset + limit)
      : reportData;

    return successResponse({
      year: yearInt,
      summary,
      data: paginatedData,
      totalRecords: reportData.length,
      hasMore: limit > 0 && (offset + limit) < reportData.length
    });
  } catch (error) {
    console.error('Annual report error:', error);
    return errorResponse('Internal server error', 500);
  }
}
