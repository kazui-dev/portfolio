import type { D1Database } from '@cloudflare/workers-types';
import { env as cfEnvImport } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export interface Env {
  DB: D1Database;
}

function resolveEnv(maybeEnv?: Partial<Env>): Env | undefined {
  // 1. explicit param (future-proof if callers pass env)
  if (maybeEnv && (maybeEnv as Env).DB) return maybeEnv as Env;

  // 2. the module import from `cloudflare:workers` (works in many dev setups)
  const imported = cfEnvImport as unknown as Env | undefined;
  if (imported && (imported as Env).DB) return imported as Env;

  // 3. global fallbacks that some runtimes / bundlers expose
  const g = globalThis as any;
  if (g?.env && g.env.DB) return { DB: g.env.DB } as Env;
  if (g?.__STATIC_ENV__ && g.__STATIC_ENV__.DB) return { DB: g.__STATIC_ENV__.DB } as Env;
  if (g?.DB) return { DB: g.DB } as Env;

  return undefined;
}

export function getDb(maybeEnv?: Partial<Env>) {
  const cloudflareEnv = resolveEnv(maybeEnv);

  if (!cloudflareEnv || !cloudflareEnv.DB) {
    throw new Error(
      'D1 binding `DB` not found. Ensure your Worker/Environment provides the D1 binding (wrangler dev vs deploy can differ).'
    );
  }

  return drizzle(cloudflareEnv.DB, { schema });
}