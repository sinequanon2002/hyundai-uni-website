import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://[도메인]'; // TODO: 실제 도메인 또는 env 교체

  const pages = [
    { url: '/', priority: 1.0, changeFrequency: 'weekly' as const },
    { url: '/company/greeting', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/company/profile', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/company/history', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/company/certifications', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/company/location', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/waste/about', priority: 0.9, changeFrequency: 'monthly' as const },
    { url: '/waste/types', priority: 0.9, changeFrequency: 'monthly' as const },
    { url: '/waste/storage', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/waste/process', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/waste/compliance', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/allbaro/about', priority: 0.5, changeFrequency: 'monthly' as const },
    { url: '/allbaro/guide', priority: 0.5, changeFrequency: 'monthly' as const },
    { url: '/support/notice', priority: 0.6, changeFrequency: 'weekly' as const },
    { url: '/support/gallery', priority: 0.6, changeFrequency: 'weekly' as const },
    { url: '/support/inquiry', priority: 0.9, changeFrequency: 'weekly' as const },
  ];

  return pages.map(p => ({
    url: `${baseUrl}${p.url}`,
    lastModified: new Date(),
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));
}
