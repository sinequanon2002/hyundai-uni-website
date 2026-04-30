# 웹사이트 Inquiry 시스템 완전 구현 가이드
## Resend + Supabase를 활용한 개인정보 보호 및 이메일 자동화

---

## 📋 목차
1. [아키텍처 개요](#아키텍처-개요)
2. [보안 전략](#보안-전략)
3. [Supabase 설정](#supabase-설정)
4. [Resend 이메일 자동화](#resend-이메일-자동화)
5. [구현 코드](#구현-코드)
6. [마이그레이션 및 운영](#마이그레이션-및-운영)
7. [비용 분석](#비용-분석)

---

## 아키텍처 개요

### 전체 플로우

```
고객이 Inquiry 작성
       ↓
클라이언트 유효성 검사 (실시간)
       ↓
서버로 POST 요청 (암호화됨)
       ↓
서버 유효성 검사 + 데이터 정제
       ↓
Supabase PostgreSQL에 저장 (암호화)
       ↓
Resend API로 확인 이메일 발송
       ↓
관리자 대시보드에 알림
       ↓
담당자가 검토 후 견적서 이메일 발송 (Resend)
```

### 주요 특징
- **엔드-투-엔드 암호화**: 민감한 데이터는 저장 전 암호화
- **GDPR/개인정보보호법 준수**: 데이터 최소화, 삭제 정책
- **감시 및 로깅**: 모든 접근 기록 저장
- **자동 이메일 발송**: 즉시 확인 메일, 비동기 처리
- **확장성**: 월 10,000+ 건의 inquiry 처리 가능

---

## 보안 전략

### 1. 데이터 분류 및 암호화

#### 민감도 수준별 데이터 분류
```yaml
Level 1 (공개):
  - 회사명
  - 웹사이트 URL
  - 문의 카테고리

Level 2 (암호화 필요):
  - 이메일 주소
  - 전화번호
  - 담당자 이름

Level 3 (최고 보안):
  - 프로젝트 세부사항
  - 예산 정보
  - IP 주소
  - 자동화된 메모
```

### 2. 암호화 전략

**선택지 1: Supabase 내장 암호화 (권장)**
```sql
-- Supabase PostgreSQL의 pgcrypto 확장 사용
CREATE TABLE inquiries (
  id BIGINT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 공개 데이터
  company_name TEXT NOT NULL,
  category TEXT NOT NULL,
  
  -- 암호화된 데이터
  contact_name TEXT NOT NULL,  -- pgcrypto로 암호화
  email_encrypted BYTEA NOT NULL,  -- 이메일 암호화
  phone_encrypted BYTEA NOT NULL,
  details_encrypted BYTEA NOT NULL,
  
  -- 메타데이터
  status TEXT DEFAULT 'pending',
  ip_address INET,
  user_agent TEXT,
  encrypted_at TIMESTAMP WITH TIME ZONE,
  
  -- GDPR 준수
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 암호화 함수
CREATE OR REPLACE FUNCTION encrypt_sensitive_data()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email_encrypted := pgp_sym_encrypt(
    NEW.contact_name, 
    current_setting('app.encryption_key')
  );
  NEW.phone_encrypted := pgp_sym_encrypt(
    NEW.phone_number, 
    current_setting('app.encryption_key')
  );
  NEW.details_encrypted := pgp_sym_encrypt(
    NEW.details, 
    current_setting('app.encryption_key')
  );
  NEW.encrypted_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER encrypt_inquiry_trigger
BEFORE INSERT ON inquiries
FOR EACH ROW
EXECUTE FUNCTION encrypt_sensitive_data();
```

**선택지 2: 애플리케이션 레벨 암호화 (JavaScript)**
```javascript
// crypto-js 또는 tweetnacl 사용
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.DATA_ENCRYPTION_KEY; // 32 bytes

function encryptField(plaintext) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  
  // IV + AuthTag + Encrypted Data
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decryptField(encrypted) {
  const [iv, authTag, encryptedData] = encrypted.split(':');
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(ENCRYPTION_KEY),
    Buffer.from(iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

### 3. 네트워크 보안

```javascript
// 1. HTTPS만 사용
const isSecure = req.protocol === 'https' || req.secure;
if (!isSecure) {
  return res.status(400).json({ error: 'HTTPS required' });
}

// 2. CSRF 토큰 검증
import csrf from 'csrf';
const tokens = new csrf();
const csrfToken = tokens.create(secret);

// 3. Rate Limiting
import rateLimit from 'express-rate-limit';
const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // IP당 최대 5개의 inquiry
  message: '너무 많은 요청을 보냈습니다. 15분 후 다시 시도하세요.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/api/inquiry', inquiryLimiter, async (req, res) => {
  // 로직
});

// 4. CORS 설정
import cors from 'cors';
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true,
  methods: ['POST'],
  allowedHeaders: ['Content-Type'],
}));

// 5. 보안 헤더
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
```

### 4. 데이터 유효성 검사 및 정제

```javascript
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

const InquirySchema = z.object({
  company_name: z
    .string()
    .min(2, '회사명은 최소 2자 이상이어야 합니다.')
    .max(255, '회사명은 255자 이하여야 합니다.')
    .refine(
      (val) => !/[<script>]/i.test(val),
      'XSS 공격 패턴 감지'
    ),
  
  contact_name: z
    .string()
    .min(2, '이름은 최소 2자 이상이어야 합니다.')
    .max(100),
  
  email: z
    .string()
    .email('유효한 이메일 주소를 입력하세요.')
    .toLowerCase()
    .refine(
      (email) => !email.includes('..'),
      '유효하지 않은 이메일 형식'
    ),
  
  phone: z
    .string()
    .regex(/^[\d\-\+\s]{7,20}$/, '유효한 전화번호를 입력하세요.'),
  
  category: z
    .enum(['웹개발', '앱개발', '디자인', '마케팅', '기타']),
  
  details: z
    .string()
    .min(10, '세부사항은 최소 10자 이상이어야 합니다.')
    .max(5000, '세부사항은 5000자 이하여야 합니다.'),
  
  budget: z
    .number()
    .min(0, '예산은 0 이상이어야 합니다.')
    .max(1000000000, '예산이 너무 큽니다.')
    .optional(),
  
  timeline: z
    .enum(['긴급 (1개월)', '보통 (2-3개월)', '여유 (3개월 이상)'])
    .optional(),
});

function sanitizeInquiry(data) {
  // 1. 스키마 검증
  const validated = InquirySchema.parse(data);
  
  // 2. XSS 방지
  const sanitized = {
    ...validated,
    details: DOMPurify.sanitize(validated.details, { 
      ALLOWED_TAGS: [] // HTML 태그 모두 제거
    }),
    company_name: DOMPurify.sanitize(validated.company_name, { 
      ALLOWED_TAGS: [] 
    }),
  };
  
  // 3. 공백 정리
  return {
    ...sanitized,
    company_name: sanitized.company_name.trim(),
    contact_name: validated.contact_name.trim(),
  };
}
```

### 5. GDPR 및 개인정보보호법 준수

```javascript
// 1. 자동 데이터 삭제 정책 (90일)
async function scheduleDataDeletion() {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  await supabase
    .from('inquiries')
    .update({ 
      is_deleted: true, 
      deleted_at: new Date() 
    })
    .eq('status', 'completed')
    .lt('created_at', ninetyDaysAgo.toISOString());
}

// Cron job (예: Vercel Cron)
export async function GET(req) {
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  await scheduleDataDeletion();
  return new Response('Data deletion scheduled', { status: 200 });
}

// 2. 개인정보 다운로드 (GDPR 요청)
async function getUserData(email) {
  const { data } = await supabase
    .from('inquiries')
    .select('*')
    .eq('email', email)
    .neq('is_deleted', true);
  
  return JSON.stringify(data, null, 2);
}

// 3. 개인정보 완전 삭제
async function permanentlyDeleteUserData(email) {
  await supabase
    .from('inquiries')
    .delete()
    .eq('email', email);
  
  // 이메일 로그에서도 삭제
  await supabase
    .from('email_logs')
    .delete()
    .eq('recipient_email', email);
}

// 4. 감시 로그
async function logDataAccess(userId, inquiryId, action) {
  await supabase
    .from('audit_logs')
    .insert({
      user_id: userId,
      inquiry_id: inquiryId,
      action: action,
      timestamp: new Date().toISOString(),
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
    });
}
```

---

## Supabase 설정

### 1. 테이블 생성

```sql
-- 1. 메인 Inquiry 테이블
CREATE TABLE inquiries (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 기본 정보
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  
  -- 프로젝트 정보
  category TEXT NOT NULL CHECK (
    category IN ('웹개발', '앱개발', '디자인', '마케팅', '기타')
  ),
  details TEXT NOT NULL,
  budget INTEGER,
  timeline TEXT,
  
  -- 파일 업로드 (선택사항)
  file_urls JSONB, -- 여러 파일 URL 저장
  
  -- 상태 관리
  status TEXT DEFAULT 'pending' CHECK (
    status IN ('pending', 'assigned', 'quoted', 'completed', 'rejected')
  ),
  assigned_to UUID REFERENCES auth.users(id),
  internal_notes TEXT,
  
  -- 보안 및 감시
  ip_address INET,
  user_agent TEXT,
  referer TEXT,
  
  -- GDPR 준수
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- 인덱스를 위한 필드
  email_hash TEXT GENERATED ALWAYS AS (
    encode(digest(email, 'sha256'), 'hex')
  ) STORED,
  
  CONSTRAINT email_format CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- 인덱스
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_assigned_to ON inquiries(assigned_to);
CREATE INDEX idx_inquiries_email_hash ON inquiries(email_hash);
CREATE INDEX idx_inquiries_is_deleted ON inquiries(is_deleted);

-- 2. 이메일 로그 테이블
CREATE TABLE email_logs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  inquiry_id BIGINT REFERENCES inquiries(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  email_type TEXT NOT NULL CHECK (
    email_type IN ('confirmation', 'quote', 'followup', 'status_update')
  ),
  subject TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  resend_message_id TEXT, -- Resend API 응답
  status TEXT DEFAULT 'pending' CHECK (
    status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')
  ),
  error_message TEXT
);

CREATE INDEX idx_email_logs_inquiry_id ON email_logs(inquiry_id);
CREATE INDEX idx_email_logs_status ON email_logs(status);

-- 3. 감시 로그 테이블
CREATE TABLE audit_logs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  user_id UUID REFERENCES auth.users(id),
  inquiry_id BIGINT REFERENCES inquiries(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  
  ip_address INET,
  user_agent TEXT,
  details JSONB
);

CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_inquiry_id ON audit_logs(inquiry_id);

-- 4. Row Level Security (RLS) 정책
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 공개 조회 (읽기 불가 - 민감한 데이터)
CREATE POLICY "only_owner_can_read" ON inquiries
  FOR SELECT
  USING (
    auth.uid() = assigned_to OR
    auth.role() = 'admin'
  );

-- 관리자만 수정 가능
CREATE POLICY "only_admin_can_update" ON inquiries
  FOR UPDATE
  USING (auth.role() = 'admin')
  WITH CHECK (auth.role() = 'admin');

-- 삽입은 익명 사용자 가능 (서버 토큰 사용)
CREATE POLICY "allow_anon_insert" ON inquiries
  FOR INSERT
  WITH CHECK (true);
```

### 2. Supabase 프로젝트 설정

```bash
# 1. 프로젝트 생성
# https://app.supabase.com에서 새 프로젝트 생성

# 2. 환경 변수 설정
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATA_ENCRYPTION_KEY=your_32_byte_encryption_key

# 3. Storage 버킷 생성 (파일 업로드용)
# Supabase 대시보드 → Storage → New Bucket
# Bucket name: inquiry-attachments
# Public: true
# Allowed MIME types: pdf, docx, xlsx, images/*
```

### 3. 저장소 정책

```javascript
// 파일 업로드 - 크기 및 타입 제한
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/webp',
];

async function uploadInquiryFile(file, inquiryId) {
  // 1. 파일 크기 검증
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('파일 크기는 10MB를 초과할 수 없습니다.');
  }
  
  // 2. 파일 타입 검증
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('지원하지 않는 파일 형식입니다.');
  }
  
  // 3. 파일 이름 안전성 검증
  const sanitizedFileName = file.name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 255);
  
  const filePath = `${inquiryId}/${Date.now()}_${sanitizedFileName}`;
  
  // 4. Supabase Storage에 업로드
  const { data, error } = await supabase
    .storage
    .from('inquiry-attachments')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });
  
  if (error) {
    console.error('파일 업로드 실패:', error);
    throw error;
  }
  
  // 5. 공개 URL 생성
  const { data: { publicUrl } } = supabase
    .storage
    .from('inquiry-attachments')
    .getPublicUrl(filePath);
  
  return {
    fileName: sanitizedFileName,
    fileUrl: publicUrl,
    uploadedAt: new Date().toISOString(),
  };
}
```

---

## Resend 이메일 자동화

### 1. Resend 계정 설정

```bash
# 1. Resend 가입 및 API 키 발급
# https://resend.com에서 계정 생성

