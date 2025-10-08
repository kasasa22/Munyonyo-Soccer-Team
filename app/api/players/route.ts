import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getAuthUser, unauthorizedResponse, successResponse, errorResponse } from '@/lib/auth-utils';
import { CreatePlayerRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const body: CreatePlayerRequest = await request.json();
    const { name, phone, annual = 150000, monthly = 10000, pitch = 5000, matchDay } = body;

    if (!name || !phone) {
      return errorResponse('Name and phone are required', 400);
    }

    const playerRef = adminDb.collection('players').doc();
    const now = new Date().toISOString();

    const newPlayer = {
      name,
      phone,
      annual,
      monthly,
      pitch,
      matchDay: matchDay || null,
      createdAt: now,
      updatedAt: now,
    };

    await playerRef.set(newPlayer);

    return successResponse({ id: playerRef.id, ...newPlayer }, 201);
  } catch (error) {
    console.error('Create player error:', error);
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
    const search = searchParams.get('search');

    let query = adminDb.collection('players').orderBy('name');

    if (search) {
      const playersSnapshot = await query.get();
      const filteredPlayers = playersSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(player => {
          const searchLower = search.toLowerCase();
          return (
            player.name.toLowerCase().includes(searchLower) ||
            player.phone.includes(search)
          );
        })
        .slice(skip, skip + limit);

      return successResponse(filteredPlayers);
    }

    const snapshot = await query.limit(limit).offset(skip).get();
    const players = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return successResponse(players);
  } catch (error) {
    console.error('Get players error:', error);
    return errorResponse('Internal server error', 500);
  }
}
