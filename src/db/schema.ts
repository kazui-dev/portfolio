import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';

export const notes = sqliteTable('notes', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  
  // 文字列配列
  tags: text('tags', { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),

  // 公開状態の管理
  isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(false),
  publishedAt: integer('published_at', { mode: 'timestamp_ms' }), 
  
  // 作成・更新日時 
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(cast(strftime('%s', 'now') as int) * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(cast(strftime('%s', 'now') as int) * 1000)`),
});

export type Note = InferSelectModel<typeof notes>;