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

export type NotifiableStatus = "reviewing" | "quoted" | "completed";

interface StatusConfig {
  previewText: string;
  headerTitle: string;
  headerAccentColor: string;
  greeting: string;
  bodyText: string;
  highlight?: string;
}

const STATUS_CONFIG: Record<NotifiableStatus, StatusConfig> = {
  reviewing: {
    previewText: "담당자가 문의 내용을 검토하기 시작했습니다",
    headerTitle: "검토가 시작되었습니다",
    headerAccentColor: "#1D6FA8",
    greeting: "문의해 주셔서 감사합니다.",
    bodyText:
      "전문 담당자가 배정되어 접수하신 지정폐기물 수거 문의를 검토하고 있습니다. 검토 완료 후 영업일 기준 2~3일 내에 연락드리겠습니다.",
    highlight: "검토 중",
  },
  quoted: {
    previewText: "견적 검토가 완료되어 담당자가 곧 연락드립니다",
    headerTitle: "견적 검토가 완료되었습니다",
    headerAccentColor: "#6B47B8",
    greeting: "기다려 주셔서 감사합니다.",
    bodyText:
      "문의하신 지정폐기물 수거 건의 견적 검토가 완료되었습니다. 담당자가 견적 내용과 수거 일정 협의를 위해 곧 연락드릴 예정입니다.",
    highlight: "견적 준비 완료",
  },
  completed: {
    previewText: "지정폐기물 수거 처리가 완료되었습니다",
    headerTitle: "처리가 완료되었습니다",
    headerAccentColor: "#0E9E7E",
    greeting: "이용해 주셔서 감사합니다.",
    bodyText:
      "의뢰하신 지정폐기물 수거·운반 처리가 완료되었습니다. 향후 지정폐기물 수거가 필요하실 때 언제든지 문의해 주세요.",
    highlight: "처리 완료",
  },
};

interface InquiryStatusUpdateEmailProps {
  status: NotifiableStatus;
  contactName: string;
  companyName: string;
  wasteTypes: string[];
  inquiryId: string;
}

export function InquiryStatusUpdateEmail({
  status,
  contactName,
  companyName,
  wasteTypes,
  inquiryId,
}: InquiryStatusUpdateEmailProps) {
  const cfg = STATUS_CONFIG[status];

  return (
    <Html lang="ko">
      <Head />
      <Preview>{cfg.previewText} - {COMPANY.shortName}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={{ ...headerStyle, backgroundColor: cfg.headerAccentColor }}>
            <Text style={badgeStyle}>{cfg.highlight}</Text>
            <Heading style={headerTitleStyle}>{cfg.headerTitle}</Heading>
            <Text style={headerSubStyle}>{COMPANY.name}</Text>
          </Section>

          {/* Greeting */}
          <Section style={sectionStyle}>
            <Text style={greetingStyle}>
              안녕하세요, <strong>{contactName}</strong>님.
            </Text>
            <Text style={bodyTextStyle}>{cfg.bodyText}</Text>
          </Section>

          <Hr style={hrStyle} />

          {/* 문의 요약 */}
          <Section style={sectionStyle}>
            <Text style={subHeadingStyle}>문의 내용 요약</Text>
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

export default InquiryStatusUpdateEmail;

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
  borderRadius: "8px 8px 0 0",
  padding: "32px 40px",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "rgba(255,255,255,0.2)",
  color: "#ffffff",
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "1px",
  borderRadius: "4px",
  padding: "3px 10px",
  margin: "0 0 12px",
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
  margin: "0 0 16px",
};

const summaryBoxStyle: React.CSSProperties = {
  backgroundColor: "#F0FAFA",
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

const contactStyle: React.CSSProperties = {
  color: "#0C5F6B",
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
