"use client";

import { useState } from 'react';
import { X, FileText } from 'lucide-react';

const CERTIFICATIONS = [
  {
    id: 1,
    title: "폐기물 수집·운반업 허가증",
    agency: "대구지방환경청",
    licenseNo: "제 대구수집 130호",
    issueDate: "2026. 04. 13",
    detail: [
      { label: "허가번호", value: "제 대구수집 130호" },
      { label: "상호", value: "주식회사 현대유앤아이" },
      { label: "대표자", value: "양 솔 빈" },
      { label: "영업대상 폐기물", value: "지정폐기물(액상)" },
      { label: "영업구역", value: "전 국" },
      { label: "최초 허가일", value: "2025. 07. 21" },
      { label: "발급일", value: "2026. 04. 13" },
    ],
  },
  {
    id: 2,
    title: "사업자등록증",
    agency: "경산세무서",
    licenseNo: "857-87-03200",
    issueDate: "2025. 08. 28",
    detail: [
      { label: "등록번호", value: "857-87-03200" },
      { label: "법인명", value: "주식회사 현대유앤아이" },
      { label: "대표자", value: "양솔빈" },
      { label: "개업연월일", value: "2024. 02. 14" },
      { label: "법인등록번호", value: "174811-0129208" },
      { label: "사업장 소재지", value: "경상북도 경산시 하양읍 하양로 34, 2층 비-04호" },
      { label: "사업의 종류", value: "폐기물수집·운반 / 구조물 철거 및 해체업 / 탱크청소업" },
      { label: "발급일", value: "2025. 08. 28" },
    ],
  },
];

export function CertificationCards() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const activeCert = CERTIFICATIONS.find((c) => c.id === selectedId);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {CERTIFICATIONS.map((cert) => (
          <div
            key={cert.id}
            className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden group cursor-pointer hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
            onClick={() => setSelectedId(cert.id)}
          >
            <div className="w-full aspect-[4/3] bg-neutral-50 relative overflow-hidden flex flex-col items-center justify-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                <FileText size={40} />
              </div>
              <span className="text-neutral-400 text-sm font-medium">{cert.licenseNo}</span>
              <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                <span className="text-white font-medium px-6 py-2 border-2 border-white rounded-full">상세 보기</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-primary transition-colors">{cert.title}</h3>
              <div className="flex justify-between items-center text-sm text-neutral-500">
                <span>{cert.agency}</span>
                <span>{cert.issueDate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedId !== null && activeCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedId(null)}
          />
          <div className="relative bg-white rounded-sm shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">{activeCert.title}</h2>
                <p className="text-sm text-neutral-500 mt-1">{activeCert.agency}</p>
              </div>
              <button
                className="p-2 hover:bg-neutral-100 text-neutral-500 rounded-full transition-colors"
                onClick={() => setSelectedId(null)}
              >
                <X size={20} />
              </button>
            </div>
            <dl className="p-6 space-y-0 divide-y divide-gray-100">
              {activeCert.detail.map((row) => (
                <div key={row.label} className="flex py-3 gap-4">
                  <dt className="w-36 flex-shrink-0 text-sm font-semibold text-neutral-500">{row.label}</dt>
                  <dd className="text-sm text-neutral-900 break-keep">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </>
  );
}
