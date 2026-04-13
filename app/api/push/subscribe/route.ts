import { NextResponse } from 'next/server';
import { query } from '@/db';
import { getUserIdFromRequest } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const uid = getUserIdFromRequest(req);
    if (!uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await req.json();

    // Vérifier si une subscription existe déjà
    const existing = await query(
      'SELECT id FROM push_subscriptions WHERE user_id = $1',
      [uid]
    );

    // 🔥 Correction TypeScript ici
    const count = existing?.rowCount ?? 0;

    if (count > 0) {
      await query(
        'UPDATE push_subscriptions SET subscription = $1 WHERE user_id = $2',
        [JSON.stringify(subscription), uid]
      );
    } else {
      await query(
        'INSERT INTO push_subscriptions (user_id, subscription) VALUES ($1, $2)',
        [uid, JSON.stringify(subscription)]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in push subscription:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


