// ============================================================
// COMPUNIL — Root Layout
// ============================================================

import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'

export const metadata: Metadata = {
  title: {
    default:  'Compunil — Egypt\'s #1 Tech Store',
    template: '%s | Compunil',
  },
  description:
    'Shop laptops, PC components, gaming accessories, CCTV systems, networking equipment and more. Best prices in Egypt. Fast delivery, expert support.',
  keywords: [
    'laptops egypt', 'pc components', 'gaming accessories', 'cctv egypt',
    'networking equipment', 'tech store cairo', 'compunil',
  ],
  openGraph: {
    type:        'website',
    siteName:    'Compunil',
    title:       'Compunil — Egypt\'s #1 Tech Store',
    description: 'Laptops, PC components, gaming, CCTV & more at the best prices in Egypt.',
  },
  themeColor: '#1B3A7A',
  viewport:   'width=device-width, initial-scale=1, viewport-fit=cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
