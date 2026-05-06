import connectDB from '@/lib/mongodb';

const RECHECK_INTERVAL_MS = 30_000;

let databaseAvailable: boolean | null = null;
let lastCheckedAt = 0;

export async function isDatabaseAvailable(): Promise<boolean> {
  if (databaseAvailable === true) {
    return true;
  }

  if (
    databaseAvailable === false &&
    Date.now() - lastCheckedAt < RECHECK_INTERVAL_MS
  ) {
    return false;
  }

  try {
    await connectDB();
    databaseAvailable = true;
    return true;
  } catch {
    databaseAvailable = false;
    lastCheckedAt = Date.now();
    return false;
  }
}
