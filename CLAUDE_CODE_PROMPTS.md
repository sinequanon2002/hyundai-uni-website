# Claude Code 실행 프롬프트 - Week 1-4 완벽 가이드

## 📌 사용 방법

각 프롬프트를 Claude Code(터미널)에 복사-붙여넣기하면 자동으로 파일이 생성됩니다.

---

## 🟠 WEEK 1: 기초 설정 (환경 구성 & DB 스키마)

### Week 1-Day 1: 프로젝트 생성 및 패키지 설치

```bash
# Claude Code 터미널에 복사-붙여넣기
npm create next-app@latest inquiry-system --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" && cd inquiry-system && npm install @supabase/supabase-js resend zod react-hook-form @hookform/resolvers isomorphic-dompurify sharp bytes && npm install -D @types/node typescript
```

### Week 1-Day 2: 환경 변수 파일 생성

다음 프롬프트를 Claude Code에 입력:

```
다음 내용으로 .env.local 파일을 프로젝트 루트에 생성해줘:

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATA_ENCRYPTION_KEY=your_32_byte_hex_key

RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
SUPPORT_EMAIL=support@yourdomain.com

NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_ALLOWED_FILE_TYPES=pdf,docx,xlsx,jpg,png

SUPABASE_BUCKET_NAME=inquiry-attachments
```

**응답:**
Claude가 `.env.local` 파일을 생성할 것입니다.

---

### Week 1-Day 3: 기본 라이브러리 설정 파일 생성

**프롬프트:**

```
app/lib 디렉토리를 만들고, 다음 파일들을 생성해줘:

1. lib/supabase.ts - Supabase 클라이언트 설정
2. lib/validation.ts - Zod 스키마 정의
3. lib/encryption.ts - 암호화/복호화 함수

각 파일의 내용:

=== lib/supabase.ts ===
import { createClient } from '@supabase/supabase-js';

let supabaseInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        db: {
          schema: 'public',
        },
        auth: {
          persistSession: false,
        },
      }
    );
  }
  return supabaseInstance;
}

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

=== lib/validation.ts ===
import { z } from 'zod';

export const InquirySchema = z.object({
  company_name: z
    .string()
    .min(2, '회사명은 최소 2자 이상')
    .max(255),
  contact_name: z
    .string()
    .min(2, '이름은 최소 2자 이상')
    .max(100),
  email: z
    .string()
    .email('유효한 이메일 주소')
    .toLowerCase(),
  phone: z
    .string()
    .regex(/^[\d\-\+\s()]{7,20}$/, '유효한 전화번호'),
  category: z.enum(['웹개발', '앱개발', '디자인', '마케팅', '기타']),
  details: z
    .string()
    .min(10, '세부사항은 최소 10자 이상')
    .max(5000),
  budget: z.number().min(0).optional(),
  timeline: z.enum([
    '긴급 (1개월)',
    '보통 (2-3개월)',
    '여유 (3개월 이상)',
  ]).optional(),
  file_ids: z.array(z.string()).optional(),
  file_metadata: z.array(z.object({
    originalName: z.string(),
    sanitizedName: z.string(),
    mimeType: z.string(),
    size: z.number(),
    extension: z.string(),
    uploadedAt: z.string(),
  })).optional(),
  total_file_size: z.number().default(0),
});

export type InquiryFormData = z.infer<typeof InquirySchema>;

=== lib/encryption.ts ===
import crypto from 'crypto';

const ENCRYPTION_KEY = Buffer.from(process.env.DATA_ENCRYPTION_KEY || '', 'hex');

export function encryptField(plaintext: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptField(encrypted: string): string {
  const [iv, authTag, encryptedData] = encrypted.split(':');
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    ENCRYPTION_KEY,
    Buffer.from(iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

응답하면 3개 파일이 모두 생성됩니다.
```

---

### Week 1-Day 4: 파일 처리 유틸리티 생성

**프롬프트:**

