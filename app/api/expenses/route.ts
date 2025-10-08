import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getAuthUser, unauthorizedResponse, successResponse, errorResponse } from '@/lib/auth-utils';
import { CreateExpenseRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const body: CreateExpenseRequest = await request.json();
    const { description, category, amount, expenseDate, matchDayId } = body;

    if (!description || !category || !amount) {
      return errorResponse('Description, category, and amount are required', 400);
    }

    const expenseRef = adminDb.collection('expenses').doc();
    const now = new Date().toISOString();

    const newExpense = {
      description,
      category,
      amount,
      expenseDate: expenseDate || new Date().toISOString().split('T')[0],
      matchDayId: matchDayId || null,
      createdBy: authUser.uid,
      createdAt: now,
      updatedAt: now,
    };

    await expenseRef.set(newExpense);

    return successResponse({ id: expenseRef.id, ...newExpense }, 201);
  } catch (error) {
    console.error('Create expense error:', error);
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
    const category = searchParams.get('category');
    const matchDayId = searchParams.get('match_day_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    let query: any = adminDb.collection('expenses');

    // Apply filters
    if (category) {
      query = query.where('category', '==', category);
    }
    if (matchDayId) {
      query = query.where('matchDayId', '==', matchDayId);
    }
    if (startDate) {
      query = query.where('expenseDate', '>=', startDate);
    }
    if (endDate) {
      query = query.where('expenseDate', '<=', endDate);
    }

    query = query.orderBy('expenseDate', 'desc').limit(limit).offset(skip);

    const snapshot = await query.get();
    const expenses = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    return successResponse(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    return errorResponse('Internal server error', 500);
  }
}
