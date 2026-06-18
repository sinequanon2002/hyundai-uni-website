import {
  Body, Container, Head, Heading, Hr, Html,
  Preview, Section, Text,
} from "@react-email/components";
import * as React from "react";
import { COMPANY } from "@/lib/constants";

interface QuoteEmailProps {
  contactName: string;
  companyName: string;
  quoteNumber: string;
  total: number;
  validUntil?: string | null;
}

export function QuoteEmail({
  contactName,
  companyName,
  quoteNumber,
  total,
  validUntil,
}: QuoteEmailProps) {
  const totalFormatted = total.toLocaleString("ko-KR");
  const validStr = validUntil
    ? new Date(validUntil).toLocaleDateString("ko-KR")
    : null;

  return (
    <Html lang="ko">
      <Head />
      <Preview>견적서({quoteNumber})를 발송해드립니다 - {COMPANY.shortName}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={headerStyle}>
            <Heading style={headerTitleStyle}>견적서 발송</Heading>
            <Text style={headerSubStyle}>{COMPANY.name}</Text>
          </Section>

          <Section style={sectionStyle}>
            <Text style={greetingStyle}>
              안녕하세요, <strong>{contactName}</strong>님.
            </Text>
            <Text style={bodyTextStyle}>
              <strong>{companyName}</strong>의 지정폐기물 수거·운반 견적서를 첨부하여 발송드립니다.
              첨부된 PDF 파일을 확인하시고 궁금하신 사항이 있으시면 담당자에게 연락해 주세요.
            </Text>
          </Section>

          <Hr style={hrStyle} />

          <Section style={sectionStyle}>
            <Text style={subHeadingStyle}>견적 요약</Text>
            <Section style={summaryBoxStyle}>
              <Text style={summaryLabelStyle}>견적번호</Text>
              <Text style={summaryValueStyle}>{quoteNumber}</Text>
              <Text style={summaryLabelStyle}>사업장명</Text>
              <Text style={summaryValueStyle}>{companyName}</Text>
              <Text style={summaryLabelStyle}>합계 금액</Text>
              <Text style={{ ...summaryValueStyle, color: "#0C5F6B", fontWeight: "bold" }}>
                {totalFormatted}원 (부가세 포함)
              </Text>
              {validStr && (
                <>
                  <Text style={summaryLabelStyle}>견적 유효기간</Text>
                  <Text style={summaryValueStyle}>{validStr}까지</Text>
                </>
              )}
            </Section>
          </Section>

          <Hr style={hrStyle} />

          <Section style={sectionStyle}>
            <Text style={bodyTextStyle}>
              견적 내용에 동의하시면 담당자에게 연락 주시기 바랍니다.
            </Text>
            <Text style={contactStyle}>
              📞 {COMPANY.tel} &nbsp;|&nbsp; ✉️ {COMPANY.email}
            </Text>
            <Text style={businessHoursStyle}>
              운영시간: {COMPANY.businessHours}
            </Text>
          </Section>

          <Hr style={hrStyle} />
          <Text style={footerStyle}>
            본 메일은 발신 전용입니다. · {COMPANY.name}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default QuoteEmail;

const bodyStyle: React.CSSProperties = {
  backgroundColor: "#F0FAFA",
  fontFamily: "'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
};
const containerStyle: React.CSSProperties = {
  margin: "0 auto", padding: "20px 0 48px", maxWidth: "600px",
};
const headerStyle: React.CSSProperties = {
  backgroundColor: "#0C5F6B", borderRadius: "8px 8px 0 0", padding: "32px 40px",
};
const headerTitleStyle: React.CSSProperties = {
  color: "#ffffff", fontSize: "24px", fontWeight: "700", margin: "0 0 8px",
};
const headerSubStyle: React.CSSProperties = {
  color: "rgba(255,255,255,0.7)", fontSize: "14px", margin: "0",
};
const sectionStyle: React.CSSProperties = {
  backgroundColor: "#ffffff", padding: "24px 40px",
};
const greetingStyle: React.CSSProperties = {
  color: "#1A1A1A", fontSize: "16px", margin: "0 0 12px",
};
const bodyTextStyle: React.CSSProperties = {
  color: "#444444", fontSize: "15px", lineHeight: "1.6", margin: "0 0 8px",
};
const subHeadingStyle: React.CSSProperties = {
  color: "#0C5F6B", fontSize: "16px", fontWeight: "700", margin: "0 0 16px",
};
const summaryBoxStyle: React.CSSProperties = {
  backgroundColor: "#F0FAFA", borderRadius: "6px", padding: "16px",
};
const summaryLabelStyle: React.CSSProperties = {
  color: "#666666", fontSize: "12px", fontWeight: "600",
  margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.5px",
};
const summaryValueStyle: React.CSSProperties = {
  color: "#1A1A1A", fontSize: "14px", margin: "0 0 12px",
};
const contactStyle: React.CSSProperties = {
  color: "#0C5F6B", fontSize: "15px", fontWeight: "600", margin: "8px 0 4px",
};
const businessHoursStyle: React.CSSProperties = {
  color: "#666666", fontSize: "13px", margin: "0",
};
const hrStyle: React.CSSProperties = { borderColor: "#E8EEF4", margin: "0" };
const footerStyle: React.CSSProperties = {
  color: "#999999", fontSize: "12px", textAlign: "center", padding: "16px 40px",
};
