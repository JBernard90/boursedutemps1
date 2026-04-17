import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query('SELECT * FROM forum_topics ORDER BY created_at DESC');
    const topics = result.rows.map(t => ({
      id: t.id,
      authorId: t.author_id,
      authorName: t.author_name,
      authorAvatar: t.author_avatar,
      title: t.title,
      message: t.content,
      category: t.category,
      media: t.media,
      likes: t.likes,
      dislikes: t.dislikes,
      shares: t.shares,
      reposts: t.reposts,
      comments: t.comments,
      externalLink: t.external_link,
      createdAt: t.created_at,
    }));
    return NextResponse.json(topics);
  } catch (error) {
    console.error('Error fetching forum topics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const result = await query(
      `INSERT INTO forum_topics (author_id, author_name, author_avatar, title, content, category, media, external_link)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [data.authorId, data.authorName, data.authorAvatar, data.title, data.message || data.content, data.category, JSON.stringify(data.media || []), data.externalLink]
    );
    return NextResponse.json({ id: result.rows[0].id });
  } catch (error) {
    console.error('Error creating forum topic:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
