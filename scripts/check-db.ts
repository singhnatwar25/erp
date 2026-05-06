import mongoose from 'mongoose';
import { mongoUri } from './env';

async function main() {
  const uri = mongoUri();
  await mongoose.connect(uri, {
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000,
  });

  const db = mongoose.connection.db;
  const collections = db ? await db.listCollections().toArray() : [];
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
  console.log(`Database: ${mongoose.connection.name}`);
  console.log(`Collections: ${collections.length}`);

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(`MongoDB connection failed: ${error.message}`);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
