import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getAuthUser, unauthorizedResponse, successResponse, errorResponse } from '@/lib/auth-utils';
import { CreateMatchDayRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const body: CreateMatchDayRequest = await request.json();
    const { matchDate, opponent, venue, matchType } = body;

    if (!matchDate || !matchType) {
      return errorResponse('Match date and match type are required', 400);
    }

    // Check if match day already exists for this date
    const existingMatch = await adminDb.collection('match_days')
      .where('matchDate', '==', matchDate)
      .limit(1)
      .get();

    if (!existingMatch.empty) {
      return errorResponse('Match day already exists for this date', 400);
    }

    const matchDayRef = adminDb.collection('match_days').doc();
    const now = new Date().toISOString();

    const newMatchDay = {
      matchDate,
      opponent: opponent || null,
      venue: venue || null,
      matchType,
      createdAt: now,
    };

    await matchDayRef.set(newMatchDay);

    return successResponse({ id: matchDayRef.id, ...newMatchDay }, 201);
  } catch (error) {
    console.error('Create match day error:', error);
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

    const query = adminDb.collection('match_days')
      .orderBy('matchDate', 'desc')
      .limit(limit)
      .offset(skip);

    const snapshot = await query.get();
    const matchDays = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return successResponse(matchDays);
  } catch (error) {
    console.error('Get match days error:', error);
    return errorResponse('Internal server error', 500);
  }
}
