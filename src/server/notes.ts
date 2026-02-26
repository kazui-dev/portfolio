import { createServerFn } from '@tanstack/react-start';
import { desc, eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { notes } from '@/db/schema';

export const getPublishedNotes = createServerFn({ method: 'GET' })
  .handler(async () => {
    const db = getDb();

    const result = await db.select()
      .from(notes)
      .where(eq(notes.isPublished, true))
      .orderBy(desc(notes.publishedAt));

    return result;
  });