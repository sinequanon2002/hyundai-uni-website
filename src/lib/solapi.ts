/**
 * 솔라피(Solapi) SMS / 카카오 알림톡 발송 유틸리티
 *
 * 필요 환경변수:
 *   SOLAPI_API_KEY          — 솔라피 API Key
 *   SOLAPI_API_SECRET       — 솔라피 API Secret
 *   SOLAPI_SENDER_PHONE     — 등록된 발신번호 (예: 053-781-7667)
 *   SOLAPI_KAKAO_PF_ID      — 카카오 채널 pfId (알림톡 사용 시)
 *   SOLAPI_KAKAO_TEMPLATE_ID — 승인된 알림톡 템플릿 ID (알림톡 사용 시)
 */

import { SolapiMessageService } from "solapi";

function getClient() {
  const apiKey = process.env.SOLAPI_API_KEY;
  const apiSecret = process.env.SOLAPI_API_SECRET;

  if (!apiKey || !apiSecret || apiKey === "YOUR_SOLAPI_API_KEY") {
    return null;
  }

  return new SolapiMessageService(apiKey, apiSecret);
}

interface InquiryNotificationParams {
  to: string;           // 수신번호 (고객 전화번호)
  contactName: string;
  companyName: string;
  wasteTypes: string[];
  inquiryId: string;
}

/**
 * 견적 접수 SMS 발송 (고객 → 접수 확인 알림)
 * 45자 이하 → SMS, 초과 → LMS 자동 전환
 */
export async function sendInquirySms(params: InquiryNotificationParams): Promise<void> {
  const client = getClient();
  if (!client) {
    console.warn("[solapi] API Key 미설정 — SMS 발송 건너뜀");
    return;
  }

  const sender = process.env.SOLAPI_SENDER_PHONE ?? "";
  const wasteList = params.wasteTypes.slice(0, 3).join(", ");
  const more = params.wasteTypes.length > 3 ? ` 외 ${params.wasteTypes.length - 3}건` : "";

  const text = [
    `[현대유앤아이] 견적 문의 접수 완료`,
    ``,
    `안녕하세요, ${params.contactName}님.`,
    `견적 문의가 정상적으로 접수되었습니다.`,
    ``,
    `■ 접수번호: ${params.inquiryId.slice(0, 8).toUpperCase()}`,
    `■ 사업장: ${params.companyName}`,
    `■ 폐기물: ${wasteList}${more}`,
    ``,
    `담당자가 확인 후 빠르게 연락드리겠습니다.`,
    `문의: 053-781-7667`,
  ].join("\n");

  try {
    await client.sendOne({
      to: params.to.replace(/-/g, ""),
      from: sender.replace(/-/g, ""),
      text,
    });
    console.log("[solapi] SMS 발송 성공:", params.to);
  } catch (err) {
    console.error("[solapi] SMS 발송 실패:", err);
  }
}

/**
 * 견적 접수 카카오 알림톡 발송
 * SOLAPI_KAKAO_PF_ID, SOLAPI_KAKAO_TEMPLATE_ID 설정 필요
 * 미설정 시 SMS로 자동 대체
 */
export async function sendInquiryAlimtalk(params: InquiryNotificationParams): Promise<void> {
  const client = getClient();
  if (!client) {
    console.warn("[solapi] API Key 미설정 — 알림톡 발송 건너뜀");
    return;
  }

  const pfId = process.env.SOLAPI_KAKAO_PF_ID;
  const templateId = process.env.SOLAPI_KAKAO_TEMPLATE_ID;
  const sender = process.env.SOLAPI_SENDER_PHONE ?? "";

  // 카카오 채널/템플릿 미설정 시 SMS로 대체
  if (!pfId || !templateId) {
    console.warn("[solapi] 카카오 알림톡 미설정 — SMS로 대체 발송");
    return sendInquirySms(params);
  }

  const wasteList = params.wasteTypes.slice(0, 3).join(", ");
  const more = params.wasteTypes.length > 3 ? ` 외 ${params.wasteTypes.length - 3}건` : "";

  try {
    await client.sendOne({
      to: params.to.replace(/-/g, ""),
      from: sender.replace(/-/g, ""),
      // 알림톡 미전달 시 SMS로 자동 대체
      text: `[현대유앤아이] 견적 접수 완료 (${params.companyName})`,
      kakaoOptions: {
        pfId,
        templateId,
        variables: {
          "#{고객명}": params.contactName,
          "#{사업장명}": params.companyName,
          "#{폐기물}": `${wasteList}${more}`,
          "#{접수번호}": params.inquiryId.slice(0, 8).toUpperCase(),
          "#{전화번호}": "053-781-7667",
        },
      },
    });
    console.log("[solapi] 알림톡 발송 성공:", params.to);
  } catch (err) {
    console.error("[solapi] 알림톡 발송 실패 — SMS로 재시도:", err);
    await sendInquirySms(params);
  }
}

/**
 * 알림 수신 방법에 따라 적절한 발송 함수 선택
 */
export async function sendInquiryNotification(
  method: "sms" | "kakao" | "email",
  params: InquiryNotificationParams
): Promise<void> {
  if (method === "email") return; // 이메일은 Resend에서 처리
  if (method === "kakao") return sendInquiryAlimtalk(params);
  return sendInquirySms(params);
}
