import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query('SELECT * FROM testimonials ORDER BY created_at DESC');
    const testimonials = result.rows.map(t => ({
      id: t.id,
      authorId: t.author_id,
      authorName: t.author_name,
      authorAvatar: t.author_avatar,
      title: t.title || '',
      content: t.content,
      rating: t.rating,
      media: t.media,
      likes: t.likes,
      votes: t.likes || [],
      dislikes: t.dislikes,
      shares: t.shares,
      reposts: t.reposts,
      comments: t.comments,
      createdAt: t.created_at,
    }));
    return NextResponse.json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const result = await query(
      `INSERT INTO testimonials (author_id, author_name, author_avatar, title, content, rating, media)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [data.authorId, data.authorName, data.authorAvatar, data.title, data.content, data.rating, JSON.stringify(data.media || [])]
    );
    return NextResponse.json({ id: result.rows[0].id });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
