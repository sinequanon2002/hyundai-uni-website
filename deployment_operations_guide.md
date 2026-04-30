# 배포 및 운영 가이드

## 🚀 배포 전 체크리스트

### 환경 설정 (1-2일)

#### Supabase
```bash
# 1. 프로젝트 생성
# https://app.supabase.com
# - 지역: Asia-Pacific (Tokyo 또는 Singapore)
# - 데이터베이스 암호 설정 (최소 20자)

# 2. 환경 변수 설정
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATA_ENCRYPTION_KEY=your_32_byte_hex_key  # openssl rand -hex 32

# 3. 테이블 생성
# - SQL 에디터에서 schema.sql 실행

# 4. 보안 설정
# - Row Level Security (RLS) 활성화
# - 인증 정책 설정
# - Storage 버킷 생성 및 권한 설정

# 5. 백업 설정
# - 자동 백업 활성화 (권장: 일일)
# - 백업 보관 기간 설정 (권장: 30일)
```

#### Resend
```bash
# 1. 계정 생성
# https://resend.com
# - 이메일 주소 확인
# - 신용카드 등록

# 2. API 키 생성
# - Dashboard → API Keys → Create
RESEND_API_KEY=re_xxxxx

# 3. 도메인 인증
# a) 도메인 추가
# - Settings → Domains → Add domain

# b) DNS 레코드 설정
DNS 레코드 추가:
- Type: TXT
- Name: (Resend에서 제시)
- Value: (Resend에서 제시)

# 검증 완료 대기 (보통 1-10분)

# 4. 이메일 주소 설정
RESEND_FROM_EMAIL=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
SUPPORT_EMAIL=support@yourdomain.com

# 5. 웹훅 설정
# - Dashboard → Webhooks → New webhook
# - URL: https://yourdomain.com/api/webhooks/resend
# - Events: email.sent, email.delivered, email.bounced
# - 서명 키 저장
```

#### 환경 변수 (Next.js)
```bash
# .env.local (로컬 개발)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATA_ENCRYPTION_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
ADMIN_EMAIL=
SUPPORT_EMAIL=
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# .env.production (배포)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
DATA_ENCRYPTION_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
ADMIN_EMAIL=
SUPPORT_EMAIL=
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# 웹훅 서명
RESEND_WEBHOOK_SECRET=whsec_xxxxx
```

---

## 🔐 보안 배포 체크리스트

### 1단계: 코드 보안

```javascript
// ✅ 해야 할 것

// 1. 모든 민감한 데이터는 환경 변수에
const apiKey = process.env.RESEND_API_KEY;

// 2. 입력 검증 필수
import { z } from 'zod';
const schema = z.object({ email: z.string().email() });

// 3. XSS 방지
import DOMPurify from 'isomorphic-dompurify';
const clean = DOMPurify.sanitize(userInput, { ALLOWED_TAGS: [] });

// 4. CSRF 보호
import csrf from 'csrf';

// 5. Rate limiting
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });

// ❌ 하지 말아야 할 것

// 1. 환경 변수를 코드에 하드코딩
// const apiKey = 're_xxxxx'; // 안 됨!

// 2. 클라이언트에 민감한 정보 노출
// <script>window.ENCRYPTION_KEY = 'xxx'</script> // 안 됨!

// 3. 에러 스택 그대로 반환
// return error.stack; // 안 됨!

// 4. 입력 검증 없이 데이터베이스 저장
// db.insert(userInput); // 안 됨!
```

### 2단계: 네트워크 보안

```javascript
// Next.js middleware.ts

import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. HTTPS 강제
  if (request.headers.get('x-forwarded-proto') !== 'https') {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.redirect(
        `https://${request.nextUrl.host}${request.nextUrl.pathname}`,
        { status: 301 }
      );
    }
  }
  
  // 2. 보안 헤더 설정
  const response = NextResponse.next();
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
  );
  
  return response;
}

export const config = {
  matcher: ['/api/:path*', '/admin/:path*'],
};
```

### 3단계: 데이터베이스 보안

```sql
-- 1. Row Level Security (RLS) 정책

-- Inquiry 테이블 - 관리자만 조회/수정
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_can_view" ON inquiries
  FOR SELECT
  USING (auth.role() = 'admin');

