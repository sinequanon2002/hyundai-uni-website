import * as React from "react";

interface Props {
  name: string;
  companyName: string;
}

export function BrochureApprovalEmail({ name, companyName }: Props) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: 600, margin: "0 auto", color: "#1a1a1a" }}>
      {/* 헤더 */}
      <div style={{ background: "#0C5F6B", padding: "24px 32px" }}>
        <p style={{ color: "#fff", fontSize: 18, fontWeight: "bold", margin: 0 }}>
          현대유앤아이
        </p>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, margin: "4px 0 0" }}>
          지정폐기물 수집·운반 전문
        </p>
      </div>

      {/* 본문 */}
      <div style={{ padding: "32px" }}>
        <p style={{ fontSize: 15, marginBottom: 16 }}>
          안녕하세요, <strong>{name}</strong>님 ({companyName})
        </p>
        <p style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
          현대유앤아이 서비스 소개서 신청을 검토하였습니다.<br />
          요청하신 <strong>서비스 소개서 PDF</strong>를 첨부 파일로 보내드립니다.
        </p>

        <div style={{ background: "#f0fafa", border: "1px solid #0C5F6B20", borderRadius: 12, padding: "20px 24px", marginBottom: 24 }}>
          <p style={{ fontSize: 13, fontWeight: "bold", color: "#0C5F6B", marginBottom: 8 }}>
            📄 첨부 파일
          </p>
          <p style={{ fontSize: 13, color: "#444", margin: 0 }}>
            현대유앤아이_서비스소개서.pdf
          </p>
        </div>

        <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, marginBottom: 24 }}>
          소개서 내용을 검토하신 후 추가로 궁금하신 사항이 있으시면
          아래 연락처로 문의해 주시기 바랍니다.
        </p>

        {/* 연락처 */}
        <div style={{ borderTop: "1px solid #eee", paddingTop: 20, fontSize: 13, color: "#666" }}>
          <p style={{ margin: "0 0 6px" }}>📞 전화: 054-973-3973</p>
          <p style={{ margin: "0 0 6px" }}>✉️ 이메일: hduni3973@naver.com</p>
          <p style={{ margin: 0 }}>🕐 운영시간: 평일 09:00 – 18:00</p>
        </div>
      </div>

      {/* 푸터 */}
      <div style={{ background: "#f9f9f9", padding: "16px 32px", borderTop: "1px solid #eee", fontSize: 11, color: "#999" }}>
        <p style={{ margin: 0 }}>
          본 메일은 서비스 소개서 신청에 따라 발송된 메일입니다.
          문의사항이 있으시면 위 연락처로 연락해 주세요.
        </p>
      </div>
    </div>
  );
}
