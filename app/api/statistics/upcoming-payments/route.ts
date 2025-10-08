import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getAuthUser, unauthorizedResponse, successResponse, errorResponse } from '@/lib/auth-utils';

interface PlayerPaymentStatus {
  player: {
    id: string;
    name: string;
    phone: string;
    annual: number;
    monthly: number;
    pitch: number;
  };
  lastPayment: {
    paymentType: string;
    amount: number;
    date: string;
  } | null;
  isDue: boolean;
  isOverdue: boolean;
  daysOverdue: number;
  expectedAmount: number;
  paymentType: string;
  nextDueDate: string | null;
  status: 'up_to_date' | 'due_soon' | 'overdue';
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Fetch players and payments in parallel
    const [playersSnapshot, paymentsSnapshot] = await Promise.all([
      adminDb.collection('players').get(),
      adminDb.collection('payments').orderBy('date', 'desc').get()
    ]);

    const players = playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const payments = paymentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const playersWithStatus: PlayerPaymentStatus[] = [];

    for (const player of players) {
      const playerPayments = payments.filter((p: any) => p.playerId === player.id);
      const lastPayment = playerPayments.length > 0 ? playerPayments[0] : null;

      // Simplified calculation for fiscal year (July-June)
      const fiscalStartMonth = 7; // July
      let fiscalYear = currentYear;
      if (currentMonth < fiscalStartMonth) {
        fiscalYear = currentYear - 1;
      }

      const fiscalYearStart = new Date(fiscalYear, fiscalStartMonth - 1, 1);
      const monthsSinceFiscalStart = Math.floor((now.getTime() - fiscalYearStart.getTime()) / (30.44 * 24 * 60 * 60 * 1000));

      // Check annual payment
      const annualPayments = playerPayments.filter((p: any) =>
        p.paymentType === 'annual' &&
        new Date(p.date) >= fiscalYearStart
      );
      const hasAnnual = annualPayments.length > 0;

      // Check monthly payments
      const monthlyPayments = playerPayments.filter((p: any) => {
        const paymentDate = new Date(p.date);
        return p.paymentType === 'monthly' && paymentDate >= fiscalYearStart;
      });
      const monthlyPaid = monthlyPayments.length;

      let isDue = false;
      let isOverdue = false;
      let daysOverdue = 0;
      let expectedAmount = player.monthly;
      let paymentType = 'monthly';
      let nextDueDate: Date | null = null;
      let status: 'up_to_date' | 'due_soon' | 'overdue' = 'up_to_date';

      if (!hasAnnual) {
        // No annual payment - check monthly
        const expectedMonthlyPayments = monthsSinceFiscalStart + 1;
        if (monthlyPaid < expectedMonthlyPayments) {
          isDue = true;
          const missedMonths = expectedMonthlyPayments - monthlyPaid;
          if (missedMonths > 1) {
            isOverdue = true;
            daysOverdue = missedMonths * 30;
            status = 'overdue';
          } else {
            status = 'due_soon';
          }
        }
      }

      if (isDue || isOverdue) {
        playersWithStatus.push({
          player: {
            id: player.id,
            name: player.name,
            phone: player.phone,
            annual: player.annual,
            monthly: player.monthly,
            pitch: player.pitch,
          },
          lastPayment: lastPayment ? {
            paymentType: lastPayment.paymentType,
            amount: lastPayment.amount,
            date: lastPayment.date
          } : null,
          isDue,
          isOverdue,
          daysOverdue,
          expectedAmount,
          paymentType,
          nextDueDate: nextDueDate ? nextDueDate.toISOString() : null,
          status
        });
      }
    }

    // Sort by most overdue first
    playersWithStatus.sort((a, b) => b.daysOverdue - a.daysOverdue);

    return successResponse(playersWithStatus.slice(0, limit));
  } catch (error) {
    console.error('Upcoming payments error:', error);
    return errorResponse('Internal server error', 500);
  }
}
