import { NextResponse } from 'next/server';
import { query } from '@/db';

export async function POST(req: Request) {
  const { email, phone } = await req.json();
  
  // Mock code generation
  const code = '123456';
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  try {
    await query(
      'INSERT INTO otps (identifier, code, expires_at) VALUES ($1, $2, $3)',
      [email, code, expiresAt]
    );
    await query(
      'INSERT INTO otps (identifier, code, expires_at) VALUES ($1, $2, $3)',
      [phone, code, expiresAt]
    );
    
    console.log(`[MOCK VERIFY] Codes for ${email} and ${phone}: ${code}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error initializing verification:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
