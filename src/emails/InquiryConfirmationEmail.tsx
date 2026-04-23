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

interface InquiryConfirmationEmailProps {
  contactName: string;
  companyName: string;
  wasteTypes: string[];
  inquiryId: string;
}

export function InquiryConfirmationEmail({
  contactName,
  companyName,
  wasteTypes,
  inquiryId,
}: InquiryConfirmationEmailProps) {
  return (
    <Html lang="ko">
      <Head />
      <Preview>
        견적 문의가 접수되었습니다 - {COMPANY.shortName}
      </Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Heading style={headerTitleStyle}>견적 문의 접수 완료</Heading>
            <Text style={headerSubStyle}>{COMPANY.name}</Text>
          </Section>

          {/* Greeting */}
          <Section style={sectionStyle}>
            <Text style={greetingStyle}>
              안녕하세요, <strong>{contactName}</strong>님.
            </Text>
            <Text style={bodyTextStyle}>
              <strong>{companyName}</strong>의 지정폐기물 견적 문의가 정상적으로
              접수되었습니다. 빠른 시일 내에 담당자가 연락드리겠습니다.
            </Text>
          </Section>

          <Hr style={hrStyle} />

          {/* 접수 내용 요약 */}
          <Section style={sectionStyle}>
            <Text style={subHeadingStyle}>접수 내용 요약</Text>
            <Section style={summaryBoxStyle}>
              <Text style={summaryLabelStyle}>사업장명</Text>
              <Text style={summaryValueStyle}>{companyName}</Text>
              <Text style={summaryLabelStyle}>폐기물 종류</Text>
              <Text style={summaryValueStyle}>{wasteTypes.join(", ")}</Text>
              <Text style={summaryLabelStyle}>문의 번호</Text>
              <Text style={summaryValueStyle}>{inquiryId}</Text>
            </Section>
          </Section>

          <Hr style={hrStyle} />

          {/* 다음 단계 */}
          <Section style={sectionStyle}>
            <Text style={subHeadingStyle}>다음 단계</Text>
            <Step number="01" title="문의 검토" desc="접수된 내용을 전문 담당자가 검토합니다." />
            <Step number="02" title="현장 확인 연락" desc="담당자가 직접 연락하여 수거 일정 및 조건을 협의합니다." />
            <Step number="03" title="견적서 발송" desc="검토 완료 후 맞춤 견적서를 이메일로 발송드립니다." />
          </Section>

          <Hr style={hrStyle} />

          {/* 연락처 */}
          <Section style={sectionStyle}>
            <Text style={bodyTextStyle}>
              문의사항이 있으시면 아래로 연락해 주세요.
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

function Step({
  number,
  title,
  desc,
}: {
  number: string;
  title: string;
  desc: string;
}) {
  return (
    <Section style={stepStyle}>
      <Text style={stepNumberStyle}>{number}</Text>
      <Section style={stepContentStyle}>
        <Text style={stepTitleStyle}>{title}</Text>
        <Text style={stepDescStyle}>{desc}</Text>
      </Section>
    </Section>
  );
}

export default InquiryConfirmationEmail;

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
  color: "#1F4E79",
  fontSize: "16px",
  fontWeight: "700",
  margin: "0 0 16px",
};

const summaryBoxStyle: React.CSSProperties = {
  backgroundColor: "#F5F8FB",
  borderRadius: "6px",
  padding: "16px",
};

const summaryLabelStyle: React.CSSProperties = {
  color: "#666666",
  fontSize: "12px",
  fontWeight: "600",
  margin: "0 0 2px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const summaryValueStyle: React.CSSProperties = {
  color: "#1A1A1A",
  fontSize: "14px",
  margin: "0 0 12px",
};

const stepStyle: React.CSSProperties = {
  display: "flex",
  marginBottom: "16px",
};

const stepNumberStyle: React.CSSProperties = {
  backgroundColor: "#1F4E79",
  borderRadius: "50%",
  color: "#ffffff",
  fontSize: "12px",
  fontWeight: "700",
  height: "28px",
  lineHeight: "28px",
  textAlign: "center",
  width: "28px",
  flexShrink: 0,
  margin: "0 12px 0 0",
};

const stepContentStyle: React.CSSProperties = {
  flex: 1,
};

const stepTitleStyle: React.CSSProperties = {
  color: "#1A1A1A",
  fontSize: "14px",
  fontWeight: "700",
  margin: "0 0 2px",
};

const stepDescStyle: React.CSSProperties = {
  color: "#666666",
  fontSize: "13px",
  margin: "0",
};

const contactStyle: React.CSSProperties = {
  color: "#1F4E79",
  fontSize: "15px",
  fontWeight: "600",
  margin: "8px 0 4px",
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
