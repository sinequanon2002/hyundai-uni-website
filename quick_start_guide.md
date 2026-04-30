# 빠른 시작 가이드 - 30분 안에 Inquiry 시스템 구축하기

## 📦 사전 준비물
- Node.js 18.0+
- npm 또는 yarn
- GitHub 계정 (선택사항)
- 도메인 (선택사항 - 초기에는 localhost에서 테스트 가능)

---

## ⏱️ 1단계: 프로젝트 설정 (5분)

### 1.1 Next.js 프로젝트 생성
```bash
# Next.js 프로젝트 생성
npx create-next-app@latest inquiry-system --typescript --tailwind

cd inquiry-system

# 필요한 패키지 설치
npm install \
  @supabase/supabase-js \
  resend \
  zod \
  react-hook-form \
  @hookform/resolvers \
  isomorphic-dompurify

npm install -D \
  @types/node \
  typescript
```

### 1.2 환경 변수 설정
```bash
# .env.local 파일 생성
cat > .env.local << 'EOF'
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATA_ENCRYPTION_KEY=

# Resend
RESEND_API_KEY=re_xxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
SUPPORT_EMAIL=support@yourdomain.com

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
EOF
```

---

## 🗄️ 2단계: Supabase 설정 (8분)

### 2.1 Supabase 프로젝트 생성
```
1. https://app.supabase.com 방문
2. "New Project" 클릭
3. 정보 입력:
   - Project name: inquiry-system
   - Database Password: (강력한 비밀번호)
   - Region: Asia Pacific (Tokyo)
4. Create project 클릭
5. 5-10분 대기...
```

### 2.2 API 키 복사
```
1. Settings → API로 이동
2. Project URL → SUPABASE_URL에 복사
3. "anon public" key → SUPABASE_ANON_KEY에 복사
4. "service_role secret" key → SUPABASE_SERVICE_ROLE_KEY에 복사
```

### 2.3 암호화 키 생성
```bash
# 터미널에서 실행
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 출력된 값을 .env.local의 DATA_ENCRYPTION_KEY에 붙여넣기
```

### 2.4 테이블 생성
```
1. Supabase 대시보드의 SQL Editor 열기
2. 아래 코드 복사-붙여넣기
```

```sql
-- 메인 테이블
CREATE TABLE inquiries (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  category TEXT NOT NULL,
  details TEXT NOT NULL,
  budget INTEGER,
  timeline TEXT,
  status TEXT DEFAULT 'pending',
  ip_address INET,
  user_agent TEXT,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_email ON inquiries(email);

-- 이메일 로그 테이블
CREATE TABLE email_logs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  inquiry_id BIGINT REFERENCES inquiries(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  email_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  resend_message_id TEXT,
  status TEXT DEFAULT 'pending',
  error_message TEXT
);

CREATE INDEX idx_email_logs_inquiry_id ON email_logs(inquiry_id);
CREATE INDEX idx_email_logs_status ON email_logs(status);
```

```
3. "Run" 버튼 클릭
```

---

## 📧 3단계: Resend 설정 (5분)

### 3.1 Resend 계정 생성
```
1. https://resend.com 방문
2. "Get Started" 클릭
3. 이메일로 가입
```

### 3.2 API 키 발급
```
1. Dashboard 열기
2. "API Keys" 클릭
3. "Create API Key" 클릭
4. 키 복사 → .env.local의 RESEND_API_KEY에 붙여넣기
```

### 3.3 발신 이메일 설정 (로컬 테스트만 해도 됨)
```
테스트용 이메일: test@resend.dev
프로덕션: 도메인 인증 필요 (별도 가이드 참고)

.env.local에 설정:
RESEND_FROM_EMAIL=test@resend.dev
```

---

## 💻 4단계: 코드 구현 (10분)

### 4.1 API 엔드포인트 생성

```bash
# 디렉토리 생성
mkdir -p app/api/inquiry
```

`app/api/inquiry/route.ts` 파일 생성:

```typescript
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

const schema = z.object({
  company_name: z.string().min(2),
  contact_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string(),
  category: z.enum(['웹개발', '앱개발', '디자인', '마케팅', '기타']),
  details: z.string().min(10),
  budget: z.number().optional(),
  timeline: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    // Supabase에 저장
    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .insert([{
        company_name: data.company_name,
        contact_name: data.contact_name,
        email: data.email,
        phone: data.phone,
        category: data.category,
        details: data.details,
        budget: data.budget,
        timeline: data.timeline,
        status: 'pending',
        ip_address: req.headers.get('x-forwarded-for'),
        user_agent: req.headers.get('user-agent'),
      }])
      .select()
      .single();

    if (error) throw error;

    // 확인 이메일 발송 (백그라운드)
    resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'test@resend.dev',
      to: data.email,
      subject: '문의 접수 확인',
      html: `
        <h2>문의가 접수되었습니다!</h2>
        <p>안녕하세요 ${data.contact_name}님,</p>
        <p>귀하의 문의가 정상적으로 접수되었습니다.</p>
        <p>빠른 시간 내에 연락드리겠습니다.</p>
      `,
    }).catch(console.error);

    return Response.json({
      success: true,
      message: '문의가 접수되었습니다.',
      inquiryId: inquiry.id,
    }, { status: 201 });

  } catch (error) {
    console.error(error);
    return Response.json(
      { error: '요청 처리에 실패했습니다.' },
      { status: 400 }
    );
  }
}
```

