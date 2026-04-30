/**
 * ============================================================================
 * Inquiry 시스템 - 실전 구현 코드
 * Supabase + Resend + Next.js
 * ============================================================================
 */

// ============================================================================
// 1. Supabase 설정 및 유틸리티
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Supabase 클라이언트
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 암호화 유틸리티
const ENCRYPTION_KEY = Buffer.from(process.env.DATA_ENCRYPTION_KEY, 'hex');

export function encryptField(plaintext) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptField(encrypted) {
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

// ============================================================================
// 2. 데이터 검증 및 정제
// ============================================================================

import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

const InquirySchema = z.object({
  company_name: z
    .string()
    .min(2, '회사명은 최소 2자 이상')
    .max(255)
    .transform(val => val.trim()),
  
  contact_name: z
    .string()
    .min(2, '이름은 최소 2자 이상')
    .max(100)
    .transform(val => val.trim()),
  
  email: z
    .string()
    .email('유효한 이메일이 아닙니다.')
    .toLowerCase()
    .transform(val => val.trim()),
  
  phone: z
    .string()
    .regex(
      /^[\d\-\+\s()]{7,20}$/,
      '유효한 전화번호를 입력하세요.'
    ),
  
  category: z.enum(
    ['웹개발', '앱개발', '디자인', '마케팅', '기타'],
    { errorMap: () => ({ message: '올바른 카테고리를 선택하세요.' }) }
  ),
  
  details: z
    .string()
    .min(10, '세부사항은 최소 10자 이상')
    .max(5000, '세부사항은 5000자 이하')
    .transform(val => val.trim()),
  
  budget: z
    .number()
    .min(0, '예산은 0 이상')
    .optional(),
  
  timeline: z
    .enum(['긴급 (1개월)', '보통 (2-3개월)', '여유 (3개월 이상)'])
    .optional(),
});

export function validateAndSanitize(rawData) {
  try {
    // 1. 스키마 검증
    const validated = InquirySchema.parse(rawData);
    
    // 2. XSS 방지 (HTML 태그 제거)
    const sanitized = {
      ...validated,
      details: DOMPurify.sanitize(validated.details, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      }),
      company_name: DOMPurify.sanitize(validated.company_name, {
        ALLOWED_TAGS: [],
      }),
    };
    
    return { success: true, data: sanitized };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      };
    }
    throw error;
  }
}

// ============================================================================
// 3. Resend 이메일 발송
// ============================================================================

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// 이메일 템플릿
function getConfirmationEmailHTML(inquiry) {
  const createdDate = new Date(inquiry.created_at).toLocaleString('ko-KR');
  
  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 2px solid #0066cc;
        }
        .content {
          padding: 20px 0;
        }
        .info-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          background-color: #f9f9f9;
          border: 1px solid #e0e0e0;
        }
        .info-table td {
          padding: 12px;
          border-bottom: 1px solid #e0e0e0;
        }
        .info-table td:first-child {
          font-weight: bold;
          width: 30%;
          background-color: #f0f0f0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          color: #999;
          font-size: 12px;
        }
        .button {
          display: inline-block;
          background-color: #0066cc;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 4px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>✅ 문의가 접수되었습니다!</h1>
      </div>
      
      <div class="content">
        <p>안녕하세요 <strong>${escapeHtml(inquiry.contact_name)}</strong>님,</p>
        
        <p>저희 웹사이트에 프로젝트 문의를 주셔서 감사합니다!</p>
        
        <p>귀하의 문의가 정상적으로 접수되었으며, 
           저희 팀이 검토하여 <strong>24시간 이내에</strong> 
           연락드리겠습니다.</p>
        
        <table class="info-table">
          <tr>
            <td>회사명</td>
            <td>${escapeHtml(inquiry.company_name)}</td>
          </tr>
          <tr>
            <td>카테고리</td>
            <td>${escapeHtml(inquiry.category)}</td>
          </tr>
          <tr>
            <td>담당자</td>
            <td>${escapeHtml(inquiry.contact_name)}</td>
          </tr>
          <tr>
            <td>이메일</td>
            <td>${escapeHtml(inquiry.email)}</td>
          </tr>
          <tr>
            <td>접수 시간</td>
            <td>${createdDate}</td>
          </tr>
        </table>
        
        <div style="background-color: #f0f8ff; padding: 15px; border-left: 4px solid #0066cc; margin: 20px 0;">
          <p><strong>다음 단계:</strong></p>
          <ol>
            <li>저희 팀이 귀하의 요구사항을 검토합니다.</li>
            <li>맞춤형 견적서를 준비합니다.</li>
            <li>이메일 또는 전화로 연락드립니다.</li>
          </ol>
        </div>
      </div>
      
      <div class="footer">
        <p>※ 이 메일은 자동으로 발송된 메일입니다. 회신하지 마세요.</p>
        <p>문의사항이 있으시면 <a href="mailto:support@example.com">support@example.com</a>으로 연락주세요.</p>
        <p>© 2024 Your Company. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
}