# 2. 환경 변수
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
SUPPORT_EMAIL=support@yourdomain.com

# 3. 도메인 검증 (SPF, DKIM)
# Resend 대시보드에서 도메인 추가 및 DNS 레코드 설정
```

### 2. 이메일 템플릿

```javascript
// 1. 확인 이메일 템플릿
function getConfirmationEmailTemplate(inquiry) {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>문의가 접수되었습니다! 🎉</h2>
        
        <p>안녕하세요 ${escapeHtml(inquiry.contact_name)}님,</p>
        
        <p>저희 웹사이트에 문의주셔서 감사합니다!</p>
        <p>귀하의 문의가 정상적으로 접수되었으며, 
           빠른 시간 내에 검토하여 연락드리겠습니다.</p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <h3>문의 요약:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; font-weight: bold; width: 30%;">회사명:</td>
            <td style="padding: 8px;">${escapeHtml(inquiry.company_name)}</td>
          </tr>
          <tr style="background-color: #f5f5f5;">
            <td style="padding: 8px; font-weight: bold;">카테고리:</td>
            <td style="padding: 8px;">${escapeHtml(inquiry.category)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">이메일:</td>
            <td style="padding: 8px;">${escapeHtml(inquiry.email)}</td>
          </tr>
          <tr style="background-color: #f5f5f5;">
            <td style="padding: 8px; font-weight: bold;">접수일:</td>
            <td style="padding: 8px;">${new Date(inquiry.created_at).toLocaleString('ko-KR')}</td>
          </tr>
        </table>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <p style="color: #666; font-size: 14px;">
          ※ 이 메일은 자동으로 발송되었습니다. 회신하지 마세요.
          <br>
          궁금한 점이 있으시면 ${SUPPORT_EMAIL}으로 연락주세요.
        </p>
        
        <footer style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px;">
          <p>© 2024 Your Company. All rights reserved.</p>
        </footer>
      </body>
    </html>
  `;
}

// 2. 견적서 이메일 템플릿
function getQuoteEmailTemplate(inquiry, quote) {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>프로젝트 견적서 📋</h2>
        
        <p>안녕하세요 ${escapeHtml(inquiry.contact_name)}님,</p>
        
        <p>귀하의 프로젝트에 대한 맞춤형 견적서를 준비했습니다.</p>
        
        <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">프로젝트 정보</h3>
          <p><strong>제목:</strong> ${escapeHtml(quote.projectTitle)}</p>
          <p><strong>예상 기간:</strong> ${escapeHtml(quote.timeline)}</p>
          <p><strong>예상 비용:</strong> <span style="font-size: 24px; color: #0066cc;">₩${Number(quote.estimatedCost).toLocaleString('ko-KR')}</span></p>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #0066cc; margin: 20px 0;">
          <h4>프로젝트 개요:</h4>
          <p>${escapeHtml(quote.description).replace(/\n/g, '<br>')}</p>
        </div>
        
        <h3>다음 단계:</h3>
        <ol>
          <li>이 견적서를 검토해주세요.</li>
          <li>추가 질문이나 수정사항이 있으면 회신해주세요.</li>
          <li>동의하시면 계약 진행 일정을 안내드립니다.</li>
        </ol>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${BASE_URL}/quote/${inquiry.id}?token=${generateSecureToken(inquiry.id)}" 
             style="display: inline-block; background-color: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px;">
            견적서 상세보기
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <p style="color: #666; font-size: 14px;">
          ※ 이 메일은 자동으로 발송되었습니다.
          <br>
          궁금한 점이 있으시면 ${SUPPORT_EMAIL}으로 연락주세요.
        </p>
      </body>
    </html>
  `;
}

// Helper: XSS 방지
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

// Helper: 안전한 토큰 생성
function generateSecureToken(inquiryId) {
  const tokenData = JSON.stringify({
    inquiryId,
    timestamp: Date.now(),
  });
  return Buffer.from(tokenData).toString('base64');
}
```

### 3. 이메일 발송 함수

```javascript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// 1. 확인 이메일 발송 (비동기)
async function sendConfirmationEmail(inquiry) {
  try {
    const emailLog = await supabase
      .from('email_logs')
      .insert({
        inquiry_id: inquiry.id,
        recipient_email: inquiry.email,
        email_type: 'confirmation',
        subject: '문의 접수 확인',
        status: 'pending',
      })
      .select()
      .single();
    
    // 백그라운드에서 발송 (await하지 않음)
    (async () => {
      try {
        const response = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL,
          to: inquiry.email,
          subject: '문의 접수 확인',
          html: getConfirmationEmailTemplate(inquiry),
          replyTo: process.env.SUPPORT_EMAIL,
          headers: {
            'X-Inquiry-ID': inquiry.id.toString(),
          },
        });
        
        // 이메일 로그 업데이트
        await supabase
          .from('email_logs')
          .update({
            sent_at: new Date().toISOString(),
            resend_message_id: response.id,
            status: 'sent',
          })
          .eq('id', emailLog.data.id);
        
      } catch (error) {
        console.error('확인 이메일 발송 실패:', error);
        
        await supabase
          .from('email_logs')
          .update({
            status: 'failed',
            error_message: error.message,
          })
          .eq('id', emailLog.data.id);
      }
    })();
    
    return true;
  } catch (error) {
    console.error('이메일 로그 생성 실패:', error);
    throw error;
  }
}

