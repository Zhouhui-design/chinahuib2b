/**
 * Multilingual SEO Utilities
 * Generate hreflang tags, sitemaps, and localized metadata
 */

import { LanguageCode, supportedLanguages } from '@/lib/languages';

export interface HreflangTag {
  lang: string;
  url: string;
}

export interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  alternates?: HreflangTag[];
}

/**
 * Generate hreflang tags for a page
 */
export function generateHreflangTags(
  baseUrl: string,
  path: string,
  excludeLangs?: LanguageCode[]
): HreflangTag[] {
  const tags: HreflangTag[] = [];

  supportedLanguages.forEach((lang) => {
    if (excludeLangs?.includes(lang.code)) return;

    tags.push({
      lang: lang.code === 'en' ? 'x-default' : lang.code,
      url: `${baseUrl}/${lang.code}${path}`
    });
  });

  return tags;
}

/**
 * Render hreflang tags as HTML
 */
export function renderHreflangTags(tags: HreflangTag[]): string {
  return tags
    .map((tag) => `<link rel="alternate" hreflang="${tag.lang}" href="${tag.url}" />`)
    .join('\n');
}

/**
 * Generate sitemap XML
 */
export function generateSitemapXML(entries: SitemapEntry[]): string {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
  const urlsetClose = '</urlset>';

  const urls = entries
    .map((entry) => {
      let xml = '  <url>\n';
      xml += `    <loc>${entry.url}</loc>\n`;

      if (entry.lastmod) {
        xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
      }

      if (entry.changefreq) {
        xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
      }

      if (entry.priority) {
        xml += `    <priority>${entry.priority.toFixed(1)}</priority>\n`;
      }

      // Add hreflang alternates
      if (entry.alternates && entry.alternates.length > 0) {
        entry.alternates.forEach((alt) => {
          xml += `    <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${alt.url}" />\n`;
        });
      }

      xml += '  </url>\n';
      return xml;
    })
    .join('');

  return xmlHeader + urlsetOpen + urls + urlsetClose;
}

/**
 * Generate robots.txt with language-specific rules
 */
export function generateRobotsTXT(baseUrl: string): string {
  const lines = [
    '# Robots.txt for Chinahuib2b',
    '',
    'User-agent: *',
    'Allow: /',
    '',
    '# Disallow AI crawlers from chat system',
    'User-agent: GPTBot',
    'Disallow: /chat',
    '',
    'User-agent: ChatGPT-User',
    'Disallow: /chat',
    '',
    'User-agent: CCBot',
    'Disallow: /chat',
    '',
    '# Sitemaps',
    ...supportedLanguages.map((lang) => `Sitemap: ${baseUrl}/${lang.code}/sitemap.xml`),
    ''
  ];

  return lines.join('\n');
}

/**
 * Get localized meta tags
 */
export function getLocalizedMeta(
  title: string,
  description: string,
  lang: LanguageCode,
  canonicalUrl: string
) {
  return {
    title,
    description,
    language: lang,
    alternates: generateHreflangTags(canonicalUrl.replace(`/${lang}`, ''), ''),
    openGraph: {
      locale: lang,
      title,
      description,
      url: canonicalUrl
    }
  };
}

/**
 * React component for hreflang tags
 */
export function HreflangTags({ tags }: { tags: HreflangTag[] }) {
  return (
    <>
      {tags.map((tag, index) => (
        <link
          key={index}
          rel="alternate"
          hrefLang={tag.lang}
          href={tag.url}
        />
      ))}
    </>
  );
}
