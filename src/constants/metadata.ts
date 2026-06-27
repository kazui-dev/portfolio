import type { PageID } from '@/types';

type PageMetadata = {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  jsonLd: Record<string, any>;
};

export const SITE_URL = "https://kazui.dev";
const SITE_NAME = "kazui.dev";

export const PAGE_METADATA: Record<PageID, PageMetadata> = {
  home: {
    title: `${SITE_NAME}`,
    ogTitle: `${SITE_NAME}`,
    ogDescription: `kazui's Portfolio`,
    description: `kazui's Portfolio`,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "name": `${SITE_NAME}`,
          "url": `${SITE_URL}/`,
          "alternateName": ["Kazui", "美輪和維", "Kazui Miwa"],
          "description": `kazui's Portfolio`,
          "inLanguage": "ja",
          "publisher": {
            "@type": "Person",
            "name": "Kazui Miwa",
            "url": `${SITE_URL}/`,
            "sameAs": [
              "https://github.com/J-65536",
            ]
          }
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": `${SITE_URL}/`
            }
          ]
        }
      ]
    }
  },
  notes: {
    title: `Notes - ${SITE_NAME}`,
    ogTitle: `Notes`,
    ogDescription: `kazui's Notes`,
    description: `kazui's Notes`,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "name": `Notes - ${SITE_NAME}`,
          "url": `${SITE_URL}/notes`,
          "description": `kazui's Notes`,
          "inLanguage": "ja",
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": `${SITE_URL}/`
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Notes",
              "item": `${SITE_URL}/notes`
            }
          ]
        }
      ]
    }
  }
};