```
app/lib/file-handler.ts 파일을 생성해줘. 다음 내용으로:

import { NextRequest } from 'next/server';
import sharp from 'sharp';

export const FILE_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  MAX_FILES: 5,
  MAX_TOTAL_SIZE: 50 * 1024 * 1024,
  ALLOWED_MIME_TYPES: {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    jpg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  },
  ALLOWED_EXTENSIONS: ['pdf', 'docx', 'xlsx', 'jpg', 'jpeg', 'png', 'webp'],
};

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > FILE_CONFIG.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `파일 크기는 10MB를 초과할 수 없습니다.`,
    };
  }

  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !FILE_CONFIG.ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `지원하지 않는 파일 형식입니다.`,
    };
  }

  return { valid: true };
}

export function validateFiles(files: File[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (files.length > FILE_CONFIG.MAX_FILES) {
    errors.push(`최대 ${FILE_CONFIG.MAX_FILES}개 파일만 업로드 가능합니다.`);
    return { valid: false, errors };
  }

  for (const file of files) {
    const validation = validateFile(file);
    if (!validation.valid) {
      errors.push(`${file.name}: ${validation.error}`);
    }
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > FILE_CONFIG.MAX_TOTAL_SIZE) {
    errors.push(`전체 파일 크기가 50MB를 초과했습니다.`);
  }

  return { valid: errors.length === 0, errors };
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 255);
}

export async function optimizeImage(buffer: Buffer, mimeType: string): Promise<Buffer> {
  if (!mimeType.startsWith('image/')) {
    return buffer;
  }

  try {
    return await sharp(buffer)
      .resize(2048, 2048, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();
  } catch (error) {
    console.error('이미지 최적화 실패:', error);
    return buffer;
  }
}

export function extractFileMetadata(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  return {
    originalName: file.name,
    sanitizedName: sanitizeFileName(file.name),
    mimeType: file.type,
    size: file.size,
    extension,
    uploadedAt: new Date().toISOString(),
  };
}

export async function extractFilesFromFormData(formData: FormData): Promise<File[]> {
  const files: File[] = [];
  for (const [key, value] of formData.entries()) {
    if (key === 'files' && value instanceof File) {
      files.push(value);
    }
  }
  return files;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
```
```

---

### Week 1-Day 5: 테스트 및 확인

**프롬프트:**

```
다음을 확인해줘:

1. npm run dev 실행했을 때 http://localhost:3000에 접속 가능한지
2. .env.local 파일이 생성되었는지
3. app/lib 디렉토리에 다음 파일들이 있는지:
   - supabase.ts
   - validation.ts
   - encryption.ts
   - file-handler.ts

이 모든 파일이 있으면 "Week 1 완료!" 라고 말해줘.
```

---

## 🟡 WEEK 2: 핵심 구현 (파일 업로드 & API)

### Week 2-Day 1: Resend 이메일 설정 파일

**프롬프트:**

```
app/lib/resend.ts 파일을 생성해줘. 다음 내용으로:

import { Resend } from 'resend';
import { getSupabaseClient } from './supabase';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendConfirmationEmail(inquiry: any) {
  try {
    const supabase = getSupabaseClient();

    const { data: emailLog } = await supabase
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

    resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'test@resend.dev',
      to: inquiry.email,
      subject: '문의 접수 확인',
      html: `
        <h2>문의가 접수되었습니다!</h2>
        <p>안녕하세요 ${inquiry.contact_name}님,</p>
        <p>귀하의 문의가 정상적으로 접수되었습니다.</p>
        <p>빠른 시간 내에 검토하여 연락드리겠습니다.</p>
        <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px;">
          이 메일은 자동으로 발송되었습니다.
        </p>
      `,
    }).catch((error) => {
      console.error('이메일 발송 실패:', error);
    });

    return true;
  } catch (error) {
    console.error('이메일 설정 실패:', error);
    throw error;
  }
}

export async function sendAdminNotification(inquiry: any) {
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'test@resend.dev',
      to: process.env.ADMIN_EMAIL!,
      subject: `[새 문의] ${inquiry.company_name} - ${inquiry.category}`,
      html: `
        <h3>새로운 문의가 접수되었습니다.</h3>
        <p><strong>회사:</strong> ${inquiry.company_name}</p>
        <p><strong>담당자:</strong> ${inquiry.contact_name}</p>
        <p><strong>이메일:</strong> ${inquiry.email}</p>
        <p><strong>전화:</strong> ${inquiry.phone}</p>
        <p><strong>카테고리:</strong> ${inquiry.category}</p>
        <p><strong>파일:</strong> ${inquiry.file_ids?.length || 0}개</p>
      `,
    });
  } catch (error) {
    console.error('관리자 알림 실패:', error);
  }
}
```
```

