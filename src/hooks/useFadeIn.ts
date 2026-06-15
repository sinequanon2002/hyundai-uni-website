"use client";

import { useEffect, useRef, useState } from "react";

export function useFadeIn(threshold = 0.1, delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      {
        threshold,
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, delay]);

  // 주의: 반환 객체는 컴포넌트에서 {...fadeIn}으로 DOM 요소에 spread되므로
  // ref·className 등 DOM 유효 속성만 포함한다. (isVisible은 className으로만 내부 반영)
  return {
    ref,
    className: `transition-all duration-700 ease-out transform ${
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
    }`,
  };
}
