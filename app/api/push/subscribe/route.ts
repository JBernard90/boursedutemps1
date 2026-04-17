import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const uid = getUserIdFromRequest(req);
    if (!uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscription } = await req.json();

    // Check if subscription already exists
    const existing = await query(
      'SELECT id FROM push_subscriptions WHERE user_id = $1',
      [uid]
    );

    if (existing?.rowCount && existing.rowCount > 0) {
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
    console.error('Push subscription error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

