import { createServerFn } from '@tanstack/react-start';
import { env } from 'cloudflare:workers';
import type { R2Bucket } from '@cloudflare/workers-types';
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
    isUnlisted: boolean;
  }) => input)
  .handler(async ({ data }) => {
    const db = getDb();
    const now = new Date();

    const isUnlisted = data.isPublished ? data.isUnlisted : false;

    if (!data.id || data.id === 'new') {
      const id = crypto.randomUUID();
      await db.insert(notes).values({
        id,
        title: data.title,
        slug: data.slug,
        content: data.content,
        tags: data.tags,
        isPublished: data.isPublished,
        isUnlisted,
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
      isUnlisted,
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

type UploadNoteImageInput = {
  fileName: string;
  mimeType: string;
  base64Data: string;
  noteId?: string;
  noteSlug?: string;
};

type R2ImagesEnv = {
  STORAGE?: R2Bucket;
  STORAGE_PUBLIC_BASE_URL?: string;
};

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml',
]);

export const uploadNoteImage = createServerFn({ method: 'POST' })
  .inputValidator((input: UploadNoteImageInput) => input)
  .handler(async ({ data }) => {
    const storageEnv = env as unknown as R2ImagesEnv;
    const bucket = storageEnv.STORAGE;
    const publicBaseUrl = storageEnv.STORAGE_PUBLIC_BASE_URL?.trim().replace(/\/+$/, '');

    if (!bucket) {
      throw new Error('R2 バケット STORAGE が未設定です。wrangler.jsonc の r2_buckets を確認してください。');
    }

    if (!publicBaseUrl) {
      throw new Error('STORAGE_PUBLIC_BASE_URL が未設定です。wrangler.jsonc の vars を確認してください。');
    }

    if (!ALLOWED_IMAGE_MIME_TYPES.has(data.mimeType)) {
      throw new Error('サポート外の画像形式です。jpg / png / webp / gif / avif / svg を使用してください。');
    }

    const bytes = decodeBase64(data.base64Data);
    if (bytes.byteLength > MAX_IMAGE_SIZE_BYTES) {
      throw new Error('画像サイズが大きすぎます。10MB以下にしてください。');
    }

    const extension = detectImageExtension(data.mimeType, data.fileName);
    const objectKey = createImageObjectKey({
      noteId: data.noteId,
      noteSlug: data.noteSlug,
      extension,
    });

    await bucket.put(objectKey, bytes, {
      httpMetadata: {
        contentType: data.mimeType,
        cacheControl: 'public, max-age=31536000, immutable',
      },
      customMetadata: {
        source: 'admin-note-editor',
        noteId: data.noteId ?? '',
        noteSlug: data.noteSlug ?? '',
      },
    });

    const encodedObjectKey = encodeURIComponent(objectKey).replace(/%2F/g, '/');
    const imageUrl = `${publicBaseUrl}/${encodedObjectKey}`;
    const altText = createAltText(data.fileName);

    return {
      key: objectKey,
      url: imageUrl,
      markdown: `![${altText}](${imageUrl})`,
    };
  });

function decodeBase64(input: string) {
  const raw = input.includes(',') ? input.split(',').at(-1) ?? '' : input;
  const decoded = atob(raw);
  const bytes = new Uint8Array(decoded.length);

  for (let i = 0; i < decoded.length; i += 1) {
    bytes[i] = decoded.charCodeAt(i);
  }

  return bytes;
}

function createImageObjectKey(input: { noteId?: string; noteSlug?: string; extension: string }) {
  const noteSegment = normalizePathSegment(input.noteSlug || input.noteId || 'draft');
  return `images/notes/${noteSegment}/${Date.now()}-${crypto.randomUUID()}.${input.extension}`;
}

function normalizePathSegment(value: string) {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized || 'draft';
}

function detectImageExtension(mimeType: string, fileName: string) {
  const byMimeType: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'avif',
    'image/svg+xml': 'svg',
  };

  const ext = byMimeType[mimeType];
  if (ext) {
    return ext;
  }

  const fromFile = fileName.trim().split('.').at(-1)?.toLowerCase();
  return fromFile && /^[a-z0-9]+$/.test(fromFile) ? fromFile : 'bin';
}

function createAltText(fileName: string) {
  const baseName = fileName.trim().replace(/\.[^/.]+$/, '');
  const normalized = baseName
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return normalized || 'image';
}