---

### Week 2-Day 2: 파일 업로드 API 엔드포인트

**프롬프트:**

```
app/api/inquiry/upload/route.ts 파일을 생성해줘. 다음 내용으로:

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import {
  FILE_CONFIG,
  validateFiles,
  extractFilesFromFormData,
  sanitizeFileName,
  optimizeImage,
  extractFileMetadata,
} from '@/lib/file-handler';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = await extractFilesFromFormData(formData);

    const validation = validateFiles(Array.from(files));
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    const uploadedFiles = [];
    const totalSize = Array.from(files).reduce((sum, f) => sum + f.size, 0);

    for (const file of files) {
      try {
        const buffer = await file.arrayBuffer();
        let fileBuffer = Buffer.from(buffer);

        if (file.type.startsWith('image/')) {
          fileBuffer = await optimizeImage(fileBuffer, file.type);
        }

        const sanitized = sanitizeFileName(file.name);
        const timestamp = Date.now();
        const uniqueName = `${timestamp}_${sanitized}`;
        const filePath = `inquiry-files/${uniqueName}`;

        const { data, error } = await supabase.storage
          .from('inquiry-attachments')
          .upload(filePath, fileBuffer, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false,
          });

        if (error) throw error;

        const { data: signedUrlData } = await supabase.storage
          .from('inquiry-attachments')
          .createSignedUrl(filePath, 7 * 24 * 60 * 60);

        const metadata = extractFileMetadata(file);

        uploadedFiles.push({
          fileId: data.path,
          fileName: sanitized,
          fileSize: fileBuffer.length,
          mimeType: file.type,
          uploadedAt: new Date().toISOString(),
          downloadUrl: signedUrlData?.signedUrl || null,
          metadata,
        });
      } catch (error) {
        console.error(`파일 업로드 실패 (${file.name}):`, error);
        return NextResponse.json(
          { error: `파일 업로드 실패: ${file.name}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        files: uploadedFiles,
        totalSize,
        message: `${uploadedFiles.length}개 파일이 성공적으로 업로드되었습니다.`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('파일 업로드 API 에러:', error);
    return NextResponse.json(
      { error: '파일 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
```
```

---

### Week 2-Day 3: 문의 제출 API 엔드포인트

**프롬프트:**

```
app/api/inquiry/route.ts 파일을 생성해줘. 다음 내용으로:

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import DOMPurify from 'isomorphic-dompurify';
import { InquirySchema } from '@/lib/validation';
import { sendConfirmationEmail, sendAdminNotification } from '@/lib/resend';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = InquirySchema.parse(body);

    const sanitized = {
      ...data,
      details: DOMPurify.sanitize(data.details, { ALLOWED_TAGS: [] }),
      company_name: DOMPurify.sanitize(data.company_name, { ALLOWED_TAGS: [] }),
    };

    const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString();
    const { data: recent } = await supabase
      .from('inquiries')
      .select('id')
      .eq('email', sanitized.email)
      .gt('created_at', thirtySecondsAgo);

    if (recent && recent.length > 0) {
      return NextResponse.json(
        { error: '최근 문의가 있습니다. 잠시 후 다시 시도하세요.' },
        { status: 429 }
      );
    }

    const { data: inquiry, error: dbError } = await supabase
      .from('inquiries')
      .insert({
        company_name: sanitized.company_name,
        contact_name: sanitized.contact_name,
        email: sanitized.email,
        phone: sanitized.phone,
        category: sanitized.category,
        details: sanitized.details,
        budget: sanitized.budget || null,
        timeline: sanitized.timeline || null,
        file_ids: sanitized.file_ids || [],
        file_metadata: sanitized.file_metadata || [],
        total_file_size: sanitized.total_file_size || 0,
        status: 'pending',
        ip_address: req.headers.get('x-forwarded-for'),
        user_agent: req.headers.get('user-agent'),
        referer: req.headers.get('referer'),
      })
      .select()
      .single();

    if (dbError) {
      console.error('DB 저장 실패:', dbError);
      throw new Error('Failed to save inquiry');
    }

    await sendConfirmationEmail(inquiry);
    await sendAdminNotification(inquiry);

    return NextResponse.json(
      {
        success: true,
        message: '문의가 정상적으로 접수되었습니다.',
        inquiryId: inquiry.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('API 에러:', error);
    return NextResponse.json(
      { error: '요청 처리에 실패했습니다.' },
      { status: 500 }
    );
  }
}
```
```

---

### Week 2-Day 4: 파일 업로드 컴포넌트

**프롬프트:**

```
app/components/FileUploadField.tsx 파일을 생성해줘. 다음 내용으로:

'use client';

import { useState, useRef } from 'react';
import { formatFileSize } from '@/lib/file-handler';

interface FileUploadFieldProps {
  onFilesSelected: (files: File[], fileInfo: any[]) => void;
  maxFiles?: number;
  maxFileSize?: number;
  allowedTypes?: string[];
  disabled?: boolean;
}

export default function FileUploadField({
  onFilesSelected,
  maxFiles = 5,
  maxFileSize = 10 * 1024 * 1024,
  allowedTypes = ['pdf', 'docx', 'xlsx', 'jpg', 'png'],
  disabled = false,
}: FileUploadFieldProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: File[]) => {
    const errors: string[] = [];

    if (files.length + selectedFiles.length > maxFiles) {
      errors.push(`최대 ${maxFiles}개 파일만 추가 가능합니다.`);
    }

    const newFiles = [];
    for (const file of files) {
      if (file.size > maxFileSize) {
        errors.push(
          `${file.name}: ${formatFileSize(file.size)} (최대: ${formatFileSize(maxFileSize)})`
        );
        continue;
      }

      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      if (!allowedTypes.includes(extension)) {
        errors.push(
          `${file.name}: 지원하지 않는 형식 (허용: ${allowedTypes.join(', ')})`
        );
        continue;
      }

      newFiles.push(file);
    }

    if (newFiles.length > 0) {
      const updated = [...selectedFiles, ...newFiles];
      setSelectedFiles(updated);
      setErrors(errors);
      onFilesSelected(newFiles, updated.map((f) => ({
        name: f.name,
        size: f.size,
      })));
    } else {
      setErrors(errors);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const removeFile = (index: number) => {
    const updated = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updated);
    onFilesSelected([], updated);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleChange}
          disabled={disabled}
          accept={allowedTypes.map((t) => `.${t}`).join(',')}
          className="hidden"
        />

        <div className="text-gray-600">
          <p className="font-semibold mb-1">파일을 끌어놓거나 클릭하세요</p>
          <p className="text-sm text-gray-500">
            최대 {maxFiles}개, {formatFileSize(maxFileSize)}까지
          </p>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <ul className="text-red-700 text-sm space-y-1">
            {errors.map((error, i) => (
              <li key={i}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="font-medium text-sm text-gray-700">
            선택된 파일 ({selectedFiles.length}/{maxFiles})
          </p>
          <div className="space-y-2">
            {selectedFiles.map((file, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-white border rounded-lg p-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={() => removeFile(i)}
                  type="button"
                  className="ml-2 text-red-600 hover:text-red-700 text-sm"
                >
                  제거
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```
```

---

### Week 2-Day 5: 메인 폼 컴포넌트

**프롬프트:**

```
app/components/InquiryForm.tsx 파일을 생성해줘. 다음 내용으로:

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FileUploadField from './FileUploadField';
import { InquirySchema, type InquiryFormData } from '@/lib/validation';

export default function InquiryForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InquiryFormData>({
    resolver: zodResolver(InquirySchema),
  });

  const onSubmit = async (data: InquiryFormData) => {
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      let fileIds: string[] = [];
      let fileMetadata = [];

      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((file) => {
          formData.append('files', file);
        });

        const uploadResponse = await fetch('/api/inquiry/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json();
          throw new Error(error.error || '파일 업로드 실패');
        }

        const uploadData = await uploadResponse.json();
        fileIds = uploadData.files.map((f: any) => f.fileId);
        fileMetadata = uploadData.files.map((f: any) => f.metadata);
      }

      const totalFileSize = selectedFiles.reduce((sum, f) => sum + f.size, 0);

      const inquiryData = {
        ...data,
        file_ids: fileIds,
        file_metadata: fileMetadata,
        total_file_size: totalFileSize,
      };

      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inquiryData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '문의 저장 실패');
      }

      setSubmitMessage('✅ 문의가 성공적으로 접수되었습니다!');
      reset();
      setSelectedFiles([]);

      setTimeout(() => setSubmitMessage(''), 5000);
    } catch (error) {
      setSubmitMessage(
        `❌ ${error instanceof Error ? error.message : '오류 발생'}`
      );
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
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="회사명을 입력하세요"
        />
        {errors.company_name && (
          <p className="text-red-500 text-sm mt-1">
            {errors.company_name.message}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">담당자 이름 *</label>
        <input
          {...register('contact_name')}
          type="text"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.contact_name && (
          <p className="text-red-500 text-sm mt-1">
            {errors.contact_name.message}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">이메일 *</label>
        <input
          {...register('email')}
          type="email"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="example@company.com"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">전화번호 *</label>
        <input
          {...register('phone')}
          type="tel"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="010-1234-5678"
        />
        {errors.phone && (
          <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">카테고리 *</label>
        <select
          {...register('category')}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">선택하세요</option>
          <option value="웹개발">웹 개발</option>
          <option value="앱개발">앱 개발</option>
          <option value="디자인">디자인</option>
          <option value="마케팅">마케팅</option>
          <option value="기타">기타</option>
        </select>
        {errors.category && (
          <p className="text-red-500 text-sm mt-1">
            {errors.category.message}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          프로젝트 세부사항 *
        </label>
        <textarea
          {...register('details')}
          className="w-full px-4 py-2 border rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="프로젝트에 대해 설명해주세요"
        />
        {errors.details && (
          <p className="text-red-500 text-sm mt-1">{errors.details.message}</p>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-3">
          파일 업로드 (선택사항)
        </label>
        <FileUploadField
          onFilesSelected={(files) => setSelectedFiles(files)}
          maxFiles={5}
          maxFileSize={10 * 1024 * 1024}
          allowedTypes={['pdf', 'docx', 'xlsx', 'jpg', 'png', 'webp']}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">예상 예산</label>
          <input
            {...register('budget', { valueAsNumber: true })}
            type="number"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="예산 (원)"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            프로젝트 일정
          </label>
          <select
            {...register('timeline')}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">선택하세요</option>
            <option value="긴급 (1개월)">긴급 (1개월)</option>
            <option value="보통 (2-3개월)">보통 (2-3개월)</option>
            <option value="여유 (3개월 이상)">여유 (3개월 이상)</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? '제출 중...' : '문의하기'}
      </button>

      {submitMessage && (
        <div className="mt-4 p-4 rounded-lg bg-gray-100 text-center">
          {submitMessage}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        문의 정보는 암호화되어 보관되며, 30일 후 자동 삭제됩니다.
      </p>
    </form>
  );
}
```
```

---

### Week 2-Day 6: 메인 페이지 업데이트

**프롬프트:**

```
app/page.tsx 파일을 다음 내용으로 바꿔줘:

import InquiryForm from '@/components/InquiryForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <InquiryForm />
    </main>
  );
}
```
```

---

### Week 2-Day 7: 로컬 테스트

**프롬프트:**

```
이제 npm run dev 를 실행해서 http://localhost:3000 에서 다음을 확인해줘:

1. 폼이 정상적으로 렌더링되는지
2. 파일 업로드 영역이 보이는지
3. 각 필드에 입력할 수 있는지
4. 파일을 드래그 앤 드롭할 수 있는지

모두 정상이면 "Week 2 완료!" 라고 말해줘.

만약 에러가 있으면 에러 메시지를 복사해서 알려줘.
```

---

## 🟢 WEEK 3: 최적화 & 보안

### Week 3-Day 1: 데이터베이스 인덱스 생성

**프롬프트:**

```
Supabase의 SQL Editor에서 다음을 실행해줘:

-- inquiries 테이블에 파일 관련 컬럼 추가
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS (
  file_ids JSONB,
  file_metadata JSONB,
  total_file_size INTEGER DEFAULT 0
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_email ON inquiries(email);
CREATE INDEX IF NOT EXISTS idx_inquiries_file_count ON inquiries((JSONB_ARRAY_LENGTH(file_ids)));

-- email_logs 테이블 생성
CREATE TABLE IF NOT EXISTS email_logs (
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

CREATE INDEX IF NOT EXISTS idx_email_logs_inquiry_id ON email_logs(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
```

실행 후 "Supabase SQL 실행 완료!" 라고 말해줘.
```

---

### Week 3-Day 2: 성능 모니터링 파일 생성

**프롬프트:**

```
app/lib/performance-monitor.ts 파일을 생성해줘:

import { getSupabaseClient } from './supabase';

export async function getStorageUsage() {
  const supabase = getSupabaseClient();

  const { data: inquiries } = await supabase
    .from('inquiries')
    .select('total_file_size, file_ids');

  let totalSize = 0;
  let totalFiles = 0;

  for (const inquiry of inquiries || []) {
    totalSize += inquiry.total_file_size || 0;
    totalFiles += inquiry.file_ids?.length || 0;
  }

  return {
    totalSize,
    totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
    totalFiles,
    averageFileSize: totalFiles > 0 ? totalSize / totalFiles : 0,
  };
}

export async function estimateMonthlyCost() {
  const supabase = getSupabaseClient();

  const thisMonthStart = new Date();
  thisMonthStart.setDate(1);

  const { count: emailCount } = await supabase
    .from('email_logs')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', thisMonthStart.toISOString());

  const emailCost = (emailCount || 0) * 0.05;
  const storageCost = 25;

  return {
    emails: emailCount,
    emailCost: emailCost.toFixed(2),
    storageCost: storageCost.toFixed(2),
    totalEstimate: (emailCost + storageCost).toFixed(2),
  };
}
```
```

---

### Week 3-Day 3: 환경 변수 보안 강화

**프롬프트:**

```
.gitignore 파일을 다음 내용으로 업데이트해줘:

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env.local
.env.*.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
```
```

---

### Week 3-Day 4: 보안 헤더 설정

**프롬프트:**

```
app/layout.tsx 파일의 메타데이터 부분을 다음처럼 업데이트해줘:

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "프로젝트 문의 시스템",
  description: "프로젝트 문의 및 파일 업로드 서비스",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
```
```

---

### Week 3-Day 5: Rate Limiting 미들웨어

**프롬프트:**

```
app/middleware.ts 파일을 생성해줘:

import { NextRequest, NextResponse } from 'next/server';

const rateLimit = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/inquiry')) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const limit = rateLimit.get(ip);

    if (limit && now < limit.resetTime) {
      if (limit.count > 10) {
        return NextResponse.json(
          { error: '너무 많은 요청입니다. 나중에 다시 시도하세요.' },
          { status: 429 }
        );
      }
      limit.count++;
    } else {
      rateLimit.set(ip, { count: 1, resetTime: now + 15 * 60 * 1000 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
```
```

---

### Week 3-Day 6: 관리자 대시보드 (선택)

**프롬프트:**

```
app/admin/inquiries/page.tsx 파일을 생성해줘:

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface Inquiry {
  id: number;
  created_at: string;
  company_name: string;
  contact_name: string;
  email: string;
  category: string;
  status: string;
  file_ids: string[];
  total_file_size: number;
}

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchInquiries = async () => {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('조회 실패:', error);
      } else {
        setInquiries(data || []);
      }
      setLoading(false);
    };

    fetchInquiries();
  }, []);

  if (loading) return <div className="p-6">로딩 중...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">문의 관리</h1>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-3 text-left">날짜</th>
              <th className="border p-3 text-left">회사명</th>
              <th className="border p-3 text-left">담당자</th>
              <th className="border p-3 text-left">카테고리</th>
              <th className="border p-3 text-left">파일</th>
              <th className="border p-3 text-left">상태</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inquiry) => (
              <tr key={inquiry.id} className="hover:bg-gray-50">
                <td className="border p-3">
                  {new Date(inquiry.created_at).toLocaleDateString('ko-KR')}
                </td>
                <td className="border p-3 font-medium">
                  {inquiry.company_name}
                </td>
                <td className="border p-3">{inquiry.contact_name}</td>
                <td className="border p-3">{inquiry.category}</td>
                <td className="border p-3">
                  {inquiry.file_ids?.length > 0 ? (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {inquiry.file_ids.length}개
                    </span>
                  ) : (
                    <span className="text-gray-400">없음</span>
                  )}
                </td>
                <td className="border p-3">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      inquiry.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {inquiry.status === 'pending' ? '대기' : '처리'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-gray-600">
        총 {inquiries.length}개의 문의
      </p>
    </div>
  );
}
```
```

---

### Week 3-Day 7: 테스트 및 최적화 확인

**프롬프트:**

```
다음을 확인해줘:

1. npm run dev 로 서버 시작
2. http://localhost:3000 에서 폼이 정상 작동하는지
3. 파일을 업로드하면 크기가 줄어드는지 확인 (이미지 최적화)
4. 문의 제출 후 Supabase에서 파일_ids가 저장되었는지 확인
5. /admin/inquiries 에서 대시보드가 보이는지 확인

모두 정상이면 "Week 3 완료!" 라고 말해줘.
```

---

## 🔵 WEEK 4: 배포 준비

### Week 4-Day 1: vercel.json 설정

**프롬프트:**

```
프로젝트 루트에 vercel.json 파일을 생성해줘:

{
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "env": {
    "SUPABASE_URL": "@supabase_url",
    "SUPABASE_ANON_KEY": "@supabase_anon_key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase_service_role_key",
    "DATA_ENCRYPTION_KEY": "@data_encryption_key",
    "RESEND_API_KEY": "@resend_api_key",
    "RESEND_FROM_EMAIL": "@resend_from_email",
    "ADMIN_EMAIL": "@admin_email",
    "SUPPORT_EMAIL": "@support_email"
  },
  "functions": {
    "app/api/**": {
      "maxDuration": 30
    }
  }
}
```
```

---

### Week 4-Day 2: next.config.js 최적화

**프롬프트:**

```
next.config.js 파일을 생성해줘:

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
      ],
    },
  ],
};

