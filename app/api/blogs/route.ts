import { NextResponse } from 'next/server';
import { query } from '@/db';

export async function GET() {
  try {
    const result = await query('SELECT * FROM blogs ORDER BY created_at DESC');
    const blogs = result.rows.map(blog => ({
      id: blog.id,
      authorId: blog.author_id,
      authorName: blog.author_name,
      authorAvatar: blog.author_avatar,
      title: blog.title,
      content: blog.content,
      category: blog.category,
      media: blog.media,
      likes: blog.likes,
      dislikes: blog.dislikes,
      shares: blog.shares,
      reposts: blog.reposts,
      comments: blog.comments,
      externalLink: blog.external_link,
      createdAt: blog.created_at,
    }));
    return NextResponse.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const result = await query(
      `INSERT INTO blogs (author_id, author_name, author_avatar, title, content, category, media, external_link)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [data.authorId, data.authorName, data.authorAvatar, data.title, data.content, data.category, JSON.stringify(data.media || []), data.externalLink]
    );
    return NextResponse.json({ id: result.rows[0].id });
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
