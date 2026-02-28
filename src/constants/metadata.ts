import type { PageID } from '@/types';

type PageMetadata = {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  jsonLd: Record<string, any>;
};

const SITE_URL = "https://kazui.dev";
const SITE_NAME = "kazui.dev";

export const PAGE_METADATA: Record<PageID, PageMetadata> = {
  home: {
    title: `kazui`,
    ogTitle: `Home - ${SITE_NAME}`,
    ogDescription: `Home - ${SITE_NAME}`,
    description: `Home - ${SITE_NAME}`,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "name": `${SITE_NAME}`,
          "url": `${SITE_URL}/`,
          "alternateName": ["Kazui", "美輪和維", "Kazui Miwa"],
          "description": `Home - ${SITE_NAME}`,
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
    title: `kazui's Notes`,
    ogTitle: `Notes - ${SITE_NAME}`,
    ogDescription: `Notes - ${SITE_NAME}`,
    description: `Notes - ${SITE_NAME}`,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "name": `Notes - ${SITE_NAME}`,
          "url": `${SITE_URL}/notes`,
          "description": `Notes - ${SITE_NAME}`,
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