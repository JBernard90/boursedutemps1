import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import { query } from '@/db';

export async function POST(req: Request) {
  const uid = getUserIdFromRequest(req);
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const subscription = await req.json();

  try {
    // Store or update subscription
    // We use user_id as a unique identifier for the subscription for now
    // In a real app, you might want multiple subscriptions per user (different devices)
    const existing = await query('SELECT id FROM push_subscriptions WHERE user_id = $1', [uid]);
    
    if (existing.rowCount > 0) {
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
    console.error('Error saving subscription:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