CREATE POLICY "admin_can_update" ON inquiries
  FOR UPDATE
  USING (auth.role() = 'admin')
  WITH CHECK (auth.role() = 'admin');

CREATE POLICY "anyone_can_insert" ON inquiries
  FOR INSERT
  WITH CHECK (true);

-- 2. 암호화 정책
CREATE OR REPLACE FUNCTION apply_encryption()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email IS NOT NULL THEN
    NEW.email := pgp_sym_encrypt(
      NEW.email,
      current_setting('app.encryption_key')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER encrypt_email_trigger
BEFORE INSERT OR UPDATE ON inquiries
FOR EACH ROW
EXECUTE FUNCTION apply_encryption();

-- 3. 감시 로그
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  user_id UUID,
  action TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);

-- 4. 정기적 백업
-- Supabase 대시보드에서 설정
```

---

## 📊 모니터링 및 로깅

### 1. 에러 추적 (Sentry)

```javascript
// sentry.server.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
  ],
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  beforeSend: (event, hint) => {
    // 민감한 정보 필터링
    if (event.request) {
      delete event.request.headers;
      delete event.request.cookies;
    }
    return event;
  },
});

// 사용
try {
  await sendConfirmationEmail(inquiry);
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      service: 'email',
      inquiry_id: inquiry.id,
    },
    contexts: {
      inquiry: {
        email: inquiry.email,
        company: inquiry.company_name,
      },
    },
  });
}
```

### 2. 이메일 모니터링

```javascript
// API 엔드포인트 - 이메일 상태 확인

export async function GET(req) {
  // 미전송 이메일 조회
  const { data: pending } = await supabase
    .from('email_logs')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(10);
  
  // 실패한 이메일 조회
  const { data: failed } = await supabase
    .from('email_logs')
    .select('*')
    .eq('status', 'failed')
    .order('created_at', { ascending: false })
    .limit(10);
  
  return Response.json({
    pending_emails: pending?.length || 0,
    failed_emails: failed?.length || 0,
    details: {
      pending,
      failed,
    },
  });
}

// Cron Job - 정기적 모니터링
import { sendEmail } from '@/lib/resend';

export async function GET(req) {
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // 1시간 이상 미전송 이메일 재시도
  const { data: stuck } = await supabase
    .from('email_logs')
    .select('*')
    .eq('status', 'pending')
    .lt('created_at', new Date(Date.now() - 3600000).toISOString());
  
  for (const log of stuck || []) {
    try {
      // 재전송
      await sendEmail(log.inquiry_id, log.email_type);
      
      // 로그 업데이트
      await supabase
        .from('email_logs')
        .update({ status: 'retrying' })
        .eq('id', log.id);
    } catch (error) {
      console.error('Email retry failed:', error);
    }
  }
  
  return Response.json({ status: 'ok' });
}
```

### 3. 데이터베이스 모니터링

```javascript
// 데이터베이스 성능 모니터링

