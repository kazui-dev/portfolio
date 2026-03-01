import React, { type ReactNode } from 'react'

export type TocItem = {
  id: string
  text: string
  level: 2 | 3
}

function normalizeHeadingText(raw: string) {
  return raw
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[*_~]/g, '')
    .trim()
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
  .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function createHeadingIdFactory() {
  return (rawText: string) => {
    const text = normalizeHeadingText(rawText)
    return slugify(text) || 'section'
  }
}

export function extractTocItemsFromMarkdown(content: string): TocItem[] {
  const items: TocItem[] = []
  const lines = content.split('\n')
  const createId = createHeadingIdFactory()
  let isInFence = false

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.startsWith('```')) {
      isInFence = !isInFence
      continue
    }

    if (isInFence) {
      continue
    }

    const match = /^(#{2,3})\s+(.+)$/.exec(trimmed)

    if (!match) {
      continue
    }

    const level = match[1].length as 2 | 3
    const headingText = match[2].replace(/\s+#+\s*$/, '').trim()
    const text = normalizeHeadingText(headingText)

    if (!text) {
      continue
    }

    items.push({
      id: createId(text),
      text,
      level,
    })
  }

  return items
}

export function getTextFromNode(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }

  if (Array.isArray(node)) {
    return node.map(getTextFromNode).join('')
  }

  if (React.isValidElement(node)) {
    const element = node as React.ReactElement<{ children?: ReactNode }>
    return getTextFromNode(element.props.children)
  }

  return ''
}