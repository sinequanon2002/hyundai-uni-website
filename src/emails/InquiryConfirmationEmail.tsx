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
        ê²¬ì  ë¬¸ì˜ê°€ ?‘ìˆ˜?˜ì—ˆ?µë‹ˆ??- {COMPANY.shortName}
      </Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Heading style={headerTitleStyle}>ê²¬ì  ë¬¸ì˜ ?‘ìˆ˜ ?„ë£Œ</Heading>
            <Text style={headerSubStyle}>{COMPANY.name}</Text>
          </Section>

          {/* Greeting */}
          <Section style={sectionStyle}>
            <Text style={greetingStyle}>
              ?ˆë…•?˜ì„¸?? <strong>{contactName}</strong>??
            </Text>
            <Text style={bodyTextStyle}>
              <strong>{companyName}</strong>??ì§€?•íê¸°ë¬¼ ê²¬ì  ë¬¸ì˜ê°€ ?•ìƒ?ìœ¼ë¡?
              ?‘ìˆ˜?˜ì—ˆ?µë‹ˆ?? ë¹ ë¥¸ ?œì¼ ?´ì— ?´ë‹¹?ê? ?°ë½?œë¦¬ê² ìŠµ?ˆë‹¤.
            </Text>
          </Section>

          <Hr style={hrStyle} />

          {/* ?‘ìˆ˜ ?´ìš© ?”ì•½ */}
          <Section style={sectionStyle}>
            <Text style={subHeadingStyle}>?‘ìˆ˜ ?´ìš© ?”ì•½</Text>
            <Section style={summaryBoxStyle}>
              <Text style={summaryLabelStyle}>?¬ì—…?¥ëª…</Text>
              <Text style={summaryValueStyle}>{companyName}</Text>
              <Text style={summaryLabelStyle}>?ê¸°ë¬?ì¢…ë¥˜</Text>
              <Text style={summaryValueStyle}>{wasteTypes.join(", ")}</Text>
              <Text style={summaryLabelStyle}>ë¬¸ì˜ ë²ˆí˜¸</Text>
              <Text style={summaryValueStyle}>{inquiryId}</Text>
            </Section>
          </Section>

          <Hr style={hrStyle} />

          {/* ?¤ìŒ ?¨ê³„ */}
          <Section style={sectionStyle}>
            <Text style={subHeadingStyle}>?¤ìŒ ?¨ê³„</Text>
            <Step number="01" title="ë¬¸ì˜ ê²€?? desc="?‘ìˆ˜???´ìš©???„ë¬¸ ?´ë‹¹?ê? ê²€? í•©?ˆë‹¤." />
            <Step number="02" title="?„ì¥ ë°©ë¬¸ / ?ë‹´" desc="?´ë‹¹?ê? ì§ì ‘ ?°ë½?˜ì—¬ ?˜ê±° ?¼ì • ë°?ì¡°ê±´???‘ì˜?©ë‹ˆ??" />
            <Step number="03" title="ê²¬ì ??ë°œì†¡" desc="ê²€???„ë£Œ ??ë§ì¶¤ ê²¬ì ?œë? ?´ë©”?¼ë¡œ ë°œì†¡?œë¦½?ˆë‹¤." />
          </Section>

          <Hr style={hrStyle} />

          {/* ?°ë½ì²?*/}
          <Section style={sectionStyle}>
            <Text style={bodyTextStyle}>
              ë¬¸ì˜?¬í•­???ˆìœ¼?œë©´ ?„ë˜ë¡??°ë½??ì£¼ì„¸??
            </Text>
            <Text style={contactStyle}>
              ?“ {COMPANY.tel} &nbsp;|&nbsp; ?‰ï¸ {COMPANY.email}
            </Text>
            <Text style={businessHoursStyle}>
              ?´ì˜?œê°„: {COMPANY.businessHours}
            </Text>
          </Section>

          <Hr style={hrStyle} />

          <Text style={footerStyle}>
            ë³?ë©”ì¼?€ ë°œì‹  ?„ìš©?…ë‹ˆ?? Â· {COMPANY.name}
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

const stepStyle: React.CSSProperties = {
  display: "flex",
  marginBottom: "16px",
};

const stepNumberStyle: React.CSSProperties = {
  backgroundColor: "#0C5F6B",
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
