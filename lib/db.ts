import { neon } from '@neondatabase/serverless';

function requireDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set.');
  }
  return databaseUrl;
}

let sqlClient: ReturnType<typeof neon> | null = null;

export function getSql() {
  if (!sqlClient) {
    sqlClient = neon(requireDatabaseUrl());
  }
  return sqlClient;
}
