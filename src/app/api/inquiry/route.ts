import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';
import { inquirySchema } from '@/lib/schemas/inquiry';

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const body = await request.json();
    
    // 1. 데이터 검증 (Zod)
    const result = inquirySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 });
    }
    
    const data = result.data;

    // 2. Supabase 저장
    const { error: dbError } = await supabase
      .from('inquiries')
      .insert([
        {
          company_name: data.companyName,
          contact_name: data.contactName,
          phone: data.phone,
          email: data.email,
          region_sido: data.regionSido,
          region_sigungu: data.regionSigungu,
          waste_types: data.wasteTypes,
          quantity: data.quantity,
          unit: data.unit,
          frequency: data.frequency,
          message: data.message,
          agreement: data.agreement,
        },
      ]);

    if (dbError) {
      console.error('DB 저장 에러:', dbError);
      return NextResponse.json({ error: '데이터 저장 중 오류가 발생했습니다.' }, { status: 500 });
    }

    // 3. Resend 이메일 발송
    // hduni3973@naver.com 으로 문의 내용 발송
    try {
      await resend.emails.send({
        from: '현대유앤아이 <onboarding@resend.dev>', // 실 운영 시 도메인 인증 후 변경 권장
        to: ['hduni3973@naver.com'],
        subject: `[신규 견적 문의] ${data.companyName} - ${data.contactName}님`,
        html: `
          <h1>새로운 견적 문의가 접수되었습니다.</h1>
          <p><strong>업체명:</strong> ${data.companyName}</p>
          <p><strong>담당자명:</strong> ${data.contactName}</p>
          <p><strong>연락처:</strong> ${data.phone}</p>
          <p><strong>이메일:</strong> ${data.email}</p>
          <p><strong>지역:</strong> ${data.regionSido} ${data.regionSigungu}</p>
          <p><strong>폐기물 종류:</strong> ${data.wasteTypes.join(', ')}</p>
          <p><strong>예상 수량:</strong> ${data.quantity}${data.unit}</p>
          <p><strong>수거 주기:</strong> ${data.frequency}</p>
          <p><strong>문의 내용:</strong></p>
          <p>${data.message || '내용 없음'}</p>
        `,
      });
    } catch (emailError) {
      // 이메일 발송 실패해도 DB 저장은 성공했으므로 일단 진행하거나 로그 남김
      console.error('이메일 발송 에러:', emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('서버 에러:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
