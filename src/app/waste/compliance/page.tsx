"use client";

import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

const checklistItems = [
  { id: 'c1', label: "올바로시스템 기초정보 사전 등록 및 확인" },
  { id: 'c2', label: "적법한 허가를 받은 수집·운반 및 처리업체와 계약 체결" },
  { id: 'c3', label: "지정폐기물 보관시설(전용창고 등) 법정 기준 완벽 충족" },
  { id: 'c4', label: "법정 보관기간(일반 지정폐기물 45일, 의료폐기물 등 예외) 준수" },
  { id: 'c5', label: "폐기물 배출 전 전자인계서(올바로시스템) 확정/예약 작성 완료" },
  { id: 'c6', label: "성상이 다른 지정폐기물 및 일반폐기물과 철저히 구분하여 보관" },
  { id: 'c7', label: "폐기물 관리대장 기록 및 법정 기간(3년) 보존" }
];

const penaltyData = [
  { action: "무단 투기·매립·소각", penalty: "7년 이하 징역 또는 7천만원 이하 벌금", severity: "bg-red-600/10 text-red-700 border-red-200" },
  { action: "무허가 또는 부적격 업자에게 위탁", penalty: "5년 이하 징역 또는 5천만원 이하 벌금", severity: "bg-red-500/10 text-red-700 border-red-100" },
  { action: "전자인계서 미작성 또는 허위 작성", penalty: "2년 이하 징역 또는 2천만원 이하 벌금", severity: "bg-red-400/10 text-red-700 border-red-50" },
  { action: "보관기간 위반 및 보관기준 미준수", penalty: "1천만원 이하 과태료 및 행정처분", severity: "bg-orange-100 text-orange-800 border-orange-50" },
  { action: "폐기물 관리대장 미작성 및 미보존", penalty: "300만원 이하 과태료", severity: "bg-yellow-50 text-yellow-800 border-yellow-50" }
];

export default function WasteCompliancePage() {
  const [activeTab, setActiveTab] = useState<'checklist' | 'penalty'>('checklist');
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const handleCheck = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  const getResultBox = () => {
    const count = checkedItems.size;
    if (count === 7) {
      return {
        bg: 'bg-green-50 border-green-200',
        icon: <CheckCircle2 className="w-8 h-8 text-green-600" />,
        title: "완벽합니다!",
        text: "지정폐기물 관련 주요 법규를 완벽히 준수하고 있습니다. 앞으로도 철저한 관리를 부탁드립니다.",
        textColor: 'text-green-800'
      };
    } else if (count >= 5) {
      return {
        bg: 'bg-yellow-50 border-yellow-200',
        icon: <AlertCircle className="w-8 h-8 text-yellow-600" />,
        title: "주의가 필요합니다.",
        text: "법규 위반 소지가 있습니다. 미체크 항목을 즉시 확인하고 보완 조치를 취해주세요.",
        textColor: 'text-yellow-800'
      };
    } else {
      return {
        bg: 'bg-red-50 border-red-200',
        icon: <XCircle className="w-8 h-8 text-red-600" />,
        title: "위험합니다. 즉시 점검이 필요합니다.",
        text: "다수의 법규 미준수 사항이 발견되었습니다. 강력한 행정처분 및 벌금 대상이 될 수 있으니 긴급 조치를 바랍니다.",
        textColor: 'text-red-800'
      };
    }
  };

  const result = getResultBox();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 animate-fade-in-up">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-4xl font-bold mb-4 text-gray-900">자가점검 및 벌칙사항</h2>
        <p className="text-lg text-gray-600">위반 시 강력한 처벌이 따르므로 주기적인 점검이 필수적입니다.</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-full p-1 shadow-sm border inline-flex">
          <button 
            onClick={() => setActiveTab('checklist')}
            className={`px-6 md:px-8 py-3 rounded-full text-base md:text-lg font-bold transition-colors ${activeTab === 'checklist' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
          >
            자가점검 체크리스트
          </button>
          <button 
            onClick={() => setActiveTab('penalty')}
            className={`px-6 md:px-8 py-3 rounded-full text-base md:text-lg font-bold transition-colors ${activeTab === 'penalty' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
          >
            주요 위반 벌칙
          </button>
        </div>
      </div>

      {/* Tab 1: 자가점검 체크리스트 */}
      {activeTab === 'checklist' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-10">
          <div className="mb-6 pb-6 border-b border-gray-100 flex justify-between items-end">
            <h3 className="text-xl font-bold text-gray-900">배출자 필수 점검 항목</h3>
            <span className="text-primary font-bold">{checkedItems.size} / 7 완료</span>
          </div>

          <div className="space-y-4 mb-10">
            {checklistItems.map((item) => (
              <label 
                key={item.id} 
                className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${checkedItems.has(item.id) ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white hover:border-primary/30'}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${checkedItems.has(item.id) ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                    {checkedItems.has(item.id) && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={checkedItems.has(item.id)} 
                  onChange={() => handleCheck(item.id)} 
                />
                <span className={`ml-4 text-lg md:text-xl font-medium ${checkedItems.has(item.id) ? 'text-gray-900' : 'text-gray-600'}`}>
                  {item.label}
                </span>
              </label>
            ))}
          </div>

          {/* Result Box */}
          <div className={`p-6 rounded-xl border-2 flex items-start gap-4 transition-colors duration-500 ${result.bg}`}>
            <div className="shrink-0 pt-1">
              {result.icon}
            </div>
            <div>
              <h4 className={`text-xl font-bold mb-2 ${result.textColor}`}>{result.title}</h4>
              <p className={`${result.textColor} opacity-90 leading-relaxed font-medium`}>{result.text}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: 벌칙사항 테이블 */}
      {activeTab === 'penalty' && (
        <div className="animate-fade-in-up">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="py-4 px-6 font-bold w-1/2">주요 위반 행위</th>
                  <th className="py-4 px-6 font-bold w-1/2">법정 벌칙 및 과태료</th>
                </tr>
              </thead>
              <tbody>
                {penaltyData.map((item, idx) => (
                  <tr key={idx} className={`border-b last:border-b-0 ${item.severity}`}>
                    <td className="py-5 px-6 font-bold text-lg border-r border-white/20">{item.action}</td>
                    <td className="py-5 px-6 font-bold text-lg">{item.penalty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-xl flex gap-3 text-sm text-gray-500 border border-gray-200">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>
              ※ 본 벌칙 사항은 「폐기물관리법」 기준을 축약하여 안내한 것으로, 실제 위반 사례의 세부 요건과 양형 기준에 따라 형량이나 과태료 금액이 다르게 적용될 수 있습니다. 법적 구속력을 갖는 유권해석의 근거로 사용할 수 없습니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}



