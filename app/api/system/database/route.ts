import { NextResponse } from 'next/server';
import { LOCAL_DATABASE_PATH } from '@/lib/database';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      connected: true,
      mode: 'local',
      path: LOCAL_DATABASE_PATH,
    },
  });
}
