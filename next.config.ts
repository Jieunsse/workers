import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // HSTS: HTTPS 강제 (배포 환경에서 유효)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // CSP: 허용할 리소스 출처 제한
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' blob: data: https:",
              "font-src 'self'",
              "connect-src 'self' https://fe-project-cowokers.vercel.app",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          // 클릭재킹 방지
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // MIME 스니핑 방지
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // 레퍼러 정보 제한
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
