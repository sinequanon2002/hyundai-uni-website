# 🚀 출시 전 체크리스트 (DEPLOY_CHECKLIST)

본 문서는 현대유앤아이환경 웹사이트를 최종 운영 환경(Vercel 등)에 배포하기 전 반드시 완료해야 할 작업들을 정의합니다.

## 1. 기업 정보(Constants) 최우선 반영
`src/lib/constants.ts` 파일의 모든 `TODO` 항목을 실제 사업자 정보로 교체하십시오.
- [ ] `name`: 정식 법인명 (예: 현대유앤아이환경 주식회사)
- [ ] `shortName`: 브랜드명 (예: 현대유앤아이환경)
- [ ] `ceo`: 대표자 성명
- [ ] `businessNumber`: 사업자 등록번호
- [ ] `licenseNumber`: 폐기물 수거·운반 허가 번호
- [ ] `address`: 실제 사무실/본사 주소
- [ ] `tel` / `fax`: 대표 전화 및 팩스 번호
- [ ] `email`: 공식 문의 메일 주소
- [ ] `businessHours`: 실제 운영 시간

## 2. 외부 API 및 서비스 연동
- [ ] **데이터베이스 및 이메일 연동 실구현**:
    - Supabase에 `inquiries` 테이블 생성 (`supabase/migrations` 폴더 SQL 참조)
    - Resend API 키 발급 및 `.env.local` 등록 (`RESEND_API_KEY`)
    - API Route(`src/app/api/inquiry/route.ts`)를 통한 실전송 테스트
- [ ] **카카오맵 연동**: `/company/location` 페이지의 지도 영역을 실제 사업장 위치가 표시된 Kakao Map iframe 또는 API로 교체하십시오.
- [ ] **Map API Key**: 카카오맵 브라우저 API 사용 시 도메인 화이트리스트 등록 및 키 설정을 완료하십시오.

## 3. SEO 및 도메인 설정
- [ ] **도메인 설정**: `NEXT_PUBLIC_SITE_URL` 환경 변수에 실제 배포될 도메인(예: `https://hyundaiuni.co.kr`)을 설정하십시오.
- [ ] **Sitemap/Robots**: `src/app/sitemap.ts` 및 `src/app/robots.ts` 내의 사이트 URL이 정상적으로 생성되는지 로컬 빌드(`npm run build`) 후 확인하십시오.
- [ ] **파비콘(Favicon)**: `src/app/favicon.ico`를 기업 로고가 포함된 실제 아이콘 파일로 교체하십시오.

## 4. 환경 변수(Environment Variables) 설정
Vercel 대시보드 또는 운영 서버에 다음 변수들을 등록하십시오.
- [ ] `NEXT_PUBLIC_SITE_URL`: 사이트 기본 URL
- [ ] `NEXT_PUBLIC_KAKAO_MAP_API_KEY`: (필요 시) 카카오맵 API 키
- [ ] `EMAIL_SERVICE_KEY`: (필요 시) 메일 전송 서비스 API 키

## 5. 빌드 및 배포 검증
- [ ] **로컬 빌드 테스트**: `npm run build` 명령을 실행하여 Typescript 및 Lint 에러가 없는지 최종 확인하십시오.
- [ ] **반응형 체크**: 주요 모바일 기기 브라우저에서 메뉴 및 폼 동작이 원활한지 확인하십시오.
- [ ] **다크모드 대응**: 의도하지 않은 다크모드 반전 시 텍스트 가독성을 확인하십시오 (필요 시 `globals.css` 조정).

---
**최종 완료 시**: 배포 후 [Lighthouse](https://pagespeed.web.dev/)를 통해 성능 및 SEO 점수를 재측정하고, 문의하기 양식이 실제 담당자에게 전달되는지 테스트 전송을 수행하십시오.