export async function monitorDatabase() {
  // 1. 로우 수 확인
  const { count } = await supabase
    .from('inquiries')
    .select('*', { count: 'exact', head: true });
  
  if (count > 100000) {
    // 경고: 대량 데이터
    sendAlert('Database size exceeding 100k rows');
  }
  
  // 2. 저장소 사용량 (Supabase API)
  const response = await fetch(
    'https://api.supabase.com/v1/projects/your-project/usage',
    {
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_ADMIN_TOKEN}`,
      },
    }
  );
  
  const usage = await response.json();
  console.log('Database storage:', usage.database_size);
  
  // 3. 삭제된 데이터 정리
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data } = await supabase
    .from('inquiries')
    .delete()
    .eq('is_deleted', true)
    .lt('deleted_at', thirtyDaysAgo.toISOString());
  
  console.log(`Deleted ${data?.length || 0} soft-deleted records`);
}
```

### 4. 대시보드 구축

```javascript
// pages/admin/dashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalInquiries: 0,
    pendingInquiries: 0,
    quotedInquiries: 0,
    failedEmails: 0,
    lastUpdate: new Date(),
  });
  
  useEffect(() => {
    const fetchStats = async () => {
      // 전체 문의
      const { count: total } = await supabase
        .from('inquiries')
        .select('*', { count: 'exact', head: true });
      
      // 대기 중인 문의
      const { count: pending } = await supabase
        .from('inquiries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      // 견적서 발송됨
      const { count: quoted } = await supabase
        .from('inquiries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'quoted');
      
      // 실패한 이메일
      const { count: failed } = await supabase
        .from('email_logs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'failed');
      
      setStats({
        totalInquiries: total || 0,
        pendingInquiries: pending || 0,
        quotedInquiries: quoted || 0,
        failedEmails: failed || 0,
        lastUpdate: new Date(),
      });
    };
    
    fetchStats();
    
    // 60초마다 갱신
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">대시보드</h1>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">전체 문의</p>
          <p className="text-4xl font-bold">{stats.totalInquiries}</p>
        </div>
        
        <div className="bg-blue-50 p-6 rounded-lg shadow">
          <p className="text-gray-600">대기 중</p>
          <p className="text-4xl font-bold">{stats.pendingInquiries}</p>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg shadow">
          <p className="text-gray-600">견적서 발송됨</p>
          <p className="text-4xl font-bold">{stats.quotedInquiries}</p>
        </div>
        
        <div className="bg-red-50 p-6 rounded-lg shadow">
          <p className="text-gray-600">실패한 이메일</p>
          <p className="text-4xl font-bold text-red-600">{stats.failedEmails}</p>
        </div>
      </div>
      
      <p className="text-sm text-gray-500 mt-6">
        마지막 업데이트: {stats.lastUpdate.toLocaleString('ko-KR')}
      </p>
    </div>
  );
}
```

---

## 📋 운영 체크리스트

### 일일 확인사항
- [ ] 이메일 전송 상태 확인
- [ ] 실패한 inquiry 있는지 확인
- [ ] 데이터베이스 용량 확인
- [ ] 에러 로그 확인

### 주간 확인사항
- [ ] 대기 중인 inquiry 처리
- [ ] 백업 정상 진행 확인
- [ ] 성능 지표 검토
- [ ] 고객 피드백 검토

### 월간 확인사항
- [ ] 비용 청구 확인
- [ ] 보안 정책 검토
- [ ] 데이터 삭제 정책 준수 확인
- [ ] 통계 보고서 생성

---

## 🆘 트러블슈팅

### 이메일이 스팸 폴더로 가는 경우

```
1. SPF 레코드 확인
   - dig yourdomain.com TXT | grep v=spf1
   
2. DKIM 레코드 확인
   - dig default._domainkey.yourdomain.com TXT
   
3. DMARC 레코드 추가
   - TXT 레코드: v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
   
4. 발신자 신뢰도 구축
   - 초기에는 소량만 발송
   - 점진적으로 발송량 증가
   - 수신 거부율 모니터링
```

### 데이터베이스 연결 실패

```javascript
// 재시도 로직
async function connectWithRetry(maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const { data } = await supabase
        .from('inquiries')
        .select('*')
        .limit(1);
      return true;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      
      if (i < maxRetries - 1) {
        // 지수 백오프: 1초, 2초, 4초
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
      }
    }
  }
  throw new Error('Failed to connect to database');
}
```

### API Rate Limit 초과

```javascript
// Resend Rate Limit 처리
import pQueue from 'p-queue';

const emailQueue = new pQueue({
  concurrency: 1,
  interval: 1000, // 1초마다
  intervalCap: 10, // 최대 10개
});

async function sendBatchEmails(emails) {
  for (const email of emails) {
    emailQueue.add(() => resend.emails.send(email));
  }
  
  await emailQueue.onIdle();
}
```

---

## 🔄 배포 후 단계

### Phase 1: 모니터링 (1주)
- [ ] 모든 시스템 정상 작동 확인
- [ ] 에러 로그 매일 확인
- [ ] 성능 지표 모니터링

### Phase 2: 최적화 (2주)
- [ ] 성능 병목 지점 파악
- [ ] 캐싱 전략 구현
- [ ] 데이터베이스 인덱스 최적화

### Phase 3: 자동화 (3주)
- [ ] 일일 보고서 자동화
- [ ] 백업 자동화
- [ ] 데이터 정리 자동화

### Phase 4: 운영 (4주+)
- [ ] 정기적 보안 감시
- [ ] 비용 최적화
- [ ] 기능 개선 계획
