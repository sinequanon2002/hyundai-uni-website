"use client";

import { useFadeIn } from "@/hooks/useFadeIn";
import { Building2, Hospital, Factory, Landmark } from "lucide-react";

interface Client {
  category: string;
  icon: React.ReactNode;
  items: string[];
}

const CLIENT_CATEGORIES: Client[] = [
  {
    category: "?€ê¸°ì—…",
    icon: <Building2 size={24} />,
    items: [
      "?¼ì„±?„ì ?‘ë ¥??,
      "LG?”í•™ ?‘ë ¥??,
      "SK?´ë…¸ë² ì´??ê³„ì—´",
      "?„ë??ë™ì°?ê·¸ë£¹",
    ],
  },
  {
    category: "ì¤‘ê²¬ê¸°ì—…",
    icon: <Factory size={24} />,
    items: [
      "ê²½ë¶ ?Œì¬ ?œì¡°?…ì²´ 15ê³?",
      "?€êµ??Œì¬ ?”í•™?…ì²´ 8ê³?",
      "ê²½ì‚° ?Œì¬ ?°ì—…?¨ì? ?…ì£¼??,
      "êµ¬ë? ?Œì¬ ?„ìë¶€?ˆì—…ì²?,
    ],
  },
  {
    category: "?˜ë£Œê¸°ê?",
    icon: <Hospital size={24} />,
    items: [
      "?€êµ??Œì¬ ?€?•ë³‘??3ê³?,
      "ê²½ë¶ ?Œì¬ ì¢…í•©ë³‘ì› 5ê³?",
      "ì§€???˜ì›Â·?´ë¦¬??,
      "?˜ë£Œ?ê¸°ë¬??„ë¬¸ ì²˜ë¦¬",
    ],
  },
  {
    category: "ê³µê³µê¸°ê?",
    icon: <Landmark size={24} />,
    items: [
      "ê²½ë¶?„ì²­ ?°í•˜ê¸°ê?",
      "ê²½ì‚°??ê³µê³µ?œì„¤",
      "êµ?¦½?€?™êµ ?°êµ¬??,
      "ê³µê³µ ?°êµ¬ê¸°ê?",
    ],
  },
];

export function ClientsSection() {
  const fadeInHeader = useFadeIn();

  return (
    <section className="py-20 md:py-28 bg-white relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231F4E79' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="container mx-auto px-4 md:px-8 relative">
        {/* Header */}
        <div {...fadeInHeader} className={`text-center mb-16 ${fadeInHeader.className}`}>
          <h3 className="text-sm font-bold text-accent tracking-widest uppercase mb-3">
            Trusted Partners
          </h3>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 leading-tight mb-4">
            êµ?‚´ ? ìˆ˜ ê¸°ì—…Â·ê¸°ê???br className="md:hidden" /> ? íƒ???ŒíŠ¸??          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            ?€ê¸°ì—…ë¶€??ê³µê³µê¸°ê?ê¹Œì?, ?¤ì–‘???°ì—…êµ°ì˜ ê³ ê°?¬ê? ?„ë?? ì•¤?„ì´??br className="hidden md:inline" />
            ?„ë¬¸?ì´ê³??¬ëª…???ê¸°ë¬?ì²˜ë¦¬ ?œë¹„?¤ë? ? ë¢°?˜ê³  ?ˆìŠµ?ˆë‹¤.
          </p>
        </div>

        {/* Client Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CLIENT_CATEGORIES.map((cat, index) => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const fadeCard = useFadeIn(0.1, index * 120);
            return (
              <div
                key={index}
                {...fadeCard}
                className={`group p-6 rounded-2xl border border-neutral-100 bg-white hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 ${fadeCard.className}`}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  {cat.icon}
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-4">
                  {cat.category}
                </h3>
                <ul className="space-y-2.5">
                  {cat.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Trust badge */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-neutral-50 rounded-full border border-neutral-100">
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: ['#0C5F6B', '#0E9E7E', '#10B981', '#0C5F6B'][i] }}
                >
                  {['??, 'L', 'S', '??][i]}
                </div>
              ))}
            </div>
            <span className="text-sm text-neutral-600 font-medium">
              <span className="text-primary font-bold">300+</span> ê¸°ì—…Â·ê¸°ê?ê³??¨ê»˜?©ë‹ˆ??            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
