const fs = require('fs');
const path = require('path');

// Auto-clean removed legacy JSON configuration
const legacyConfigPath = path.join(__dirname, 'src', 'data', 'event-hero-config.json');
if (fs.existsSync(legacyConfigPath)) {
  try {
    fs.unlinkSync(legacyConfigPath);
  } catch (e) {}
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    instrumentationHook: true,
  },
  images: {
    domains: ['images.unsplash.com', 'mitra.org.uk', 'img.youtube.com', 'media.mitrauk.com'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/ganesh-event-2026',
        destination: '/events/evt-ganesh-chaturthi',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
