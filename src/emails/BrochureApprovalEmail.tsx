import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { COMPANY } from "@/lib/constants";

interface BrochureApprovalEmailProps {
  name: string;
  companyName: string;
}

export function BrochureApprovalEmail({ name, companyName }: BrochureApprovalEmailProps) {
  return (
    <Html lang="ko">
      <Head />
      <Preview>
        현대유앤아이 서비스 소개서를 보내드립니다
      </Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* 헤더 */}
          <Section style={headerStyle}>
            <Heading style={headerTitleStyle}>서비스 소개서 발송</Heading>
            <Text style={headerSubStyle}>{COMPANY.name}</Text>
          </Section>

          {/* 인사 */}
          <Section style={sectionStyle}>
            <Text style={greetingStyle}>
              안녕하세요, <strong>{name}</strong>님 ({companyName})
            </Text>
            <Text style={bodyTextStyle}>
              현대유앤아이 서비스 소개서 신청을 검토하였습니다.
              요청하신 <strong>서비스 소개서 PDF</strong>를 첨부 파일로 보내드립니다.
            </Text>
          </Section>

          <Hr style={hrStyle} />

          {/* 첨부 안내 */}
          <Section style={sectionStyle}>
            <Text style={subHeadingStyle}>📄 첨부 파일</Text>
            <Section style={summaryBoxStyle}>
              <Text style={summaryValueStyle}>
                현대유앤아이_서비스소개서.pdf
              </Text>
            </Section>
            <Text style={bodyTextStyle}>
              소개서 내용을 검토하신 후 추가로 궁금하신 사항이 있으시면
              아래 연락처로 언제든지 문의해 주시기 바랍니다.
            </Text>
          </Section>

          <Hr style={hrStyle} />

          {/* 연락처 */}
          <Section style={sectionStyle}>
            <Text style={contactStyle}>
              📞 {COMPANY.tel} &nbsp;|&nbsp; ✉️ {COMPANY.email}
            </Text>
            <Text style={businessHoursStyle}>
              운영시간: {COMPANY.businessHours}
            </Text>
          </Section>

          <Hr style={hrStyle} />

          <Text style={footerStyle}>
            본 메일은 서비스 소개서 신청에 따라 발송된 메일입니다. · {COMPANY.name}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default BrochureApprovalEmail;

const bodyStyle: React.CSSProperties = {
  backgroundColor: "#F0FAFA",
  fontFamily: "'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
};

const containerStyle: React.CSSProperties = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "600px",
};

const headerStyle: React.CSSProperties = {
  backgroundColor: "#0C5F6B",
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

const greetingStyle: React.CSSProperties = {
  color: "#1A1A1A",
  fontSize: "16px",
  margin: "0 0 12px",
};

const bodyTextStyle: React.CSSProperties = {
  color: "#444444",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 8px",
};

const subHeadingStyle: React.CSSProperties = {
  color: "#0C5F6B",
  fontSize: "16px",
  fontWeight: "700",
  margin: "0 0 12px",
};

const summaryBoxStyle: React.CSSProperties = {
  backgroundColor: "#F0FAFA",
  borderRadius: "6px",
  padding: "12px 16px",
  marginBottom: "16px",
};

const summaryValueStyle: React.CSSProperties = {
  color: "#1A1A1A",
  fontSize: "14px",
  margin: "0",
  fontWeight: "600",
};

const contactStyle: React.CSSProperties = {
  color: "#0C5F6B",
  fontSize: "15px",
  fontWeight: "600",
  margin: "0 0 4px",
};

const businessHoursStyle: React.CSSProperties = {
  color: "#666666",
  fontSize: "13px",
  margin: "0",
};

const hrStyle: React.CSSProperties = {
  borderColor: "#E8EEF4",
  margin: "0",
};

const footerStyle: React.CSSProperties = {
  color: "#999999",
  fontSize: "12px",
  textAlign: "center",
  padding: "16px 40px",
};