function getQuoteEmailHTML(inquiry, quote) {
  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .quote-box {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 8px;
          text-align: center;
          margin: 20px 0;
        }
        .amount {
          font-size: 36px;
          font-weight: bold;
          margin: 10px 0;
        }
        .details-box {
          background-color: #f5f5f5;
          padding: 20px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .cta-button {
          display: inline-block;
          background-color: #667eea;
          color: white;
          padding: 14px 40px;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <h2>📋 프로젝트 견적서</h2>
      
      <p>안녕하세요 ${escapeHtml(inquiry.contact_name)}님,</p>
      
      <p>귀하의 프로젝트에 대한 맞춤형 견적서를 준비했습니다.</p>
      
      <div class="quote-box">
        <p>예상 프로젝트 비용</p>
        <div class="amount">₩${Number(quote.estimatedCost).toLocaleString('ko-KR')}</div>
        <p>예상 기간: ${escapeHtml(quote.timeline)}</p>
      </div>
      
      <div class="details-box">
        <h3>프로젝트 개요</h3>
        <p>${escapeHtml(quote.description).replace(/\n/g, '<br>')}</p>
      </div>
      
      <h3>다음 단계:</h3>
      <ol>
        <li>이 견적서를 검토해주세요.</li>
        <li>추가 질문이 있으면 회신해주세요.</li>
        <li>동의하시면 계약 일정을 안내해드립니다.</li>
      </ol>
      
      <center>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/quote/${inquiry.id}" class="cta-button">
          견적서 상세보기
        </a>
      </center>
    </body>
    </html>
  `;
}

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

// 확인 이메일 발송
export async function sendConfirmationEmail(inquiry) {
  try {
    // 1. 이메일 로그 생성
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
    
    // 2. Resend로 이메일 발송 (백그라운드)
    resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: inquiry.email,
      subject: '문의 접수 확인',
      html: getConfirmationEmailHTML(inquiry),
      replyTo: process.env.SUPPORT_EMAIL,
      headers: {
        'X-Inquiry-ID': inquiry.id.toString(),
      },
    }).then(async (response) => {
      // 이메일 로그 업데이트
      await supabase
        .from('email_logs')
        .update({
          sent_at: new Date().toISOString(),
          resend_message_id: response.id,
          status: 'sent',
        })
        .eq('id', emailLog.id);
    }).catch(async (error) => {
      console.error('이메일 발송 실패:', error);
      await supabase
        .from('email_logs')
        .update({
          status: 'failed',
          error_message: error.message,
        })
        .eq('id', emailLog.id);
    });
    
    return true;
  } catch (error) {
    console.error('이메일 로그 생성 실패:', error);
    throw error;
  }
}

// 견적서 이메일 발송 (관리자용)
export async function sendQuoteEmail(inquiryId, quote, adminUserId) {
  try {
    // 1. Inquiry 조회
    const { data: inquiry } = await supabase
      .from('inquiries')
      .select('*')
      .eq('id', inquiryId)
      .single();
    
    if (!inquiry) {
      throw new Error('Inquiry를 찾을 수 없습니다.');
    }
    
    // 2. 감시 로그
    await supabase
      .from('audit_logs')
      .insert({
        user_id: adminUserId,
        inquiry_id: inquiryId,
        action: 'SEND_QUOTE_EMAIL',
        details: { quote_id: quote.id },
      });
    
    // 3. 이메일 로그 생성
    const { data: emailLog } = await supabase
      .from('email_logs')
      .insert({
        inquiry_id: inquiryId,
        recipient_email: inquiry.email,
        email_type: 'quote',
        subject: `[견적서] ${inquiry.company_name}`,
        status: 'pending',
      })
      .select()
      .single();
    
    // 4. 이메일 발송
    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: inquiry.email,
      cc: [process.env.ADMIN_EMAIL],
      subject: `[견적서] ${inquiry.company_name}`,
      html: getQuoteEmailHTML(inquiry, quote),
      replyTo: process.env.SUPPORT_EMAIL,
      headers: {
        'X-Inquiry-ID': inquiryId.toString(),
      },
    });
    
    // 5. 이메일 로그 업데이트
    await supabase
      .from('email_logs')
      .update({
        sent_at: new Date().toISOString(),
        resend_message_id: response.id,
        status: 'sent',
      })
      .eq('id', emailLog.id);
    
    // 6. Inquiry 상태 업데이트
    await supabase
      .from('inquiries')
      .update({ status: 'quoted' })
      .eq('id', inquiryId);
    
    return response;
  } catch (error) {
    console.error('견적서 이메일 발송 실패:', error);
    throw error;
  }
}

// ============================================================================
// 4. Inquiry 저장 (API 엔드포인트)
// ============================================================================

// lib/inquiry.js 또는 app/api/inquiry/route.js

import rateLimit from 'express-rate-limit';

// Rate limiter 설정
const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // IP당 최대 5개
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // 테스트 환경에서는 제한 안 함
    return process.env.NODE_ENV === 'test';
  },
});

export async function createInquiry(rawData, req) {
  // 1. HTTPS 확인
  const isSecure = req.protocol === 'https' || req.secure;
  if (!isSecure && process.env.NODE_ENV === 'production') {
    throw new Error('HTTPS required');
  }
  
  // 2. 데이터 검증
  const validation = validateAndSanitize(rawData);
  if (!validation.success) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }
  
  const cleanData = validation.data;
  
  // 3. 중복 체크 (30초 내)
  const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString();
  const { data: recent } = await supabase
    .from('inquiries')
    .select('id')
    .eq('email', cleanData.email)
    .gt('created_at', thirtySecondsAgo);
  
  if (recent && recent.length > 0) {
    const error = new Error('Too many requests');
    error.statusCode = 429;
    throw error;
  }
  
  // 4. 데이터베이스에 저장
  const { data: inquiry, error: dbError } = await supabase
    .from('inquiries')
    .insert({
      company_name: cleanData.company_name,
      contact_name: cleanData.contact_name,
      email: cleanData.email,
      phone: cleanData.phone,
      category: cleanData.category,
      details: cleanData.details,
      budget: cleanData.budget || null,
      timeline: cleanData.timeline || null,
      status: 'pending',
      ip_address: req.ip || req.headers['x-forwarded-for'],
      user_agent: req.get('User-Agent'),
      referer: req.get('Referer'),
    })
    .select()
    .single();
  
  if (dbError) {
    console.error('데이터베이스 저장 실패:', dbError);
    throw new Error('Failed to save inquiry');
  }
  
  // 5. 확인 이메일 발송 (비동기)
  await sendConfirmationEmail(inquiry);
  
  // 6. 관리자 알림 (선택)
  await notifyAdmin(inquiry);
  
  return inquiry;
}

// 관리자 알림
async function notifyAdmin(inquiry) {
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: `[새 문의] ${inquiry.company_name} - ${inquiry.category}`,
      html: `
        <h3>새로운 문의가 접수되었습니다.</h3>
        <p><strong>회사:</strong> ${inquiry.company_name}</p>
        <p><strong>담당자:</strong> ${inquiry.contact_name}</p>
        <p><strong>이메일:</strong> ${inquiry.email}</p>
        <p><strong>전화:</strong> ${inquiry.phone}</p>
        <p><strong>카테고리:</strong> ${inquiry.category}</p>
        <p><strong>세부사항:</strong></p>
        <p>${inquiry.details}</p>
      `,
    });
  } catch (error) {
    console.error('관리자 알림 실패:', error);
  }
}

// ============================================================================
// 5. GDPR 개인정보 삭제 & 다운로드
// ============================================================================

// 사용자 개인정보 다운로드
export async function downloadUserData(email) {
  const { data: inquiries } = await supabase
    .from('inquiries')
    .select('*')
    .eq('email', email)
    .eq('is_deleted', false);
  
  const { data: emailLogs } = await supabase
    .from('email_logs')
    .select('*')
    .eq('recipient_email', email);
  
  return {
    inquiries: inquiries || [],
    emails: emailLogs || [],
    downloadedAt: new Date().toISOString(),
  };
}

// 사용자 개인정보 완전 삭제
export async function deleteUserData(email, adminUserId) {
  // 1. 감시 로그
  await supabase
    .from('audit_logs')
    .insert({
      user_id: adminUserId,
      action: 'DELETE_USER_DATA',
      details: { email },
    });
  
  // 2. Soft delete (먼저 표시)
  const { data: inquiries } = await supabase
    .from('inquiries')
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    })
    .eq('email', email)
    .select();
  
  // 3. 30일 후 Hard delete를 위해 스케줄
  // (Cron job으로 처리)
  
  return inquiries;
}

// 자동 데이터 삭제 (Cron)
export async function scheduleDataDeletion() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Soft delete된 데이터를 Hard delete
  const { data } = await supabase
    .from('inquiries')
    .delete()
    .eq('is_deleted', true)
    .lt('deleted_at', thirtyDaysAgo.toISOString());
  
  console.log(`Deleted ${data?.length || 0} records`);
}

// ============================================================================
// 6. 감시 로깅
// ============================================================================

export async function logDataAccess(userId, inquiryId, action) {
  await supabase
    .from('audit_logs')
    .insert({
      user_id: userId,
      inquiry_id: inquiryId,
      action: action,
      details: {},
    });
}

// ============================================================================
// 7. 파일 업로드
// ============================================================================

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

export async function uploadInquiryFile(file, inquiryId) {
  // 1. 검증
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('파일 크기는 10MB를 초과할 수 없습니다.');
  }
  
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('지원하지 않는 파일 형식입니다.');
  }
  
  // 2. 파일명 정제
  const sanitizedFileName = file.name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 255);
  
  const filePath = `${inquiryId}/${Date.now()}_${sanitizedFileName}`;
  
  // 3. 업로드
  const { data, error } = await supabase
    .storage
    .from('inquiry-attachments')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });
  
  if (error) {
    throw error;
  }
  
  // 4. 공개 URL 생성
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

// ============================================================================
// Export all functions
// ============================================================================

export {
  supabase,
  encryptField,
  decryptField,
  validateAndSanitize,
  InquirySchema,
};
