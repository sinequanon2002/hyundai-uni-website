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
  collectionDate?: string;
  quantity?: string;
  message?: string;
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
  collectionDate,
  quantity,
  message,
}: InquiryNotificationEmailProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  return (
    <Html lang="ko">
      <Head />
      <Preview>
        [?†Í∑ú Í≤¨Ï†Å Î¨∏Ïùò] {companyName} - {contactName}??      </Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Heading style={headerTitleStyle}>?àÎ°ú??Í≤¨Ï†Å Î¨∏Ïùò ?ëÏàò</Heading>
            <Text style={headerSubStyle}>
              {new Date(submittedAt).toLocaleString("ko-KR")}
            </Text>
          </Section>

          {/* Body */}
          <Section style={sectionStyle}>
            <Row label="?¨ÏóÖ?•Î™Ö" value={companyName} />
            <Row label="?åÏÜç?Ä" value={department} />
            <Row label="?¥Îãπ?êÎ™Ö" value={contactName} />
            <Row label="?¥Î©î?? value={email} />
            <Row label="?ÑÌôîÎ≤àÌò∏" value={phone} />
            <Row
              label="?òÍ±∞ ?•ÏÜå"
              value={addressDetail ? `${address} ${addressDetail}` : address}
            />
            <Row label="?êÍ∏∞Î¨?Ï¢ÖÎ•ò" value={wasteTypes.join(", ")} />
            <Row label="?òÍ±∞ ?îÏ≤≠?? value={collectionDate || "ÎØ∏Ï???} />
            <Row label="?êÍ∏∞Î¨??òÎüâ" value={quantity || "ÎØ∏ÏûÖ??} />
            {message && <Row label="Í∏∞Ì? Î¨∏Ïùò?¨Ìï≠" value={message} />}
            <Row label="?¨ÏßÑ/?úÎ•ò Ï≤®Î?" value={hasPhotos ? "?àÏùå" : "?ÜÏùå"} />
            <Row
              label="ÎßàÏ????òÏã† ?ôÏùò"
              value={marketingConsent ? "?ôÏùò" : "ÎØ∏Îèô??}
            />
          </Section>

          <Hr style={hrStyle} />

          <Section style={sectionStyle}>
            <Link href={`${baseUrl}/inquiries/${inquiryId}`} style={buttonStyle}>
              Í¥ÄÎ¶¨Ïûê ?Ä?úÎ≥¥?úÏóê???ïÏù∏?òÍ∏∞
            </Link>
          </Section>

          <Hr style={hrStyle} />

          <Text style={footerStyle}>
            Î¨∏Ïùò ID: {inquiryId} ¬∑ ?ÑÎ??†Ïï§?ÑÏù¥ ?¥Î? ?úÏä§??          </Text>
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
  backgroundColor: "#0C5F6B",
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
