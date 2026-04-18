# 현대유앤아이환경 웹사이트 프로젝트

지정폐기물 수거·운반업 전문 기업의 리브랜딩 및 SEO 최적화형 B2B 기업용 웹사이트입니다.

## 🛠 기술 스택
- **Framework**: [Next.js 14 App Router](https://nextjs.org/) (React 18)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **SEO & Metadata**: Next.js Metadata API, sitemap.ts, robots.ts
- **Language**: TypeScript

## 🚀 시작하기

1. 패키지 설치
\`\`\`bash
npm install
\`\`\`

2. 환경 변수 설정
\`\`\`bash
cp .env.local.example .env.local
\`\`\`
이후 \`.env.local\` 파일 내의 카카오맵 API 키 및 도메인을 알맞게 수정합니다.

3. 개발 서버 실행
\`\`\`bash
npm run dev
\`\`\`
[http://localhost:3000](http://localhost:3000)에서 결과를 확인할 수 있습니다.

## 📦 빌드 및 프로덕션
Vercel에 배포 전 로컬 환경에서 이상유무를 체크하는 방법입니다.

\`\`\`bash
npm run build
npm start
\`\`\`

## 🌐 Vercel 배포 방법
본 프로젝트는 Vercel 배포에 완벽하게 호환되도록 구성되어 있습니다.

1. **GitHub 연동**: GitHub에 로컬 레포지토리를 Push 합니다.
2. **Vercel 연결**: Vercel 대시보드에서 \`Add New > Project\`를 선택하고 해당 레포지토리를 Import 합니다.
3. **환경 변수 세팅**: Vercel의 Environment Variables 설정 창에서 \`.env.local.example\`에 명시된 키들을 주입합니다. (특히 \`NEXT_PUBLIC_SITE_URL\` 필수)
4. 배포 (Deploy) 버튼을 누르면 즉시 고가용성 엣지 서버에 라이브 됩니다.

## 📋 출시 점검 (최종 반영)
운영 진입 전 반드시 프로젝트 내 \`DEPLOY_CHECKLIST.md\` (또는 코드 내 \`// TODO\`) 항목들을 검수하시고, 더미 데이터(전화번호 등)를 실 운영 데이터로 교환하십시오.
