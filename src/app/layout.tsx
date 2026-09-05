import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Script from "next/script";
import { languages } from "@/lib/languages";
import { buildAlternates, detectLocale, localeDir } from "@/lib/hreflang";
import { generateWebsiteSchema, generateOrganizationSchemaFull, generateWebApplicationSchema } from "@/lib/schema-org";
import CookieConsent from "@/components/CookieConsent";

const BASE_URL = "https://x2xhub.com";

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const pathname = h.get("x-pathname") || "/";
  const alternates = buildAlternates(pathname);

  return {
  title: {
    default: 'SeaHeart Global | 心海环球 - Global B2B Trade Exhibition & Auction Platform',
    template: '%s | SeaHeart Global | 心海环球',
  },
  description: 'SeaHeart Global is a global B2B trade exhibition and auction platform. Connect buyers and sellers worldwide. Discover wholesale products, verified suppliers, industrial machinery, electronics, and more. Multi-language international trade marketplace with 13 supported languages.',
  keywords: [
    'B2B trade', 'global exhibition', 'online auction', 'wholesale marketplace',
    'product sourcing', 'verified suppliers', 'international trade',
    'industrial machinery', 'electronics wholesale', 'chemical products',
    'agricultural products', 'textile wholesale', 'metal products',
    'construction materials', 'food and beverage', 'consumer goods',
    'global sourcing', 'trade platform', 'B2B marketplace',
    '跨境电商', '国际贸易', 'B2B平台', '线上展会', '批发市场', '心海环球',
    '国際貿易', 'B2B取引', 'オンライン展示会',
    '국제무역', 'B2B플랫폼', '온라인전시회',
    'التجارة العالمية', 'السوق الإلكتروني',
    'international exhibition', 'global trade', 'B2B e-commerce',
  ],
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || '',
    bing: process.env.BING_SITE_VERIFICATION || '',
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SeaHeart Global",
  },
  alternates: {
    canonical: alternates.canonical,
    languages: alternates.languages,
  },
  openGraph: {
    title: 'SeaHeart Global | 心海环球 - Global B2B Trade Exhibition & Auction Platform',
    description: 'Connect global buyers and sellers. Discover wholesale products and verified suppliers for international trade across 13 languages.',
    type: "website",
    url: BASE_URL,
    siteName: "SeaHeart Global | 心海环球",
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "SeaHeart Global B2B Trade Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: 'SeaHeart Global | 心海环球 - Global B2B Trade Exhibition & Auction Platform',
    description: "Connect global buyers and sellers. Discover wholesale products and verified suppliers for international trade.",
    images: [`${BASE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    "application-name": "SeaHeart Global",
    "theme-color": "#2563eb",
    "geo.region": "Global",
    "geo.placename": "International",
  },
  };
}

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteSchema = JSON.stringify(generateWebsiteSchema());
  const organizationSchema = JSON.stringify(generateOrganizationSchemaFull());
  const webApplicationSchema = JSON.stringify(generateWebApplicationSchema());

  // Serve the correct language attribute per request instead of a hard-coded "en".
  const h = await headers();
  const pathname = h.get("x-pathname") || "/";
  const locale = detectLocale(pathname);
  // Next.js drops non-standard keys from alternates.languages, so x-default is
  // rendered here by hand. It must track the CURRENT page, not the homepage.
  const xDefaultHref = buildAlternates(pathname).languages['x-default'] ?? `${BASE_URL}/en`;

  return (
    <html lang={locale} dir={localeDir(locale)} className="h-full antialiased">
      <head>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `,
              }}
            />
          </>
        )}
        
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SeaHeart Global" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        
        {/* Per-language hreflang alternates come from generateMetadata() above.
            Only x-default is emitted here, because Next.js strips it from
            metadata.alternates.languages. */}
        <link rel="alternate" hrefLang="x-default" href={xDefaultHref} />
        
        {/* Structured Data for SEO and AI */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: websiteSchema }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: organizationSchema }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: webApplicationSchema }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          {children}
        </LanguageProvider>
        
        <CookieConsent />
        
        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                      console.log('[PWA] SW registered:', registration.scope);
                    })
                    .catch((error) => {
                      console.log('[PWA] SW registration failed:', error);
                    });
                });
                // Auto-reload when a new Service Worker activates, so users
                // immediately pick up fresh production assets (fixes stale
                // dev-mode JS being served from the old SW cache).
                navigator.serviceWorker.addEventListener('message', (event) => {
                  if (event.data && event.data.type === 'SW_UPDATED') {
                    console.log('[PWA] SW updated to', event.data.version, '- reloading');
                    window.location.reload();
                  }
                });
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                  window.location.reload();
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}