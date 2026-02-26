import type { D1Database } from '@cloudflare/workers-types';
import { env } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export interface Env {
  DB: D1Database;
}

export function getDb() {
  const cloudflareEnv = env as unknown as Env;
  
  return drizzle(cloudflareEnv.DB, { schema });
}