// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Konfigurasi yang sudah ada
  allowedDevOrigins: ["http://192.168.169.15:3000"],
  transpilePackages: ['@ckeditor/ckeditor5-react', '@ckeditor/ckeditor5-build-classic'],

  // Headers untuk development (dari saran Claude AI)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