module.exports = nextConfig;
```
```

---

### Week 4-Day 3: 빌드 테스트

**프롬프트:**

```
터미널에서 다음을 실행해줘:

npm run build

그리고 다음을 확인해줘:

1. "Successfully created Next.js production build" 메시지 나오는지
2. .next 폴더가 생성되었는지
3. 에러가 없는지

빌드 성공하면 "빌드 성공!" 이라고 말해줘.
```

---

### Week 4-Day 4: GitHub 저장소 준비

**프롬프트:**

```
다음을 진행해줘:

1. 프로젝트 루트에서 `git init` 실행
2. `git config user.name "Your Name"` 실행
3. `git config user.email "your@email.com"` 실행
4. `.gitignore` 파일 확인 (node_modules, .env.local 포함 여부)
5. `git add .` 실행
6. `git commit -m "Initial commit: Inquiry system with file upload"` 실행

모두 완료하면 "Git 저장소 준비 완료!" 이라고 말해줘.
```

---

### Week 4-Day 5: Vercel 배포

**프롬프트:**

```
Vercel에 배포하기 위해 다음을 해줘:

1. vercel.com 에 가입 (GitHub 계정으로)
2. Dashboard → Add New → Project
3. GitHub 저장소 선택
4. Environment Variables 설정:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - DATA_ENCRYPTION_KEY
   - RESEND_API_KEY
   - RESEND_FROM_EMAIL
   - ADMIN_EMAIL
   - SUPPORT_EMAIL
5. Deploy 클릭
6. 배포 완료 대기 (보통 3-5분)

배포 완료 후 "Vercel 배포 완료!" 라고 말해주고, 제공된 URL을 알려줘.
```

