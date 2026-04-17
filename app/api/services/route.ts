import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query('SELECT * FROM services ORDER BY created_at DESC');
    const services = result.rows.map(s => ({
      id: s.id,
      userId: s.user_id,
      userName: s.user_name,
      title: s.title,
      description: s.description,
      creditCost: s.credit_cost,
      category: s.category,
      status: s.status,
      acceptedBy: s.accepted_by,
      acceptedAt: s.accepted_at,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    }));
    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const result = await query(
      `INSERT INTO services (user_id, user_name, title, description, credit_cost, category)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [data.userId, data.userName, data.title, data.description, data.creditCost, data.category]
    );
    return NextResponse.json({ id: result.rows[0].id });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
