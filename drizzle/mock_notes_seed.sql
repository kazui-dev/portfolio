-- Mock seed data for `notes` table
-- Run manually when needed:
-- sqlite3 <db-file> ".read drizzle/mock_notes_seed.sql"

INSERT OR REPLACE INTO notes (
  id,
  slug,
  title,
  content,
  tags,
  is_published,
  published_at,
  created_at,
  updated_at
)
VALUES
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'markdown-showcase-basic',
  'Markdown Showcase: Basic Patterns',
  '# Markdown Showcase\n\nこれはモック記事です。主要な Markdown 記法をまとめています。\n\n## 1. Text Styles\n\n- **Bold text**\n- *Italic text*\n- ~~Strikethrough~~\n- Inline code: `const theme = "dark"`\n\n## 2. Lists\n\n### Unordered\n- Apple\n- Banana\n  - Nested A\n  - Nested B\n\n### Ordered\n1. First\n2. Second\n3. Third\n\n### Task list\n- [x] Setup project\n- [x] Create route\n- [ ] Write tests\n\n## 3. Links / Images\n\n- [TanStack Router](https://tanstack.com/router)\n- [React Markdown](https://github.com/remarkjs/react-markdown)\n\n![Sample image](https://picsum.photos/seed/kazui/800/320)\n\n## 4. Blockquote\n\n> Simplicity is the soul of efficiency.\n>\n> Keep the UI focused.\n\n## 5. Horizontal Rule\n\n---\n\nDone ✅\n',
  '["markdown","showcase","basic"]',
  1,
  (cast(strftime('%s', 'now') as int) * 1000),
  (cast(strftime('%s', 'now') as int) * 1000),
  (cast(strftime('%s', 'now') as int) * 1000)
),
(
  'b2c3d4e5-f6a7-8901-bcde-f01234567891',
  'markdown-showcase-code',
  'Markdown Showcase: Code Blocks + Table',
  '# Code & Table Demo\n\nコードブロックと表、JSON などを含むモックです。\n\n## TypeScript\n\n```ts\nimport { createFileRoute } from "@tanstack/react-router"\n\nexport const Route = createFileRoute("/notes/$slug")({\n  component: RouteComponent,\n})\n\nfunction RouteComponent() {\n  return <div>Hello Notes</div>\n}\n```\n\n## Bash\n\n```bash\npnpm add react-markdown rehype-pretty-code shiki\npnpm dev\n```\n\n## SQL\n\n```sql\nSELECT slug, title\nFROM notes\nWHERE is_published = 1\nORDER BY published_at DESC;\n```\n\n## Table\n\n| Feature | Status | Note |\n| --- | --- | --- |\n| Markdown render | ✅ | react-markdown |\n| Syntax highlight | ✅ | rehype-pretty-code |\n| Dark mode | ✅ | github-dark theme |\n\n## JSON\n\n```json\n{\n  "title": "Sample",\n  "tags": ["typescript", "markdown"],\n  "published": true\n}\n```\n\n## Footnote style text\n\n細かい説明文。Here''s a sentence with escaped apostrophe.\n',
  '["markdown","code","table","sql"]',
  1,
  (cast(strftime('%s', 'now') as int) * 1000) - 86400000,
  (cast(strftime('%s', 'now') as int) * 1000) - 86400000,
  (cast(strftime('%s', 'now') as int) * 1000)
),
(
  'c3d4e5f6-a7b8-9012-cdef-012345678902',
  'markdown-ja-longform',
  'Markdown Showcase: 日本語ロングフォーム',
  '# 日本語記事サンプル\n\n## はじめに\n\nこの文章は、可読性確認のための長文モックです。\n複数段落、見出し、コード、引用を混ぜています。\n\n### ポイント\n\n- レイアウト確認\n- 改行と余白確認\n- ダークモード確認\n\n```tsx\nconst Card = ({ title }: { title: string }) => {\n  return <article className="rounded-xl border p-4">{title}</article>;\n};\n```\n\n> UIは引き算が大事。\n\n最後まで読んでくれてありがとう。\n',
  '["japanese","longform","layout"]',
  1,
  (cast(strftime('%s', 'now') as int) * 1000) - 172800000,
  (cast(strftime('%s', 'now') as int) * 1000) - 172800000,
  (cast(strftime('%s', 'now') as int) * 1000)
);

-- Convert literal "\n" sequences into actual line breaks for markdown rendering.
UPDATE notes
SET content = replace(content, '\n', char(10))
WHERE id IN ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b2c3d4e5-f6a7-8901-bcde-f01234567891', 'c3d4e5f6-a7b8-9012-cdef-012345678902');
