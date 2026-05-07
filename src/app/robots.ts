import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hyundaiuni.kr';

  return {
    rules: [
      {
        // 일반 크롤러: 관리자·인증·API 경로 차단
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/login',
          '/settings',
          '/users',
          '/inquiries',
          '/notices/new',
          '/notices/*/edit',
          '/gallery/new',
          '/gallery/*/edit',
        ],
      },
      {
        // GPTBot (ChatGPT) — GEO 허용
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/api/', '/login', '/settings', '/users', '/inquiries'],
      },
      {
        // Google-Extended (Gemini) — GEO 허용
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: ['/api/', '/login', '/settings', '/users', '/inquiries'],
      },
      {
        // ClaudeBot (Claude) — GEO 허용
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: ['/api/', '/login', '/settings', '/users', '/inquiries'],
      },
      {
        // Bingbot — 허용
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/login', '/settings', '/users', '/inquiries'],
      },
      {
        // Yeti (Naver) — 허용
        userAgent: 'Yeti',
        allow: '/',
        disallow: ['/api/', '/login', '/settings', '/users', '/inquiries'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
