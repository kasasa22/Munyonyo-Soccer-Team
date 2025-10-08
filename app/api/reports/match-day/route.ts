import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getAuthUser, unauthorizedResponse, successResponse, errorResponse } from '@/lib/auth-utils';

interface MatchDayReportData {
  matchDayId: string;
  matchDate: string;
  opponent: string | null;
  venue: string | null;
  matchType: string;
  totalExpenses: number;
  totalPayments: number;
  netBalance: number;
  expenseBreakdown: {
    category: string;
    amount: number;
  }[];
  paymentBreakdown: {
    playerName: string;
    amount: number;
  }[];
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const matchDayId = searchParams.get('match_day_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let matchDaysQuery: any = adminDb.collection('match_days').orderBy('matchDate', 'desc');

    // Filter by date range
    if (startDate) {
      matchDaysQuery = matchDaysQuery.where('matchDate', '>=', startDate);
    }
    if (endDate) {
      matchDaysQuery = matchDaysQuery.where('matchDate', '<=', endDate);
    }

    // If specific match day requested
    if (matchDayId) {
      const matchDayDoc = await adminDb.collection('match_days').doc(matchDayId).get();
      if (!matchDayDoc.exists) {
        return errorResponse('Match day not found', 404);
      }

      const matchDay = { id: matchDayDoc.id, ...matchDayDoc.data() };

      // Fetch expenses and payments for this match day
      const [expensesSnapshot, paymentsSnapshot] = await Promise.all([
        adminDb.collection('expenses').where('matchDayId', '==', matchDayId).get(),
        adminDb.collection('payments').where('paymentType', '==', 'matchday').get()
      ]);

      const expenses = expensesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const payments = paymentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const totalExpenses = expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
      const totalPayments = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

      const expenseBreakdown = expenses.reduce((acc: any[], expense: any) => {
        const existing = acc.find(item => item.category === expense.category);
        if (existing) {
          existing.amount += expense.amount;
        } else {
          acc.push({ category: expense.category, amount: expense.amount });
        }
        return acc;
      }, []);

      const paymentBreakdown = payments.map((p: any) => ({
        playerName: p.playerName,
        amount: p.amount
      }));

      const reportData: MatchDayReportData = {
        matchDayId: matchDay.id,
        matchDate: matchDay.matchDate,
        opponent: matchDay.opponent || null,
        venue: matchDay.venue || null,
        matchType: matchDay.matchType,
        totalExpenses,
        totalPayments,
        netBalance: totalPayments - totalExpenses,
        expenseBreakdown,
        paymentBreakdown
      };

      return successResponse(reportData);
    }

    // List all match days with summaries
    const matchDaysSnapshot = await matchDaysQuery.get();
    const matchDays = matchDaysSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch all expenses and payments
    const [expensesSnapshot, paymentsSnapshot] = await Promise.all([
      adminDb.collection('expenses').get(),
      adminDb.collection('payments').where('paymentType', '==', 'matchday').get()
    ]);

    const allExpenses = expensesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const allPayments = paymentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const reportData: MatchDayReportData[] = [];

    for (const matchDay of matchDays) {
      const expenses = allExpenses.filter((e: any) => e.matchDayId === matchDay.id);
      const payments = allPayments.filter((p: any) => {
        // Match payments by date proximity (same day as match)
        const paymentDate = new Date(p.date).toDateString();
        const matchDate = new Date(matchDay.matchDate).toDateString();
        return paymentDate === matchDate;
      });

      const totalExpenses = expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
      const totalPayments = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

      const expenseBreakdown = expenses.reduce((acc: any[], expense: any) => {
        const existing = acc.find(item => item.category === expense.category);
        if (existing) {
          existing.amount += expense.amount;
        } else {
          acc.push({ category: expense.category, amount: expense.amount });
        }
        return acc;
      }, []);

      const paymentBreakdown = payments.map((p: any) => ({
        playerName: p.playerName,
        amount: p.amount
      }));

      reportData.push({
        matchDayId: matchDay.id,
        matchDate: matchDay.matchDate,
        opponent: matchDay.opponent || null,
        venue: matchDay.venue || null,
        matchType: matchDay.matchType,
        totalExpenses,
        totalPayments,
        netBalance: totalPayments - totalExpenses,
        expenseBreakdown,
        paymentBreakdown
      });
    }

    const paginatedData = reportData.slice(offset, offset + limit);

    return successResponse({
      data: paginatedData,
      totalRecords: reportData.length,
      hasMore: (offset + limit) < reportData.length
    });
  } catch (error) {
    console.error('Match day report error:', error);
    return errorResponse('Internal server error', 500);
  }
}
