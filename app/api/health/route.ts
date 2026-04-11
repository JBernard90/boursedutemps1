import { NextResponse } from 'next/server';

const startTime = Date.now();

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    uptime: Date.now() - startTime 
  });
}
