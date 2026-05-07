import { MetadataRoute } from 'next';
import { wasteTypeDetails } from '@/lib/waste-type-details';
import { getBlogPosts } from '@/lib/actions/blog';
import { getNotices } from '@/lib/actions/notices';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hyundaiuni.kr';

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`,                     priority: 1.0, changeFrequency: 'weekly',  lastModified: new Date() },
    // 회사소개
    { url: `${baseUrl}/company/greeting`,      priority: 0.7, changeFrequency: 'monthly', lastModified: new Date() },
    { url: `${baseUrl}/company/profile`,       priority: 0.7, changeFrequency: 'monthly', lastModified: new Date() },
    { url: `${baseUrl}/company/history`,       priority: 0.7, changeFrequency: 'monthly', lastModified: new Date() },
    { url: `${baseUrl}/company/certifications`,priority: 0.8, changeFrequency: 'monthly', lastModified: new Date() },
    { url: `${baseUrl}/company/location`,      priority: 0.6, changeFrequency: 'monthly', lastModified: new Date() },
    // 지정폐기물 정보 (핵심 SEO)
    { url: `${baseUrl}/waste/about`,           priority: 0.9, changeFrequency: 'monthly', lastModified: new Date() },
    { url: `${baseUrl}/waste/types`,           priority: 0.9, changeFrequency: 'monthly', lastModified: new Date() },
    { url: `${baseUrl}/waste/storage`,         priority: 0.8, changeFrequency: 'monthly', lastModified: new Date() },
    { url: `${baseUrl}/waste/process`,         priority: 0.8, changeFrequency: 'monthly', lastModified: new Date() },
    { url: `${baseUrl}/waste/compliance`,      priority: 0.8, changeFrequency: 'monthly', lastModified: new Date() },
    // 올바로시스템
    { url: `${baseUrl}/allbaro/about`,         priority: 0.5, changeFrequency: 'monthly', lastModified: new Date() },
    { url: `${baseUrl}/allbaro/guide`,         priority: 0.5, changeFrequency: 'monthly', lastModified: new Date() },
    // 고객센터
    { url: `${baseUrl}/support/notice`,        priority: 0.6, changeFrequency: 'weekly',  lastModified: new Date() },
    { url: `${baseUrl}/support/blog`,          priority: 0.7, changeFrequency: 'weekly',  lastModified: new Date() },
    { url: `${baseUrl}/support/gallery`,       priority: 0.6, changeFrequency: 'weekly',  lastModified: new Date() },
    { url: `${baseUrl}/support/inquiry`,       priority: 0.9, changeFrequency: 'monthly', lastModified: new Date() },
  ];

  // 폐기물 유형별 랜딩 페이지 (SSG, 고우선순위)
  const wasteTypePages: MetadataRoute.Sitemap = wasteTypeDetails.map((d) => ({
    url: `${baseUrl}/waste/types/${encodeURIComponent(d.slug)}`,
    priority: 0.85,
    changeFrequency: 'monthly' as const,
    lastModified: new Date(),
  }));

  // 블로그/자료실 동적 페이지
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const blogResult = await getBlogPosts({ pageSize: 200 });
    if (blogResult.success && blogResult.data) {
      blogPages = blogResult.data.posts.map((post) => ({
        url: `${baseUrl}/support/blog/${post.id}`,
        priority: 0.7,
        changeFrequency: 'monthly' as const,
        lastModified: post.updated_at ? new Date(post.updated_at) : new Date(post.created_at),
      }));
    }
  } catch {
    // 블로그 조회 실패 시 무시
  }

  // 공지사항 동적 페이지
  let noticePages: MetadataRoute.Sitemap = [];
  try {
    const noticeResult = await getNotices({ pageSize: 200 });
    if (noticeResult.success && noticeResult.data) {
      noticePages = noticeResult.data.notices.map((notice) => ({
        url: `${baseUrl}/support/notice/${notice.id}`,
        priority: 0.5,
        changeFrequency: 'monthly' as const,
        lastModified: notice.updated_at ? new Date(notice.updated_at) : new Date(notice.created_at),
      }));
    }
  } catch {
    // 공지사항 조회 실패 시 무시
  }

  return [...staticPages, ...wasteTypePages, ...blogPages, ...noticePages];
}
