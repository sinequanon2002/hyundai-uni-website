"use client";

import { useState } from 'react';
import { PageBanner } from '@/components/ui/PageBanner';
import { SubNav } from '@/components/ui/SubNav';
// 모달을 우측 상단 X 버튼으로 닫기 위해 아이콘 사용
import { X } from 'lucide-react';

const CERTIFICATIONS = [
  {
    id: 1,
    title: "지정폐기물 수집·운반업 허가증",
    agency: "낙동강유역환경청",
    date: "2020. 00. 00",
    image: null
  },
  {
    id: 2,
    title: "사업장폐기물 수집·운반업 허가증",
    agency: "해당 지자체",
    date: "2018. 00. 00",
    image: null
  },
  {
    id: 3,
    title: "사업자등록증",
    agency: "국세청",
    date: "2015. 00. 00",
    image: null
  },
  {
    id: 4,
    title: "ISO 14001 인증서",
    agency: "인증기관",
    date: "2024. 00. 00",
    image: null
  }
];

export default function CertificationsPage() {
  const [selectedCert, setSelectedCert] = useState<number | null>(null);

  const activeCert = CERTIFICATIONS.find(c => c.id === selectedCert);

  return (
    <main className="min-h-screen bg-neutral-50 pb-24">
      <PageBanner title="회사소개" subtitle="Licenses & Certifications" />
      <SubNav />
      
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <span className="text-primary font-bold tracking-wider text-sm mb-2 block">CERTIFICATIONS</span>
          <h2 className="text-3xl font-bold text-neutral-900">허가 및 인증 현황</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
          {CERTIFICATIONS.map((cert) => (
            <div 
              key={cert.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group cursor-pointer hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
              onClick={() => setSelectedCert(cert.id)}
            >
              {/* Image Placeholder */}
              <div className="w-full aspect-[4/3] bg-gray-100 relative overflow-hidden flex flex-col items-center justify-center p-8">
                <div className="w-3/4 h-full border-4 border-gray-200 border-dashed rounded opacity-70 flex items-center justify-center bg-white group-hover:bg-primary/5 transition-colors">
                  <span className="text-gray-400 font-medium text-sm">Certificate Image</span>
                </div>
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                  <span className="text-white font-medium px-6 py-2 border-2 border-white rounded-full">자세히 보기</span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-primary transition-colors line-clamp-1">{cert.title}</h3>
                <div className="flex justify-between items-center text-sm text-neutral-500">
                  <span>{cert.agency}</span>
                  <span>{cert.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedCert !== null && activeCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedCert(null)}
          ></div>
          <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col z-10 animate-fade-in-up">
            <button 
              className="absolute top-4 right-4 p-2 bg-neutral-100/80 hover:bg-neutral-200 text-neutral-600 rounded-full transition-colors z-20"
              onClick={() => setSelectedCert(null)}
            >
              <X size={20} />
            </button>
            <div className="w-full aspect-[1/1.4] sm:aspect-[4/5] bg-gray-100 relative flex items-center justify-center p-8">
               <div className="w-full h-full border border-gray-300 bg-white shadow-sm flex flex-col items-center justify-center p-8">
                 <h2 className="text-2xl font-bold mb-4 font-serif text-center">{activeCert.title}</h2>
                 <p className="text-neutral-500 mb-12">발급일: {activeCert.date}</p>
                 <div className="mt-auto">
                   <p className="text-xl font-bold font-serif">{activeCert.agency}</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}



