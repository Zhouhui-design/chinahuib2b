import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Script from "next/script";
import { languages } from "@/lib/languages";
import { generateWebsiteSchema, generateLocalBusinessSchema } from "@/lib/schema-org";

const inter = Inter({
  subsets: ["latin"],
});

const BASE_URL = "https://x2xhub.com";

export const metadata: Metadata = {
  title: "X2XHub - Global B2B Trade Exhibition Platform",
  description: "Connect global buyers and sellers. Discover quality products and verified suppliers for international trade across 13 languages.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "X2XHUB",
  },
  alternates: {
    canonical: `${BASE_URL}/`,
    languages: Object.fromEntries(
      languages.map((lang) => [
        lang.code,
        `${BASE_URL}${lang.code === "en" ? "" : "/" + lang.code}`,
      ])
    ),
  },
  openGraph: {
    title: "X2XHub - Global B2B Trade Exhibition Platform",
    description: "Connect global buyers and sellers. Discover quality products and verified suppliers for international trade.",
    type: "website",
    url: BASE_URL,
    siteName: "X2XHub",
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "X2XHub Global B2B Trade Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "X2XHub - Global B2B Trade Exhibition Platform",
    description: "Connect global buyers and sellers. Discover quality products and verified suppliers for international trade.",
    images: [`${BASE_URL}/og-image.png`],
  },
  other: {
    "application-name": "X2XHub",
    "theme-color": "#2563eb",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteSchema = JSON.stringify(generateWebsiteSchema());
  const localBusinessSchema = JSON.stringify(generateLocalBusinessSchema());

  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="X2XHUB" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        
        {languages.map((lang) => (
          <link
            key={lang.code}
            rel="alternate"
            hrefLang={lang.code}
            href={`${BASE_URL}${lang.code === "en" ? "" : "/" + lang.code}`}
          />
        ))}
        
        <link rel="alternate" hrefLang="x-default" href={BASE_URL} />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: websiteSchema }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: localBusinessSchema }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          {children}
        </LanguageProvider>
        
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
              }
            `,
          }}
        />
        
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-YOUR_TRACKING_ID"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-YOUR_TRACKING_ID');
            `,
          }}
        />
      </body>
    </html>
  );
}