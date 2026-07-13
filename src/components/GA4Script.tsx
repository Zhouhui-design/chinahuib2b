'use client'

import Script from 'next/script'

export default function GA4Script() {
  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID

  if (!ga4Id) {
    return null
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
      />
      <Script strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${ga4Id}', {
            page_path: window.location.pathname,
            page_title: document.title,
            send_page_view: true
          });
        `}
      </Script>
    </>
  )
}