// 2. 견적서 이메일 발송 (수동)
async function sendQuoteEmail(inquiryId, quote, sentByUserId) {
  try {
    const { data: inquiry } = await supabase
      .from('inquiries')
      .select('*')
      .eq('id', inquiryId)
      .single();
    
    if (!inquiry) {
      throw new Error('Inquiry를 찾을 수 없습니다.');
    }
    
    // 감시 로그
    await logDataAccess(
      sentByUserId,
      inquiryId,
      'SEND_QUOTE_EMAIL'
    );
    
    // 이메일 로그 생성
    const emailLog = await supabase
      .from('email_logs')
      .insert({
        inquiry_id: inquiryId,
        recipient_email: inquiry.email,
        email_type: 'quote',
        subject: '프로젝트 견적서',
        status: 'pending',
      })
      .select()
      .single();
    
    // 이메일 발송
    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: inquiry.email,
      cc: [process.env.ADMIN_EMAIL],
      subject: `[견적서] ${inquiry.company_name} - ${new Date().toLocaleDateString('ko-KR')}`,
      html: getQuoteEmailTemplate(inquiry, quote),
      replyTo: process.env.SUPPORT_EMAIL,
      headers: {
        'X-Inquiry-ID': inquiryId.toString(),
        'X-Quote-ID': quote.id?.toString() || '',
      },
    });
    
    // 이메일 로그 업데이트
    await supabase
      .from('email_logs')
      .update({
        sent_at: new Date().toISOString(),
        resend_message_id: response.id,
        status: 'sent',
      })
      .eq('id', emailLog.data.id);
    
    // Inquiry 상태 업데이트
    await supabase
      .from('inquiries')
      .update({
        status: 'quoted',
      })
      .eq('id', inquiryId);
    
    return response;
  } catch (error) {
    console.error('견적서 이메일 발송 실패:', error);
    throw error;
  }
}

