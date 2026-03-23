import { createServerFn } from '@tanstack/react-start';
import { and, desc, eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { notes } from '@/db/schema';


export const getPublishedNotes = createServerFn({ method: 'GET' })
  .handler(async () => {
    const db = getDb();
    const result = await db.select()
      .from(notes)
      .where(and(eq(notes.isPublished, true), eq(notes.isUnlisted, false)))
      .orderBy(desc(notes.publishedAt));
    return result;
  });

export const getPublishedNoteBySlug = createServerFn({ method: 'GET' })
  .inputValidator((input: { slug: string }) => input)
  .handler(async ({ data }) => {
    const db = getDb();
    const result = await db.select()
      .from(notes)
      .where(and(eq(notes.slug, data.slug), eq(notes.isPublished, true), eq(notes.isUnlisted, false)))
      .limit(1);
    return result[0] ?? null;
  });