---

### Week 4-Day 6: 프로덕션 테스트

**프롬프트:**

```
Vercel에 배포된 사이트에서 다음을 테스트해줘:

1. 폼이 정상적으로 렌더링되는지
2. 파일 업로드가 가능한지
3. 문의 제출 후 이메일이 수신되었는지
4. Supabase에 데이터가 저장되었는지
5. /admin/inquiries 에서 대시보드가 보이는지

모두 정상이면 "프로덕션 테스트 완료!" 라고 말해줘.

만약 이메일이 안 온다면, Resend의 이메일이 test@resend.dev 인지 확인해줘.
```

---

### Week 4-Day 7: 최종 확인 및 운영 시작

**프롬프트:**

```
최종 배포 체크리스트를 확인해줘:

배포 전 확인:
- [ ] HTTPS 설정됨 (Vercel 자동)
- [ ] 환경 변수 모두 설정됨
- [ ] .env.local 파일이 git 커밋되지 않았는지 확인
- [ ] 빌드 에러 없음

배포 후 확인:
- [ ] 프로덕션 URL에서 폼 작동
- [ ] 파일 업로드 가능
- [ ] 이메일 발송됨
- [ ] Supabase에 데이터 저장됨
- [ ] 에러 로그 없음

모두 완료하면 "🎉 프로젝트 배포 완료! 운영 시작!" 이라고 말해줘.
```

