import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getAuthUser, unauthorizedResponse, successResponse, errorResponse } from '@/lib/auth-utils';
import { UpdateExpenseRequest } from '@/lib/types';

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

    const expenseDoc = await adminDb.collection('expenses').doc(id).get();

    if (!expenseDoc.exists) {
      return errorResponse('Expense not found', 404);
    }

    return successResponse({ id: expenseDoc.id, ...expenseDoc.data() });
  } catch (error) {
    console.error('Get expense error:', error);
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

    const body: UpdateExpenseRequest = await request.json();

    const expenseDoc = await adminDb.collection('expenses').doc(id).get();
    if (!expenseDoc.exists) {
      return errorResponse('Expense not found', 404);
    }

    const updateData = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await adminDb.collection('expenses').doc(id).update(updateData);

    const updatedDoc = await adminDb.collection('expenses').doc(id).get();
    return successResponse({ id: id, ...updatedDoc.data() });
  } catch (error) {
    console.error('Update expense error:', error);
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

    const expenseDoc = await adminDb.collection('expenses').doc(id).get();
    if (!expenseDoc.exists) {
      return errorResponse('Expense not found', 404);
    }

    await adminDb.collection('expenses').doc(id).delete();

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Delete expense error:', error);
    return errorResponse('Internal server error', 500);
  }
}
