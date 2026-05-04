import { createServerFn } from '@tanstack/react-start';
import { and, desc, eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { notes } from '@/db/schema';
import { renderNoteContentToHtml } from '@/server/note-content';


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
      .where(and(eq(notes.slug, data.slug), eq(notes.isPublished, true)))
      .limit(1);
    return result[0] ?? null;
  });

export const getPublishedNotePageBySlug = createServerFn({ method: 'GET' })
  .inputValidator((input: { slug: string }) => input)
  .handler(async ({ data }) => {
    const db = getDb();
    const result = await db.select()
      .from(notes)
      .where(and(eq(notes.slug, data.slug), eq(notes.isPublished, true)))
      .limit(1);
    const note = result[0] ?? null;

    if (!note) {
      return null;
    }

    const navigation = await db
      .select({
        slug: notes.slug,
      })
      .from(notes)
      .where(and(eq(notes.isPublished, true), eq(notes.isUnlisted, false)))
      .orderBy(desc(notes.publishedAt));

    const index = navigation.findIndex((item) => item.slug === note.slug);
    const previousSlug = index > 0 ? navigation[index - 1]?.slug : null;
    const nextSlug = index >= 0 && index < navigation.length - 1 ? navigation[index + 1]?.slug : null;

    const [previousNoteSource, nextNoteSource, renderedContentHtml] = await Promise.all([
      previousSlug
        ? db.select({
          slug: notes.slug,
          title: notes.title,
          content: notes.content,
        })
          .from(notes)
          .where(and(eq(notes.slug, previousSlug), eq(notes.isPublished, true), eq(notes.isUnlisted, false)))
          .limit(1)
          .then((rows) => rows[0] ?? null)
        : Promise.resolve(null),
      nextSlug
        ? db.select({
          slug: notes.slug,
          title: notes.title,
          content: notes.content,
        })
          .from(notes)
          .where(and(eq(notes.slug, nextSlug), eq(notes.isPublished, true), eq(notes.isUnlisted, false)))
          .limit(1)
          .then((rows) => rows[0] ?? null)
        : Promise.resolve(null),
      renderNoteContentToHtml(note.content),
    ]);

    return {
      note,
      renderedContentHtml,
      previousNote: previousNoteSource ? {
        slug: previousNoteSource.slug,
        title: previousNoteSource.title,
        excerpt: createNavigationExcerpt(previousNoteSource.content),
      } : null,
      nextNote: nextNoteSource ? {
        slug: nextNoteSource.slug,
        title: nextNoteSource.title,
        excerpt: createNavigationExcerpt(nextNoteSource.content),
      } : null,
    };
  });

function createNavigationExcerpt(content: string) {
  return content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~>|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 70);
}