// 3. 웹훅 - Resend 이벤트 처리
// 1. https://resend.com/webhooks에서 웹훅 URL 설정
// 2. 이벤트: email.sent, email.delivered, email.bounced, email.complained
export async function POST(req) {
  const signature = req.headers.get('svix-signature');
  const timestamp = req.headers.get('svix-timestamp');
  const id = req.headers.get('svix-id');
  
  // Webhook 서명 검증
  const body = await req.text();
  const isValid = verifyWebhookSignature(signature, timestamp, id, body);
  
  if (!isValid) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const event = JSON.parse(body);
  
  // 이메일 상태 업데이트
  switch (event.type) {
    case 'email.delivered':
      await supabase
        .from('email_logs')
        .update({ status: 'delivered' })
        .eq('resend_message_id', event.data.id);
      break;
      
    case 'email.bounced':
      await supabase
        .from('email_logs')
        .update({
          status: 'bounced',
          error_message: event.data.reason || 'Unknown',
        })
        .eq('resend_message_id', event.data.id);
      break;
  }
  
  return new Response('OK', { status: 200 });
}
```

---

## 구현 코드

### Next.js 예제 (App Router)

```javascript
// app/api/inquiry/route.js
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

const InquirySchema = z.object({
  company_name: z.string().min(2).max(255),
  contact_name: z.string().min(2).max(100),
  email: z.string().email().toLowerCase(),
  phone: z.string().regex(/^[\d\-\+\s]{7,20}$/),
  category: z.enum(['웹개발', '앱개발', '디자인', '마케팅', '기타']),
  details: z.string().min(10).max(5000),
  budget: z.number().positive().optional(),
  timeline: z.enum(['긴급 (1개월)', '보통 (2-3개월)', '여유 (3개월 이상)']).optional(),
});

