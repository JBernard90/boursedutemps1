import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(req: Request) {
  const uid = getUserIdFromRequest(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const result = await query(
      'SELECT * FROM transactions WHERE from_id = $1 OR to_id = $1 ORDER BY created_at DESC',
      [uid]
    );
    const transactions = result.rows.map(t => ({
      id: t.id,
      fromId: t.from_id,
      toId: t.to_id,
      amount: t.amount,
      serviceTitle: t.service_title,
      type: t.type,
      date: t.created_at,
    }));
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const result = await query(
      `INSERT INTO transactions (from_id, to_id, amount, service_title, type)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [data.fromId, data.toId, data.amount, data.serviceTitle, data.type]
    );
    return NextResponse.json({ id: result.rows[0].id });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