---

## 📊 추가 프롬프트 (필요시 사용)

### 에러 발생 시

```
다음 에러가 발생했을 때:

[에러 메시지를 여기에 붙여넣기]

원인을 분석하고 해결 방법을 제시해줘.
```

---

### 추가 기능 구현

```
다음 기능을 추가해줘:

[필요한 기능 설명]

현재 구조에 맞게 구현해줘.
```

---

### 성능 최적화 확인

```
다음을 확인하고 최적화해줘:

1. API 응답 시간
2. 파일 업로드 속도
3. 이미지 압축 효율성
4. 데이터베이스 쿼리 성능

각각에 대한 개선 사항을 제안해줘.
```

---

## ✅ 최종 체크리스트

각 주마다 다음을 확인하세요:

### Week 1 체크리스트
- [ ] npm create next-app 실행 완료
- [ ] 패키지 설치 완료
- [ ] .env.local 파일 생성 완료
- [ ] 라이브러리 파일들 생성 완료
- [ ] 파일 처리 유틸리티 완료

### Week 2 체크리스트
- [ ] API 엔드포인트 생성 완료
- [ ] 파일 업로드 컴포넌트 완료
- [ ] 폼 컴포넌트 완료
- [ ] 로컬 테스트 완료
- [ ] Supabase에 데이터 저장 확인