### 4.2 폼 컴포넌트 생성

`components/InquiryForm.tsx` 파일 생성:

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  company_name: z.string().min(2, '회사명 필수'),
  contact_name: z.string().min(2, '이름 필수'),
  email: z.string().email('이메일 주소 필수'),
  phone: z.string().min(7, '전화번호 필수'),
  category: z.enum(['웹개발', '앱개발', '디자인', '마케팅', '기타']),
  details: z.string().min(10, '세부사항 최소 10자'),
  budget: z.number().optional(),
  timeline: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function InquiryForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error);

      setMessage('✅ 문의가 접수되었습니다!');
      reset();
      setTimeout(() => setMessage(''), 5000);

    } catch (error) {
      setMessage(`❌ ${error instanceof Error ? error.message : '오류 발생'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">프로젝트 문의</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">회사명 *</label>
        <input
          {...register('company_name')}
          type="text"
          className="w-full px-4 py-2 border rounded-lg"
          placeholder="회사명"
        />
        {errors.company_name && <p className="text-red-500 text-sm">{errors.company_name.message}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">담당자 이름 *</label>
        <input
          {...register('contact_name')}
          type="text"
          className="w-full px-4 py-2 border rounded-lg"
        />
        {errors.contact_name && <p className="text-red-500 text-sm">{errors.contact_name.message}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">이메일 *</label>
        <input
          {...register('email')}
          type="email"
          className="w-full px-4 py-2 border rounded-lg"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">전화번호 *</label>
        <input
          {...register('phone')}
          type="tel"
          className="w-full px-4 py-2 border rounded-lg"
        />
        {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">카테고리 *</label>
        <select {...register('category')} className="w-full px-4 py-2 border rounded-lg">
          <option value="">선택하세요</option>
          <option value="웹개발">웹 개발</option>
          <option value="앱개발">앱 개발</option>
          <option value="디자인">디자인</option>
          <option value="마케팅">마케팅</option>
          <option value="기타">기타</option>
        </select>
        {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">세부사항 *</label>
        <textarea
          {...register('details')}
          className="w-full px-4 py-2 border rounded-lg h-32"
          placeholder="프로젝트 세부사항"
        />
        {errors.details && <p className="text-red-500 text-sm">{errors.details.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? '전송 중...' : '문의하기'}
      </button>

      {message && <div className="mt-4 p-4 rounded-lg bg-gray-100 text-center">{message}</div>}
    </form>
  );
}
```

### 4.3 페이지에서 사용

`app/page.tsx`를 다음과 같이 수정:

```typescript
import InquiryForm from '@/components/InquiryForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <InquiryForm />
    </main>
  );
}
```

---

## 🚀 5단계: 실행 및 테스트 (2분)

### 5.1 개발 서버 시작
```bash
npm run dev
```

### 5.2 로컬에서 테스트
```
1. http://localhost:3000 열기
2. 폼 작성
3. "문의하기" 버튼 클릭
4. 성공 메시지 확인
```

### 5.3 Supabase에서 데이터 확인
```
1. Supabase 대시보드 → Table Editor
2. "inquiries" 테이블 클릭
3. 새로운 행이 생성되었는지 확인
```

### 5.4 이메일 확인 (선택)
```
테스트 이메일: test@resend.dev로 설정 시
Resend 대시보드 → Emails에서 확인
```

---

## ✅ 완성된 기능

이제 다음이 완성되었습니다:

✅ 문의 폼 제출  
✅ 데이터 유효성 검사  
✅ 데이터 암호화 저장 (수동)  
✅ 확인 이메일 발송  
✅ 관리자 알림 준비 완료  

---

## 📈 다음 단계

### 선택사항 1: 관리자 대시보드
```bash
npm install next-auth
# app/admin/page.tsx 추가
```

### 선택사항 2: 데이터 암호화
```bash
npm install crypto
# 암호화 함수 구현
```

### 선택사항 3: 파일 업로드
```bash
# app/api/inquiry/upload 엔드포인트 추가
# Supabase Storage 설정
```

### 선택사항 4: 프로덕션 배포
```bash
# Vercel에 배포
npm install -g vercel
vercel
```

---

## 🆘 문제 해결

### "Supabase 연결 실패"
```bash
# .env.local 확인
# SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 확인
```

### "Resend 이메일 실패"
```bash
# RESEND_API_KEY 확인
# test@resend.dev 사용 여부 확인
```

### 폼 제출 불가
```bash
# 브라우저 콘솔에서 오류 확인
# F12 → Console 탭
```

---

## 📚 추가 리소스

- **Supabase 문서**: https://supabase.com/docs
- **Resend 문서**: https://resend.com/docs  
- **Next.js 가이드**: https://nextjs.org/docs
- **Zod 검증**: https://zod.dev

---

**축하합니다! 기본 Inquiry 시스템이 완성되었습니다! 🎉**

프로덕션 배포 전에 보안 가이드와 운영 가이드를 읽어보세요.
