const TZ = { timeZone: "Asia/Seoul" } as const;

export function fmtDate(date: string | Date | null | undefined): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("ko-KR", TZ);
}

export function fmtDateTime(date: string | Date | null | undefined): string {
  if (!date) return "-";
  return new Date(date).toLocaleString("ko-KR", TZ);
}

export function fmtDateShort(date: string | Date | null | undefined): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("ko-KR", {
    ...TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
