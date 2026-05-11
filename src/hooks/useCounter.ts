"use client";

import { useState, useEffect } from "react";

/** 뷰포트 진입 시 0→end 카운트업 훅 */
export function useCounter(end: number, duration = 1400, active = false) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    setValue(0);
    let startTime: number | null = null;

    const step = (ts: number) => {
      if (startTime === null) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      // easeOutQuart — 처음엔 빠르게, 끝에서 자연스럽게 감속
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(Math.round(eased * end));
      if (progress < 1) requestAnimationFrame(step);
      else setValue(end);
    };

    requestAnimationFrame(step);
  }, [active, end, duration]);

  return value;
}
