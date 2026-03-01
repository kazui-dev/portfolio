import { createServerFn } from '@tanstack/react-start';
import { desc, eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { notes } from '@/db/schema';

export const getAllNotes = createServerFn({ method: 'GET' })
  .handler(async () => {
    const db = getDb();
    return db.select().from(notes).orderBy(desc(notes.createdAt));
  });

export const getNoteById = createServerFn({ method: 'GET' })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const db = getDb();
    const result = await db.select().from(notes).where(eq(notes.id, data.id)).limit(1);
    return result[0] ?? null;
  });

export const upsertNote = createServerFn({ method: 'POST' })
  .inputValidator((input: {
    id?: string;
    title: string;
    slug: string;
    content: string;
    tags: string[];
    isPublished: boolean;
  }) => input)
  .handler(async ({ data }) => {
    const db = getDb();
    const now = new Date();

    if (!data.id || data.id === 'new') {
      const id = crypto.randomUUID();
      await db.insert(notes).values({
        id,
        title: data.title,
        slug: data.slug,
        content: data.content,
        tags: data.tags,
        isPublished: data.isPublished,
        publishedAt: data.isPublished ? now : null,
        createdAt: now,
        updatedAt: now,
      });
      return { id };
    }

    const existing = await db.select().from(notes).where(eq(notes.id, data.id)).limit(1);
    const existingNote = existing[0];

    let publishedAt = existingNote?.publishedAt ?? null;
    if (data.isPublished && !existingNote?.isPublished) {
      publishedAt = now;
    }

    await db.update(notes).set({
      title: data.title,
      slug: data.slug,
      content: data.content,
      tags: data.tags,
      isPublished: data.isPublished,
      publishedAt,
      updatedAt: now,
    }).where(eq(notes.id, data.id));

    return { id: data.id };
  });

export const deleteNote = createServerFn({ method: 'POST' })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const db = getDb();
    await db.delete(notes).where(eq(notes.id, data.id));
    return { success: true };
  });
