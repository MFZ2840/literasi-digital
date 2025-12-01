// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  allowedDevOrigins: ["http://192.168.169.15:3000"],
  transpilePackages: ['@ckeditor/ckeditor5-react', '@ckeditor/ckeditor5-build-classic'],

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
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://portofolio-mfz.vercel.app;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;