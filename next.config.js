/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google profile pictures
      },
    ],
    formats: ['image/avif', 'image/webp'],
    // Bypass the Next.js image optimizer for external images.
    // The optimizer returns 404 for some external hosts on Vercel's
    // hobby tier; serving them directly is more reliable.
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['framer-motion', 'react-icons'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection',        value: '1; mode=block' },
          // COOP set to allow popups so Google Sign-In popup can
          // communicate back to the opener window.
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
