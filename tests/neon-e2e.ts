import { config } from 'dotenv';
config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../utils/schema';
import { eq } from 'drizzle-orm';

async function testNeonDatabase() {
  console.log('Connecting to Neon database with DATABASE_URL...');
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set in .env.local');
  }

  const sql = neon(connectionString);
  const db = drizzle(sql, { schema });

  console.log('Testing raw SQL SELECT 1...');
  const ping = await sql`SELECT 1 as connected, NOW() as current_time, version() as pg_version;`;
  console.log('Neon Postgres Ping Result:', ping);

  console.log('Testing schema insert into aiOutput...');
  const testPayload = {
    formData: JSON.stringify({ testPrompt: 'Neon E2E verification prompt' }),
    aiResponse: 'This is a test response generated and verified with Neon Postgres.',
    templateSlug: 'test-slug',
    createdBy: 'test-runner@astragen.ai',
    wordCount: 12,
  };

  const insertResult = await db.insert(schema.AIOutput).values(testPayload).returning();
  console.log('Inserted record ID:', insertResult[0]?.id);

  console.log('Verifying inserted record via db.select()...');
  const queried = await db
    .select()
    .from(schema.AIOutput)
    .where(eq(schema.AIOutput.id, insertResult[0].id));

  if (!queried.length || queried[0].templateSlug !== 'test-slug') {
    throw new Error('Verification failed: queried record does not match inserted record');
  }
  console.log('Record verified successfully:', queried[0].templateSlug, 'WordCount:', queried[0].wordCount);

  console.log('Cleaning up test record...');
  await db.delete(schema.AIOutput).where(eq(schema.AIOutput.id, insertResult[0].id));
  console.log('Cleanup completed. Neon database is 100% operational!');
}

testNeonDatabase().catch((err) => {
  console.error('Neon test failed:', err);
  process.exit(1);
});