function sanitizeData(data) {
  const validated = InquirySchema.parse(data);
  return {
    ...validated,
    details: DOMPurify.sanitize(validated.details, { ALLOWED_TAGS: [] }),
    company_name: DOMPurify.sanitize(validated.company_name, { ALLOWED_TAGS: [] }),
  };
}

async function sendConfirmationEmail(inquiry) {
  const emailLog = await supabase
    .from('email_logs')
    .insert({
      inquiry_id: inquiry.id,
      recipient_email: inquiry.email,
      email_type: 'confirmation',
      subject: '문의 접수 확인',
      status: 'pending',
    })
    .select()
    .single();
  
  // 백그라운드에서 발송
  resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to: inquiry.email,
    subject: '문의 접수 확인',
    html: `
      <h2>문의가 접수되었습니다!</h2>
      <p>안녕하세요 ${inquiry.contact_name}님,</p>
      <p>귀하의 문의가 정상적으로 접수되었습니다.</p>
      <p>빠른 시간 내에 검토하여 연락드리겠습니다.</p>
    `,
  }).catch(error => {
    console.error('이메일 발송 실패:', error);
  });
}

export async function POST(req) {
  // HTTPS 체크
  if (req.headers.get('x-forwarded-proto') !== 'https') {
    return new Response('HTTPS required', { status: 400 });
  }
  
  try {
    const body = await req.json();
    
    // 1. 유효성 검사
    const cleanData = sanitizeData(body);
    
    // 2. 중복 체크 (30초 내)
    const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString();
    const { data: recent } = await supabase
      .from('inquiries')
      .select('id')
      .eq('email', cleanData.email)
      .gt('created_at', thirtySecondsAgo);
    
    if (recent && recent.length > 0) {
      return new Response(
        JSON.stringify({ error: '최근 문의가 있습니다. 잠시 후 다시 시도하세요.' }),
        { status: 429 }
      );
    }
    
    // 3. Supabase에 저장
    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .insert({
        ...cleanData,
        ip_address: req.headers.get('x-forwarded-for'),
        user_agent: req.headers.get('user-agent'),
        referer: req.headers.get('referer'),
      })
      .select()
      .single();
    
    if (error) {
      console.error('데이터베이스 저장 실패:', error);
      return new Response(
        JSON.stringify({ error: '문의 저장에 실패했습니다.' }),
        { status: 500 }
      );
    }
    
    // 4. 확인 이메일 발송 (비동기)
    await sendConfirmationEmail(inquiry);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: '문의가 정상적으로 접수되었습니다.',
        inquiryId: inquiry.id,
      }),
      { status: 201 }
    );
    
  } catch (error) {
    console.error('API 에러:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: '입력 데이터가 올바르지 않습니다.',
          details: error.errors,
        }),
        { status: 400 }
      );
    }
    
    return new Response(
      JSON.stringify({ error: '서버 오류가 발생했습니다.' }),
      { status: 500 }
    );
  }
}
```

### 클라이언트 컴포넌트 (React)

```javascript
// components/InquiryForm.jsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  company_name: z.string().min(2, '회사명은 필수입니다.'),
  contact_name: z.string().min(2, '이름은 필수입니다.'),
  email: z.string().email('유효한 이메일을 입력하세요.'),
  phone: z.string().regex(/^[\d\-\+\s]{7,20}$/, '유효한 전화번호를 입력하세요.'),
  category: z.enum(['웹개발', '앱개발', '디자인', '마케팅', '기타']),
  details: z.string().min(10, '세부사항은 최소 10자 이상입니다.'),
  budget: z.number().positive().optional(),
  timeline: z.enum(['긴급 (1개월)', '보통 (2-3개월)', '여유 (3개월 이상)']).optional(),
});

