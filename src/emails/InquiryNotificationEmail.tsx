import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface InquiryNotificationEmailProps {
  companyName: string;
  department: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  addressDetail?: string;
  wasteTypes: string[];
  marketingConsent: boolean;
  inquiryId: string;
  submittedAt: string;
  hasPhotos: boolean;
}

export function InquiryNotificationEmail({
  companyName,
  department,
  contactName,
  email,
  phone,
  address,
  addressDetail,
  wasteTypes,
  marketingConsent,
  inquiryId,
  submittedAt,
  hasPhotos,
}: InquiryNotificationEmailProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  return (
    <Html lang="ko">
      <Head />
      <Preview>
        [신규 견적 문의] {companyName} - {contactName}님
      </Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Heading style={headerTitleStyle}>새로운 견적 문의 접수</Heading>
            <Text style={headerSubStyle}>
              {new Date(submittedAt).toLocaleString("ko-KR")}
            </Text>
          </Section>

          {/* Body */}
          <Section style={sectionStyle}>
            <Row label="사업장명" value={companyName} />
            <Row label="소속팀" value={department} />
            <Row label="담당자명" value={contactName} />
            <Row label="이메일" value={email} />
            <Row label="전화번호" value={phone} />
            <Row
              label="수거 장소"
              value={addressDetail ? `${address} ${addressDetail}` : address}
            />
            <Row label="폐기물 종류" value={wasteTypes.join(", ")} />
            <Row label="사진 첨부" value={hasPhotos ? "있음" : "없음"} />
            <Row
              label="마케팅 수신 동의"
              value={marketingConsent ? "동의" : "미동의"}
            />
          </Section>

          <Hr style={hrStyle} />

          <Section style={sectionStyle}>
            <Link href={`${baseUrl}/inquiries/${inquiryId}`} style={buttonStyle}>
              관리자 대시보드에서 확인하기
            </Link>
          </Section>

          <Hr style={hrStyle} />

          <Text style={footerStyle}>
            문의 ID: {inquiryId} · 현대유앤아이환경 내부 시스템
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Section style={rowStyle}>
      <Text style={labelStyle}>{label}</Text>
      <Text style={valueStyle}>{value}</Text>
    </Section>
  );
}

export default InquiryNotificationEmail;

const bodyStyle: React.CSSProperties = {
  backgroundColor: "#F5F8FB",
  fontFamily: "'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
};

const containerStyle: React.CSSProperties = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "600px",
};

const headerStyle: React.CSSProperties = {
  backgroundColor: "#1F4E79",
  borderRadius: "8px 8px 0 0",
  padding: "32px 40px",
};

const headerTitleStyle: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "700",
  margin: "0 0 8px",
};

const headerSubStyle: React.CSSProperties = {
  color: "rgba(255,255,255,0.7)",
  fontSize: "14px",
  margin: "0",
};

const sectionStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  padding: "24px 40px",
};

const rowStyle: React.CSSProperties = {
  borderBottom: "1px solid #E8EEF4",
  paddingBottom: "12px",
  marginBottom: "12px",
};

const labelStyle: React.CSSProperties = {
  color: "#666666",
  fontSize: "12px",
  margin: "0 0 2px",
  fontWeight: "600",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const valueStyle: React.CSSProperties = {
  color: "#1A1A1A",
  fontSize: "15px",
  margin: "0",
};

const hrStyle: React.CSSProperties = {
  borderColor: "#E8EEF4",
  margin: "0",
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: "#1F4E79",
  borderRadius: "6px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "600",
  padding: "12px 24px",
  textDecoration: "none",
};

const footerStyle: React.CSSProperties = {
  color: "#999999",
  fontSize: "12px",
  textAlign: "center",
  padding: "16px 40px",
};
