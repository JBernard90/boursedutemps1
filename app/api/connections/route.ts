import { NextResponse } from 'next/server';
import { query } from '@/db';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(req: Request) {
  const uid = getUserIdFromRequest(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const result = await query(
      'SELECT * FROM connections WHERE sender_id = $1 OR receiver_id = $1 ORDER BY created_at DESC',
      [uid]
    );
    const connections = result.rows.map(c => ({
      id: c.id,
      senderId: c.sender_id,
      receiverId: c.receiver_id,
      status: c.status,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));
    return NextResponse.json(connections);
  } catch (error) {
    console.error('Error fetching connections:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const result = await query(
      `INSERT INTO connections (sender_id, receiver_id, status)
       VALUES ($1, $2, $3) RETURNING id`,
      [data.senderId, data.receiverId, data.status || 'sent']
    );
    return NextResponse.json({ id: result.rows[0].id });
  } catch (error) {
    console.error('Error creating connection:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
