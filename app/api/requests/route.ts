import { NextResponse } from 'next/server';
import { query } from '@/db';

export async function GET() {
  try {
    const result = await query('SELECT * FROM requests ORDER BY created_at DESC');
    const requests = result.rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      userName: r.user_name,
      title: r.title,
      description: r.description,
      creditOffer: r.credit_offer,
      category: r.category,
      status: r.status,
      fulfilledBy: r.fulfilled_by,
      fulfilledAt: r.fulfilled_at,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const result = await query(
      `INSERT INTO requests (user_id, user_name, title, description, credit_offer, category)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [data.userId, data.userName, data.title, data.description, data.creditOffer, data.category]
    );
    return NextResponse.json({ id: result.rows[0].id });
  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
