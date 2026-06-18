import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import path from "path";
import { COMPANY } from "@/lib/constants";
import type { Quotation } from "@/lib/actions/quotes";

// 서버에서만 실행. Next.js 클라이언트 번들 제외
Font.register({
  family: "NanumGothic",
  fonts: [
    {
      src: path.join(process.cwd(), "public", "fonts", "NanumGothic-Regular.ttf"),
      fontWeight: 400,
    },
    {
      src: path.join(process.cwd(), "public", "fonts", "NanumGothic-Bold.ttf"),
      fontWeight: 700,
    },
  ],
});

const S = StyleSheet.create({
  page: {
    fontFamily: "NanumGothic",
    fontSize: 9,
    color: "#1A1A1A",
    padding: "30 36",
    lineHeight: 1.5,
  },

  // ─── 헤더 ─────────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 2,
    borderBottomColor: "#0C5F6B",
    paddingBottom: 8,
    marginBottom: 12,
  },
  headerLeft: { gap: 2 },
  companyName: { fontSize: 13, fontWeight: 700, color: "#0C5F6B" },
  companySubtitle: { fontSize: 8, color: "#666" },
  docTitle: { fontSize: 22, fontWeight: 700, color: "#0C5F6B", textAlign: "right" },
  quoteNum: { fontSize: 8.5, color: "#666", textAlign: "right", marginTop: 2 },

  // ─── 정보 행 ─────────────────────────────────────────
  infoRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  infoBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 4,
    padding: "8 10",
  },
  infoBoxTitle: {
    fontSize: 7.5,
    fontWeight: 700,
    color: "#0C5F6B",
    textTransform: "uppercase",
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#E8F5F6",
    paddingBottom: 3,
  },
  infoField: { flexDirection: "row", marginBottom: 2 },
  infoLabel: { width: 48, color: "#666", fontSize: 8.5 },
  infoValue: { flex: 1, fontWeight: 700, fontSize: 8.5 },

  // ─── 항목 테이블 ─────────────────────────────────────
  tableTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: "#0C5F6B",
    marginBottom: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0C5F6B",
    borderRadius: 2,
    paddingVertical: 5,
    paddingHorizontal: 6,
    marginBottom: 1,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  tableRowEven: { backgroundColor: "#F8FBFB" },
  th: { color: "#fff", fontWeight: 700, fontSize: 8.5 },
  td: { fontSize: 8.5 },
  colNo:    { width: 24 },
  colName:  { flex: 1 },
  colUnit:  { width: 36, textAlign: "center" },
  colQty:   { width: 40, textAlign: "right" },
  colPrice: { width: 58, textAlign: "right" },
  colAmt:   { width: 62, textAlign: "right" },

  // ─── 합계 ─────────────────────────────────────────
  summarySection: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  summaryBox: {
    width: 200,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  summaryLabel: { fontSize: 8.5, color: "#666" },
  summaryValue: { fontSize: 8.5 },
  summaryTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#0C5F6B",
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  summaryTotalLabel: { fontSize: 9, fontWeight: 700, color: "#fff" },
  summaryTotalValue: { fontSize: 9, fontWeight: 700, color: "#fff" },

  // ─── 하단 ─────────────────────────────────────────
  footer: {
    marginTop: 16,
    flexDirection: "row",
    gap: 12,
  },
  notesBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 4,
    padding: "8 10",
    minHeight: 60,
  },
  notesTitle: { fontSize: 8, fontWeight: 700, color: "#666", marginBottom: 4 },
  notesText: { fontSize: 8.5, color: "#333", lineHeight: 1.6 },
  sealBox: {
    width: 130,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 4,
    padding: "8 10",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  sealTitle: { fontSize: 8, color: "#666" },
  sealCompany: { fontSize: 9, fontWeight: 700, color: "#0C5F6B" },
  sealCeo: { fontSize: 8.5, color: "#333" },
  sealRegNum: { fontSize: 7.5, color: "#666" },
  sealTel: { fontSize: 7.5, color: "#666" },

  pageFooter: {
    position: "absolute",
    bottom: 20,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingTop: 6,
  },
  pageFooterText: { fontSize: 7, color: "#999" },
});