export default function InquiryForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  });
  
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitMessage('');
    
    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || '문의 저장 실패');
      }
      
      setSubmitMessage('✅ 문의가 접수되었습니다!');
      reset();
      
      // 5초 후 메시지 숨김
      setTimeout(() => setSubmitMessage(''), 5000);
      
    } catch (error) {
      setSubmitMessage(`❌ ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">프로젝트 문의</h2>
      
      {/* 회사명 */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">회사명 *</label>
        <input
          {...register('company_name')}
          type="text"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="회사명을 입력하세요."
        />
        {errors.company_name && (
          <p className="text-red-500 text-sm mt-1">{errors.company_name.message}</p>
        )}
      </div>
      
      {/* 담당자 이름 */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">담당자 이름 *</label>
        <input
          {...register('contact_name')}
          type="text"
          className="w-full px-4 py-2 border rounded-lg"
          placeholder="이름을 입력하세요."
        />
        {errors.contact_name && (
          <p className="text-red-500 text-sm mt-1">{errors.contact_name.message}</p>
        )}
      </div>
      
      {/* 이메일 */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">이메일 *</label>
        <input
          {...register('email')}
          type="email"
          className="w-full px-4 py-2 border rounded-lg"
          placeholder="example@company.com"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>
      
      {/* 전화번호 */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">전화번호 *</label>
        <input
          {...register('phone')}
          type="tel"
          className="w-full px-4 py-2 border rounded-lg"
          placeholder="010-1234-5678"
        />
        {errors.phone && (
          <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
        )}
      </div>
      
      {/* 카테고리 */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">서비스 카테고리 *</label>
        <select
          {...register('category')}
          className="w-full px-4 py-2 border rounded-lg"
        >
          <option value="">선택하세요.</option>
          <option value="웹개발">웹 개발</option>
          <option value="앱개발">앱 개발</option>
          <option value="디자인">디자인</option>
          <option value="마케팅">마케팅</option>
          <option value="기타">기타</option>
        </select>
        {errors.category && (
          <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
        )}
      </div>
      
      {/* 세부사항 */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">프로젝트 세부사항 *</label>
        <textarea
          {...register('details')}
          className="w-full px-4 py-2 border rounded-lg h-32"
          placeholder="프로젝트에 대해 설명해주세요."
        />
        {errors.details && (
          <p className="text-red-500 text-sm mt-1">{errors.details.message}</p>
        )}
      </div>
      
      {/* 예산 (선택) */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">예상 예산</label>
        <input
          {...register('budget', { valueAsNumber: true })}
          type="number"
          className="w-full px-4 py-2 border rounded-lg"
          placeholder="예상 예산을 입력하세요. (원)"
        />
        {errors.budget && (
          <p className="text-red-500 text-sm mt-1">{errors.budget.message}</p>
        )}
      </div>
      
      {/* 일정 (선택) */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">프로젝트 일정</label>
        <select
          {...register('timeline')}
          className="w-full px-4 py-2 border rounded-lg"
        >
          <option value="">선택하세요.</option>
          <option value="긴급 (1개월)">긴급 (1개월)</option>
          <option value="보통 (2-3개월)">보통 (2-3개월)</option>
          <option value="여유 (3개월 이상)">여유 (3개월 이상)</option>
        </select>
      </div>
      
      {/* 제출 버튼 */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? '전송 중...' : '문의하기'}
      </button>
      
      {/* 메시지 */}
      {submitMessage && (
        <div className="mt-4 p-4 rounded-lg bg-gray-100 text-center">
          {submitMessage}
        </div>
      )}
      
      {/* 개인정보 약관 */}
      <p className="text-xs text-gray-500 mt-4 text-center">
        문의 정보는 암호화되어 보관되며, 30일 후 자동 삭제됩니다.
        <a href="/privacy" className="text-blue-600 underline"> 개인정보처리방침</a>
      </p>
    </form>
  );
}
```

---

## 마이그레이션 및 운영

### 배포 체크리스트

```markdown
## 배포 전 준비사항

### 보안
- [ ] HTTPS 설정 완료
- [ ] 환경 변수 암호화 (.env.local은 .gitignore에 포함)
- [ ] CORS 설정 검토
- [ ] Rate limiting 활성화
- [ ] CSP (Content Security Policy) 헤더 설정

### Supabase
- [ ] PostgreSQL 데이터베이스 생성
- [ ] Row Level Security 정책 활성화
- [ ] 백업 설정 (자동 백업 활성화)
- [ ] 암호화 키 안전하게 보관
- [ ] Storage 버킷 공개/비공개 설정 확인

### Resend
- [ ] API 키 발급 및 환경 변수에 저장
- [ ] 도메인 인증 (SPF, DKIM, DMARC)
- [ ] 이메일 템플릿 테스트
- [ ] Webhook URL 등록

### 모니터링
- [ ] 에러 로깅 설정 (Sentry, LogRocket 등)
- [ ] 이메일 전송 모니터링
- [ ] 데이터베이스 성능 모니터링
- [ ] 일일 백업 확인

### 운영
- [ ] 개인정보 처리 정책 페이지 작성
- [ ] GDPR/개인정보보호법 준수 체크
- [ ] 관리자 대시보드 구축
- [ ] 고객 지원 프로세스 수립
```

### 모니터링 및 알림

```javascript
// lib/monitoring.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
  ],
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
});

// 이메일 발송 실패 알림
export async function notifyEmailFailure(error, inquiry) {
  Sentry.captureException(error, {
    tags: {
      service: 'email',
      inquiry_id: inquiry.id,
    },
    contexts: {
      inquiry: {
        email: inquiry.email,
        company_name: inquiry.company_name,
      },
    },
  });
}

// 데이터 저장 실패 알림
export async function notifyDatabaseError(error, data) {
  Sentry.captureException(error, {
    tags: {
      service: 'database',
    },
    contexts: {
      data: {
        email: data.email,
        company: data.company_name,
      },
    },
  });
}
```

---

## 비용 분석

### 월별 예상 비용 (100-1000 건 기준)

#### Supabase
- **프리 플랜**: ₩0 (프로덕션 환경에는 부적합)
- **Pro 플랜**: ₩90,000/월
  - 월 500GB 스토리지
  - 월 1M 요청
  - 자동 백업

#### Resend
- **프리 플랜**: ₩0 (월 100건까지)
- **이메일당**: ₩0.05 (100건 이상)
  - 월 1000건: ₩50
  - 월 10000건: ₩500

#### 기타
- **도메인**: ₩10,000-30,000/년
- **모니터링 (Sentry)**: ₩0-200,000/월 (프리 ~ Pro)
- **CDN (이미지 최적화)**: ₩0-50,000/월

### 비용 최적화 팁

```javascript
// 1. 이메일 배치 처리
async function sendBatchEmails(inquiries) {
  // 한 번에 최대 50개씩 발송
  const batchSize = 50;
  for (let i = 0; i < inquiries.length; i += batchSize) {
    const batch = inquiries.slice(i, i + batchSize);
    await Promise.all(
      batch.map(inquiry => sendConfirmationEmail(inquiry))
    );
    // API 레이트 제한 회피
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// 2. 불필요한 데이터 정제
async function cleanupOldData() {
  // 90일 이상 된 완료된 inquiry 삭제
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  const { data } = await supabase
    .from('inquiries')
    .delete()
    .lt('created_at', ninetyDaysAgo.toISOString())
    .eq('status', 'completed');
}

// 3. 이메일 템플릿 캐싱
const emailTemplateCache = new Map();

function getTemplate(name) {
  if (!emailTemplateCache.has(name)) {
    emailTemplateCache.set(name, loadTemplate(name));
  }
  return emailTemplateCache.get(name);
}
```

---

## 체크리스트 및 다음 단계

### Phase 1: 설정 (1-2주)
- [ ] Supabase 프로젝트 생성 및 테이블 구성
- [ ] Resend 계정 생성 및 도메인 인증
- [ ] 환경 변수 설정
- [ ] 로컬 개발 환경 테스트

### Phase 2: 개발 (2-3주)
- [ ] API 엔드포인트 구현
- [ ] 클라이언트 폼 구현
- [ ] 이메일 템플릿 디자인
- [ ] 테스트 (단위 테스트, 통합 테스트)

### Phase 3: 보안 & 운영 (1-2주)
- [ ] 보안 감시 (OWASP Top 10)
- [ ] 성능 최적화
- [ ] 모니터링 설정
- [ ] 백업 및 복구 프로세스

### Phase 4: 배포 (1주)
- [ ] 스테이징 환경 배포 및 테스트
- [ ] 관리자 대시보드 구축
- [ ] 고객 지원 프로세스 문서화
- [ ] 본 배포

---

## 참고 자료

- **Supabase 문서**: https://supabase.com/docs
- **Resend 문서**: https://resend.com/docs
- **OWASP 가이드**: https://owasp.org/
- **개인정보보호법**: https://www.pipc.go.kr/
- **PostgreSQL pgcrypto**: https://www.postgresql.org/docs/current/pgcrypto.html
