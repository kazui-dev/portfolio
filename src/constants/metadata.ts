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
    title: `Home - ${SITE_NAME}`,
    ogTitle: `Home - ${SITE_NAME}`,
    ogDescription: `Home - ${SITE_NAME}`,
    description: `Home - ${SITE_NAME}`,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "name": `Home - ${SITE_NAME}`,
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
  blog: {
    title: `Blog - ${SITE_NAME}`,
    ogTitle: `Blog - ${SITE_NAME}`,
    ogDescription: `Blog - ${SITE_NAME}`,
    description: `Blog - ${SITE_NAME}`,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "name": `Blog - ${SITE_NAME}`,
          "url": `${SITE_URL}/blog`,
          "description": `Blog - ${SITE_NAME}`,
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
              "name": "Blog",
              "item": `${SITE_URL}/blog`
            }
          ]
        }
      ]
    }
  }
};