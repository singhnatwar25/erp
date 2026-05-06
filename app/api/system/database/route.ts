import { NextResponse } from 'next/server';
import { isDatabaseAvailable } from '@/lib/database';

function redactMongoUri(uri: string | undefined) {
  if (!uri) return 'not-configured';
  return uri.replace(/\/\/([^:@/]+):([^@/]+)@/, '//***:***@');
}

export async function GET() {
  const connected = await isDatabaseAvailable();

  return NextResponse.json({
    success: true,
    data: {
      connected,
      mode: connected ? 'mongodb' : 'local-demo',
      uri: redactMongoUri(process.env.MONGODB_URI),
    },
  });
}