### Week 3 체크리스트
- [ ] 데이터베이스 인덱스 생성 완료
- [ ] 성능 모니터링 파일 생성 완료
- [ ] 보안 헤더 설정 완료
- [ ] Rate limiting 설정 완료
- [ ] 관리자 대시보드 생성 완료

### Week 4 체크리스트
- [ ] vercel.json 생성 완료
- [ ] next.config.js 최적화 완료
- [ ] 빌드 테스트 완료
- [ ] Vercel 배포 완료
- [ ] 프로덕션 테스트 완료

---

## 🎓 팁

1. **각 프롬프트를 한 번에 하나씩 실행하세요**
   - 한 번에 여러 파일을 요청하면 컨텍스트가 길어집니다

2. **코드가 생성되면 꼭 저장하세요**
   - Claude Code에서 직접 저장되지 않을 수 있습니다

3. **에러가 나면 에러 메시지를 복사해서 요청하세요**
   - "이 에러가 났어. 해결해줘" 형태로 요청하면 됩니다

4. **로컬에서 항상 테스트하세요**
   - npm run dev 로 실행 후 테스트하세요

5. **환경 변수를 실제 값으로 교체하세요**
   - .env.local 파일의 값들을 실제 Supabase, Resend 값으로 변경하세요

이제 Claude Code에서 이 프롬프트들을 사용하면 됩니다!