function fmt(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

interface QuotePdfProps {
  quote: Quotation;
  issuedAt?: string;
}

export function QuotePdf({ quote, issuedAt }: QuotePdfProps) {
  const issued = issuedAt ?? new Date().toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" });

  return (
    <Document title={`견적서 ${quote.quote_number}`} author={COMPANY.name}>
      <Page size="A4" style={S.page}>
        {/* 헤더 */}
        <View style={S.header}>
          <View style={S.headerLeft}>
            <Text style={S.companyName}>{COMPANY.name}</Text>
            <Text style={S.companySubtitle}>지정폐기물 수거·운반 전문</Text>
          </View>
          <View>
            <Text style={S.docTitle}>견 적 서</Text>
            <Text style={S.quoteNum}>No. {quote.quote_number}</Text>
          </View>
        </View>

        {/* 수신/발신 정보 */}
        <View style={S.infoRow}>
          {/* 수신 */}
          <View style={S.infoBox}>
            <Text style={S.infoBoxTitle}>수신처</Text>
            <View style={S.infoField}>
              <Text style={S.infoLabel}>사업장명</Text>
              <Text style={S.infoValue}>{quote.company_name} 귀중</Text>
            </View>
            <View style={S.infoField}>
              <Text style={S.infoLabel}>담당자</Text>
              <Text style={S.infoValue}>{quote.contact_name} 님</Text>
            </View>
            <View style={S.infoField}>
              <Text style={S.infoLabel}>연락처</Text>
              <Text style={S.infoValue}>{quote.phone}</Text>
            </View>
            {quote.address && (
              <View style={S.infoField}>
                <Text style={S.infoLabel}>주소</Text>
                <Text style={S.infoValue}>{quote.address}</Text>
              </View>
            )}
          </View>

          {/* 발신 */}
          <View style={S.infoBox}>
            <Text style={S.infoBoxTitle}>견적 정보</Text>
            <View style={S.infoField}>
              <Text style={S.infoLabel}>발행일</Text>
              <Text style={S.infoValue}>{issued}</Text>
            </View>
            {quote.valid_until && (
              <View style={S.infoField}>
                <Text style={S.infoLabel}>유효기간</Text>
                <Text style={S.infoValue}>{new Date(quote.valid_until).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}</Text>
              </View>
            )}
            {quote.collection_date && (
              <View style={S.infoField}>
                <Text style={S.infoLabel}>수거예정일</Text>
                <Text style={S.infoValue}>{new Date(quote.collection_date).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}</Text>
              </View>
            )}
            <View style={S.infoField}>
              <Text style={S.infoLabel}>담당자</Text>
              <Text style={S.infoValue}>{quote.created_by_name ?? COMPANY.name}</Text>
            </View>
          </View>
        </View>

        {/* 항목 테이블 */}
        <Text style={S.tableTitle}>견적 항목</Text>
        <View style={S.tableHeader}>
          <Text style={[S.th, S.colNo]}>No.</Text>
          <Text style={[S.th, S.colName]}>폐기물 종류</Text>
          <Text style={[S.th, S.colUnit]}>단위</Text>
          <Text style={[S.th, S.colQty]}>수량</Text>
          <Text style={[S.th, S.colPrice]}>단가(원)</Text>
          <Text style={[S.th, S.colAmt]}>금액(원)</Text>
        </View>
        {quote.items.map((item, i) => (
          <View key={i} style={[S.tableRow, i % 2 === 1 ? S.tableRowEven : {}]}>
            <Text style={[S.td, S.colNo]}>{i + 1}</Text>
            <Text style={[S.td, S.colName]}>{item.waste_type}</Text>
            <Text style={[S.td, S.colUnit]}>{item.unit}</Text>
            <Text style={[S.td, S.colQty]}>{item.quantity.toLocaleString("ko-KR")}</Text>
            <Text style={[S.td, S.colPrice]}>{item.unit_price.toLocaleString("ko-KR")}</Text>
            <Text style={[S.td, S.colAmt]}>{item.amount.toLocaleString("ko-KR")}</Text>
          </View>
        ))}

        {/* 합계 */}
        <View style={S.summarySection}>
          <View style={S.summaryBox}>
            <View style={S.summaryRow}>
              <Text style={S.summaryLabel}>공급가액</Text>
              <Text style={S.summaryValue}>{fmt(quote.subtotal)}</Text>
            </View>
            <View style={S.summaryRow}>
              <Text style={S.summaryLabel}>부가세 (10%)</Text>
              <Text style={S.summaryValue}>{fmt(quote.tax)}</Text>
            </View>
            <View style={S.summaryTotal}>
              <Text style={S.summaryTotalLabel}>합 계</Text>
              <Text style={S.summaryTotalValue}>{fmt(quote.total)}</Text>
            </View>
          </View>
        </View>

        {/* 하단: 비고 + 직인 */}
        <View style={S.footer}>
          <View style={S.notesBox}>
            <Text style={S.notesTitle}>비고</Text>
            <Text style={S.notesText}>
              {quote.notes ?? "위와 같이 견적서를 제출합니다. 본 견적서는 지정폐기물 수거·운반에 한하며, 현장 여건에 따라 변동될 수 있습니다."}
            </Text>
          </View>
          <View style={S.sealBox}>
            <Text style={S.sealTitle}>공급자</Text>
            <Text style={S.sealCompany}>{COMPANY.name}</Text>
            <Text style={S.sealCeo}>대표: {COMPANY.ceo} (인)</Text>
            <Text style={S.sealRegNum}>사업자번호: {COMPANY.businessNumber}</Text>
            <Text style={S.sealTel}>Tel: {COMPANY.tel}</Text>
          </View>
        </View>

        {/* 페이지 하단 */}
        <View style={S.pageFooter} fixed>
          <Text style={S.pageFooterText}>{COMPANY.name} · {COMPANY.address}</Text>
          <Text style={S.pageFooterText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
