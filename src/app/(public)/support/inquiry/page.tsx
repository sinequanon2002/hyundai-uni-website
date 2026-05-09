"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Script from "next/script";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageBanner } from "@/components/ui/PageBanner";
import { SubNav, SUPPORT_SUBNAV_ITEMS } from "@/components/ui/SubNav";
import { COMPANY } from "@/lib/constants";
import {
  inquiryFormSchema,
  type InquiryFormValues,
  WASTE_CATEGORIES,
} from "@/lib/schemas/inquiry";
import { submitInquiry } from "@/lib/actions/inquiry";
import {
  Search,
  Paperclip,
  X,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  ChevronDown,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ?€?€?€ Daum Postcode ?€??? ì–¸ ?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€
declare global {
  interface Window {
    daum: {
      Postcode: new (config: {
        oncomplete: (data: {
          roadAddress: string;
          jibunAddress: string;
          zonecode: string;
        }) => void;
      }) => { open: () => void };
    };
  }
}

// ?€?€?€ ê°œì¸?•ë³´ ?„ë¬¸ ?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€
const PRIVACY_FULL_TEXT = `[ê°œì¸?•ë³´ ?˜ì§‘Â·?´ìš© ?™ì˜??

1. ?˜ì§‘ ??ª©: ?¬ì—…?¥ëª…, ?Œì†?€, ?´ë‹¹?ëª…, ?°ë½ì²? ?´ë©”?? ?˜ê±° ?¥ì†Œ, ?ê¸°ë¬?ì¢…ë¥˜, ì²¨ë? ?¬ì§„

2. ?˜ì§‘ ëª©ì : ê²¬ì  ë¬¸ì˜ ?‘ìˆ˜ ë°??ë‹´, ?œë¹„???ˆë‚´

3. ë³´ìœ  ê¸°ê°„: ë¬¸ì˜ ?‘ìˆ˜?¼ë¡œë¶€??1?„ê°„ ë³´ìœ  ???Œê¸°
   (?? ê´€ê³?ë²•ë ¹???°ë¼ ë³´ì¡´???„ìš”??ê²½ìš° ?´ë‹¹ ê¸°ê°„ê¹Œì? ë³´ì¡´)

4. ?™ì˜ë¥?ê±°ë???ê¶Œë¦¬ê°€ ?ˆìœ¼?? ê±°ë? ??ê²¬ì  ë¬¸ì˜ ?‘ìˆ˜ê°€ ?´ë ¤?????ˆìŠµ?ˆë‹¤.

???´ìš©???•ì¸?˜ì??¼ë©°, ê°œì¸?•ë³´ ?˜ì§‘Â·?´ìš©???™ì˜?©ë‹ˆ??`;

const MARKETING_FULL_TEXT = `[ë§ˆì????˜ì‹  ?™ì˜??

?˜ì§‘ ??ª©: ?´ë©”?? ?„í™”ë²ˆí˜¸
?˜ì‹  ?´ìš©: ?œë¹„???ˆë‚´, ?´ë²¤?? ?…ê³„ ?•ë³´
?˜ì‹  ì±„ë„: ?´ë©”?? ë¬¸ì(SMS)
ë³´ìœ  ê¸°ê°„: ?™ì˜ ì² íšŒ ?œê¹Œì§€

?™ì˜??? íƒ ?¬í•­?´ë©°, ?™ì˜ ê±°ë? ?œì—???œë¹„???´ìš©??ë¶ˆì´?µì´ ?†ìŠµ?ˆë‹¤.`;

interface UploadedFile {
  name: string;
  url: string;
}

export default function InquiryPage() {
  const [isPending, startTransition] = useTransition();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [marketingModalOpen, setMarketingModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [wasteSearch, setWasteSearch] = useState("");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues: {
      wasteTypes: [],
      photoUrls: [],
      marketingConsent: false,
      notificationMethod: "email",
    },
  });

  const addressValue = watch("address");

  // ?€?€?€ ?„í™”ë²ˆí˜¸ ?ë™ ?˜ì´???€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€
  const formatPhone = (value: string) => {
    const n = value.replace(/[^\d]/g, "");
    if (n.length <= 3) return n;
    if (n.startsWith("02")) {
      if (n.length <= 6) return `${n.slice(0, 2)}-${n.slice(2)}`;
      if (n.length <= 10) return `${n.slice(0, 2)}-${n.slice(2, 6)}-${n.slice(6)}`;
      return `${n.slice(0, 2)}-${n.slice(2, 6)}-${n.slice(6, 10)}`;
    }
    if (n.length <= 7) return `${n.slice(0, 3)}-${n.slice(3)}`;
    if (n.length <= 10) return `${n.slice(0, 3)}-${n.slice(3, 6)}-${n.slice(6)}`;
    return `${n.slice(0, 3)}-${n.slice(3, 7)}-${n.slice(7, 11)}`;
  };

  // ?€?€?€ ì£¼ì†Œ ê²€???€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€
  const handleAddressSearch = () => {
    if (typeof window.daum === "undefined") {
      alert("ì£¼ì†Œ ê²€???œë¹„?¤ë? ë¶ˆëŸ¬?¤ëŠ” ì¤‘ì…?ˆë‹¤. ? ì‹œ ???¤ì‹œ ?œë„?´ì£¼?¸ìš”.");
      return;
    }
    new window.daum.Postcode({
      oncomplete: (data) => {
        setValue("address", data.roadAddress || data.jibunAddress, {
          shouldValidate: true,
        });
      },
    }).open();
  };

  // ?€?€?€ ?Œì¼ ?…ë¡œ???€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const remaining = 10 - uploadedFiles.length;
    if (remaining <= 0) {
      alert("ìµœë? 10ê°œì˜ ?Œì¼??ì²¨ë??????ˆìŠµ?ˆë‹¤.");
      return;
    }
    const toUpload = files.slice(0, remaining);

    setIsUploading(true);
    const results: UploadedFile[] = [];

    for (const file of toUpload) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/inquiry/upload", { method: "POST", body: fd });
        const json = await res.json();
        if (res.ok && json.url) {
          results.push({ name: file.name, url: json.url });
        } else {
          alert(`?Œì¼ ?…ë¡œ???¤íŒ¨: ${json.error ?? file.name}`);
        }
      } catch {
        alert(`?Œì¼ ?…ë¡œ??ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤: ${file.name}`);
      }
    }

    const updated = [...uploadedFiles, ...results];
    setUploadedFiles(updated);
    setValue("photoUrls", updated.map((f) => f.url));
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (idx: number) => {
    const updated = uploadedFiles.filter((_, i) => i !== idx);
    setUploadedFiles(updated);
    setValue("photoUrls", updated.map((f) => f.url));
  };

  // ?€?€?€ ???œì¶œ ?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€
  const onSubmit = handleSubmit((data) => {
    startTransition(async () => {
      const result = await submitInquiry(data);
      if (result.success) {
        setSubmittedEmail(data.email ?? "");
        setShowSuccessModal(true);
        reset();
        setUploadedFiles([]);
      } else {
        alert(result.error ?? "?‘ìˆ˜ ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤. ? ì‹œ ???¤ì‹œ ?œë„?´ì£¼?¸ìš”.");
      }
    });
  });

  // ?€?€?€ ê³µí†µ input ?¤í????€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€
  const inputCls = (hasError?: boolean) =>
    cn(
      "w-full border rounded-lg px-4 py-2.5 text-sm outline-none transition-colors",
      "focus:ring-2 focus:ring-[#0C5F6B]/25 focus:border-[#0C5F6B]",
      hasError
        ? "border-red-400 bg-red-50/30"
        : "border-gray-200 bg-white hover:border-gray-300"
    );

  const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";
  const errorCls = "text-xs text-red-500 mt-1";

  return (
    <>
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="lazyOnload"
      />

      <PageBanner
        title="ê²¬ì  ë¬¸ì˜"
        subtitle="ì§€?•íê¸°ë¬¼ ?˜ê±°Â·?´ë°˜ ê²¬ì ??ë¬¸ì˜?˜ì„¸??
        breadcrumb={["ê³ ê°ì§€??, "ê²¬ì  ë¬¸ì˜"]}
      />
      <SubNav items={SUPPORT_SUBNAV_ITEMS} current="/support/inquiry" />

      <section className="py-16 bg-[#F0FAFA]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* ?€?€ ì¢Œì¸¡ ?ˆë‚´ ?€?€ */}
            <aside className="lg:col-span-2 space-y-6">
              {/* ?°ë½ì²?ì¹´ë“œ */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-base font-bold text-gray-900 mb-4">
                  ì§ì ‘ ë¬¸ì˜?˜ê¸°
                </h3>
                <div className="space-y-3">
                  <a
                    href={`tel:${COMPANY.tel}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#0C5F6B]/10 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-[#0C5F6B]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">?„í™” ë¬¸ì˜</p>
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-[#0C5F6B] transition-colors">
                        {COMPANY.tel}
                      </p>
                    </div>
                  </a>
                  <a
                    href={`mailto:${COMPANY.email}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#0C5F6B]/10 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-[#0C5F6B]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">?´ë©”??ë¬¸ì˜</p>
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-[#0C5F6B] transition-colors">
                        {COMPANY.email}
                      </p>
                    </div>
                  </a>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#0C5F6B]/10 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-[#0C5F6B]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">?´ì˜?œê°„</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {COMPANY.businessHours}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ì²˜ë¦¬ ?ˆì°¨ */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-base font-bold text-gray-900 mb-4">
                  ì²˜ë¦¬ ?ˆì°¨
                </h3>
                <div className="space-y-3">
                  {[
                    { step: "01", title: "ë¬¸ì˜ ?‘ìˆ˜", desc: "?¨ë¼???‘ì‹ ?ëŠ” ?„í™”" },
                    { step: "02", title: "?„ì¥ ë°©ë¬¸ / ?ë‹´", desc: "?´ë‹¹??ì§ì ‘ ?°ë½" },
                    { step: "03", title: "ê²¬ì  ë°œì†¡", desc: "ë§ì¶¤ ê²¬ì ???´ë©”??ë°œì†¡" },
                  ].map(({ step, title, desc }, i, arr) => (
                    <div key={step} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full bg-[#0C5F6B] text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {step}
                        </div>
                        {i < arr.length - 1 && (
                          <div className="w-px h-6 bg-gray-200 mt-1" />
                        )}
                      </div>
                      <div className="pt-0.5">
                        <p className="text-sm font-semibold text-gray-800">
                          {title}
                        </p>
                        <p className="text-xs text-gray-400">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* ?€?€ ?°ì¸¡ ???€?€ */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  ê²¬ì  ë¬¸ì˜
                </h2>
                <p className="text-sm text-gray-400 mb-6">
                  ?„ë˜ ?•ë³´ë¥??œì¶œ?˜ì‹œë©? ë¹ ë¥¸ ?œì¼ ???°ë½?œë¦¬ê² ìŠµ?ˆë‹¤.
                </p>

                <form onSubmit={onSubmit} noValidate className="space-y-5">
                  {/* ?¬ì—…?¥ëª… + ?Œì†?€ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>
                        ?¬ì—…?¥ëª… <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("companyName")}
                        placeholder="?Œì‚¬ëª…ì„ ?…ë ¥?´ì£¼?¸ìš”"
                        className={inputCls(!!errors.companyName)}
                      />
                      {errors.companyName && (
                        <p className={errorCls}>{errors.companyName.message}</p>
                      )}
                    </div>
                    <div>
                      <label className={labelCls}>
                        ?Œì†?€{" "}
                        <span className="text-gray-400 font-normal text-xs">(? íƒ)</span>
                      </label>
                      <input
                        {...register("department")}
                        placeholder="?? ?˜ê²½?ˆì „?€"
                        className={inputCls(false)}
                      />
                    </div>
                  </div>

                  {/* ?´ë¦„ + ?„í™”ë²ˆí˜¸ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>
                        ?´ë‹¹?ëª… <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("contactName")}
                        placeholder="?´ë‹¹???±í•¨"
                        className={inputCls(!!errors.contactName)}
                      />
                      {errors.contactName && (
                        <p className={errorCls}>{errors.contactName.message}</p>
                      )}
                    </div>
                    <div>
                      <label className={labelCls}>
                        ?„í™”ë²ˆí˜¸ <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="tel"
                            placeholder="010-0000-0000"
                            onChange={(e) =>
                              field.onChange(formatPhone(e.target.value))
                            }
                            className={inputCls(!!errors.phone)}
                          />
                        )}
                      />
                      {errors.phone && (
                        <p className={errorCls}>{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  {/* ?´ë©”??(ê²¬ì  ê²°ê³¼ ?˜ì‹ ????? íƒ) */}
                  <div>
                    <label className={labelCls}>
                      <Mail className="inline w-4 h-4 mr-1 mb-0.5 text-[#0C5F6B]" />
                      ?´ë©”??" "}
                      <span className="text-gray-400 font-normal text-xs">(? íƒ)</span>
                    </label>
                    <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-2">
                      ?…ë ¥?˜ì‹œë©??‘ìˆ˜ ?•ì¸ ë°?ê²¬ì ?œë? ?´ë©”?¼ë¡œ ë°œì†¡?´ë“œë¦½ë‹ˆ??
                      ë¯¸ì…?????´ë‹¹?ê? ?„í™”ë¡??°ë½?œë¦½?ˆë‹¤.
                    </p>
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <EmailAutocomplete
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          hasError={!!errors.email}
                        />
                      )}
                    />
                    {errors.email && (
                      <p className={errorCls}>{errors.email.message}</p>
                    )}
                  </div>

                  {/* ?˜ê±° ?¥ì†Œ */}
                  <div>
                    <label className={labelCls}>
                      <MapPin className="inline w-4 h-4 mr-1 mb-0.5 text-[#0C5F6B]" />
                      ?˜ê±° ?¥ì†Œ{" "}
                      <span className="text-gray-400 font-normal text-xs">(? íƒ)</span>
                    </label>
                    <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-2 flex items-start gap-1.5">
                      <span className="shrink-0 mt-0.5">?’¡</span>
                      <span>
                        ?•í™•???˜ê±° ì§€??„ ?…ë ¥?˜ì‹œë©??´ë°˜ ê±°ë¦¬ë¥?ë°˜ì˜?????•í™•??ê²¬ì ???ˆë‚´?´ë“œë¦????ˆìŠµ?ˆë‹¤.
                        ì£¼ì†Œ ?…ë ¥?€ ?„ìˆ˜ê°€ ?„ë‹ˆë©? ë¯¸ì…?????´ë‹¹???°ë½ ???•ì¸?©ë‹ˆ??
                      </span>
                    </p>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={addressValue ?? ""}
                        placeholder="ì£¼ì†Œ ê²€??(? íƒ)"
                        className={cn(inputCls(false), "cursor-pointer flex-1 min-w-0")}
                        onClick={handleAddressSearch}
                      />
                      <button
                        type="button"
                        onClick={handleAddressSearch}
                        className="px-3 py-2.5 border border-gray-200 rounded-lg hover:border-[#0C5F6B] hover:text-[#0C5F6B] transition-colors shrink-0"
                        aria-label="ì£¼ì†Œ ê²€??
                      >
                        <Search className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      {...register("addressDetail")}
                      placeholder="?ì„¸ ì£¼ì†Œ (? íƒ)"
                      className={cn(inputCls(), "mt-2")}
                    />
                  </div>

                  {/* ?ê¸°ë¬?ì¢…ë¥˜ */}
                  <div>
                    <label className={labelCls}>
                      ?ê¸°ë¬?ì¢…ë¥˜ (ì¤‘ë³µ ? íƒ){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="?ê¸°ë¬?ëª…ì¹­ ê²€??(?? ?ìœ , ?¬ëŸ¬ì§€...)"
                        value={wasteSearch}
                        onChange={(e) => setWasteSearch(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0C5F6B]/20 transition-all"
                      />
                      {wasteSearch && (
                        <button
                          type="button"
                          onClick={() => setWasteSearch("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <Controller
                      name="wasteTypes"
                      control={control}
                      render={({ field }) => {
                        const filteredCategories = Object.entries(WASTE_CATEGORIES).filter(([major, minors]) => {
                          if (!wasteSearch) return true;
                          const s = wasteSearch.toLowerCase();
                          return major.toLowerCase().includes(s) || minors.some(m => m.toLowerCase().includes(s));
                        });

                        return (
                          <div className={cn("space-y-2 p-1", errors.wasteTypes && "border border-red-400 rounded-lg bg-red-50/30")}>
                            {filteredCategories.length === 0 ? (
                              <p className="text-center py-8 text-gray-400 text-sm italic">
                                ê²€??ê²°ê³¼ê°€ ?†ìŠµ?ˆë‹¤. ì§ì ‘ ?…ë ¥?˜ì‹œ?¤ë©´ 'ê¸°í?'ë¥?? íƒ??ì£¼ì„¸??
                              </p>
                            ) : (
                              filteredCategories.map(([major, minors]) => {
                                // ê²€?‰ì–´ê°€ ?ˆì„ ?? ?´ë‹¹ ì¹´í…Œê³ ë¦¬ê°€ ê²€?‰ì–´?€ ì§ì ‘ ë§¤ì¹­?˜ì? ?Šë”?¼ë„ 
                                // ?˜ìœ„ ?„ì´?œì´ ë§¤ì¹­?˜ë©´ ì¹´í…Œê³ ë¦¬ë¥?ê°•ì œë¡??•ì¥?´ì„œ ë³´ì—¬ì¤ë‹ˆ??
                                const s = wasteSearch.toLowerCase();
                                const isMajorMatch = major.toLowerCase().includes(s);
                                const matchingMinors = minors.filter(m => m.toLowerCase().includes(s));
                                
                                // ê²€??ì¤‘ì´ê³??˜ìœ„ ?„ì´?œì´ ë§¤ì¹­?˜ê±°?? ?´ë¦­?´ì„œ ?•ì¥??ê²½ìš°
                                const isExpanded = (wasteSearch && matchingMinors.length > 0) || expandedCategory === major;
                                const selectedCount = field.value.filter((v) => v.startsWith(`${major} - `) || v === major).length;

                                const isFeatured = major.startsWith("â­?);
                                return (
                                  <div
                                    key={major}
                                    className={cn(
                                      "border rounded-lg overflow-hidden bg-white",
                                      isFeatured
                                        ? "border-[#0C5F6B]/40 ring-1 ring-[#0C5F6B]/20"
                                        : "border-gray-200"
                                    )}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => setExpandedCategory(isExpanded ? null : major)}
                                      className={cn(
                                        "w-full flex items-center justify-between px-4 py-3 transition-colors",
                                        isFeatured
                                          ? isExpanded ? "bg-[#0C5F6B]/10" : "bg-[#0C5F6B]/5 hover:bg-[#0C5F6B]/10"
                                          : isExpanded ? "bg-[#F0FAFA]" : "hover:bg-gray-50",
                                        selectedCount > 0 && !isExpanded && !isFeatured && "border-l-4 border-l-[#0C5F6B]"
                                      )}
                                    >
                                      <span className={cn("font-semibold text-sm", isFeatured ? "text-[#0C5F6B]" : "text-gray-800")}>
                                        {major}
                                        {isFeatured && (
                                          <span className="ml-2 text-[10px] bg-[#0C5F6B] text-white px-2 py-0.5 rounded-full font-bold">
                                            ì§‘ì¤‘ ì²˜ë¦¬
                                          </span>
                                        )}
                                        {selectedCount > 0 && (
                                          <span className="ml-2 text-[#0C5F6B] bg-[#0C5F6B]/10 px-2 py-0.5 rounded-full text-xs">
                                            {selectedCount}ê°?? íƒ??
                                          </span>
                                        )}
                                      </span>
                                      <ChevronDown
                                        className={cn("w-4 h-4 transition-transform", isFeatured ? "text-[#0C5F6B]" : "text-gray-500", isExpanded && "rotate-180")}
                                      />
                                    </button>
                                    {isExpanded && (
                                      <div className="p-4 bg-white border-t border-gray-100 flex flex-wrap gap-2">
                                        {minors.map((minor) => {
                                          const valueStr = major === "ê¸°í?" ? "ê¸°í?" : `${major} - ${minor}`;
                                          const checked = field.value.includes(valueStr);
                                          // ê²€??ì¤‘ì¼ ??ë§¤ì¹­?˜ëŠ” ?„ì´?œë§Œ ê°•ì¡°?˜ê±°???„í„°ë§í•  ???ˆì?ë§? 
                                          // ?¬ê¸°?œëŠ” ?„ì²´ ë¦¬ìŠ¤?¸ë? ë³´ì—¬ì£¼ë˜ ë§¤ì¹­?˜ëŠ” ê²??„ì£¼ë¡??•ì¥?ˆìŠµ?ˆë‹¤.
                                          return (
                                            <button
                                              key={minor}
                                              type="button"
                                              onClick={() => {
                                                field.onChange(
                                                  checked
                                                    ? field.value.filter((v) => v !== valueStr)
                                                    : [...field.value, valueStr]
                                                );
                                              }}
                                              className={cn(
                                                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                                                checked
                                                  ? "bg-[#0C5F6B] border-[#0C5F6B] text-white"
                                                  : "bg-white border-gray-200 text-gray-600 hover:border-[#0C5F6B]/50",
                                                wasteSearch && minor.toLowerCase().includes(s) && !checked && "ring-2 ring-[#0C5F6B]/30 border-[#0C5F6B]/50"
                                              )}
                                            >
                                              {minor}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        );
                      }}
                    />
                    {errors.wasteTypes && (
                      <p className={errorCls}>{errors.wasteTypes.message}</p>
                    )}
                  </div>

                  {/* ?˜ê±° ?”ì²­??+ ?ê¸°ë¬??˜ëŸ‰ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>?˜ê±° ?”ì²­??/label>
                      <input
                        {...register("collectionDate")}
                        type="date"
                        className={inputCls(!!errors.collectionDate)}
                      />
                      <p className="text-[10px] text-gray-400 mt-1">
                        * ?¬ë§?˜ì‹œ???˜ê±° ? ì§œë¥?? íƒ?´ì£¼?¸ìš”.
                      </p>
                    </div>
                    <div>
                      <label className={labelCls}>?ê¸°ë¬??˜ëŸ‰/?¨ìœ„</label>
                      <input
                        {...register("quantity")}
                        placeholder="?? ??500kg, 2?œëŸ¼ ??
                        className={inputCls(!!errors.quantity)}
                      />
                      <p className="text-[10px] text-gray-400 mt-1">
                        * ?€?µì ???•ë³´ë¥??…ë ¥?˜ì…”??ê´œì°®?µë‹ˆ??
                      </p>
                    </div>
                  </div>

                  {/* ê¸°í? ë¬¸ì˜?¬í•­ */}
                  <div>
                    <label className={labelCls}>ê¸°í? ë¬¸ì˜?¬í•­</label>
                    <textarea
                      {...register("message")}
                      placeholder="?¹ì´?¬í•­?´ë‚˜ ì¶”ê?ë¡?ë¬¸ì˜?˜ì‹¤ ?´ìš©???ìœ ë¡?²Œ ?‘ì„±?´ì£¼?¸ìš”."
                      rows={3}
                      className={cn(inputCls(!!errors.message), "resize-none")}
                    />
                    {errors.message && (
                      <p className={errorCls}>{errors.message.message}</p>
                    )}
                  </div>

                  {/* ì²¨ë? ?Œì¼ (?¬ì§„, ?œë¥˜) */}
                  <div>
                    <label className={labelCls}>ì²¨ë? ?Œì¼ (?¬ì§„, ?œë¥˜ ??</label>
                    <p className="text-xs text-gray-400 mb-2">
                      ?„ì¥ ?¬ì§„, MSDS ??ê´€???œë¥˜ë¥??…ë¡œ?œí•´ ì£¼ì‹œë©?ë¹ ë¥´ê³??•í™•??ê²¬ì ??ê°€?¥í•©?ˆë‹¤. (?´ë?ì§€, PDF, DOC, HWP ì§€??/ ?Œì¼??ìµœë? 10MB)
                    </p>

                    {uploadedFiles.length > 0 && (
                      <div className="space-y-1.5 mb-2">
                        {uploadedFiles.map((file, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm"
                          >
                            <Paperclip className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="flex-1 truncate text-gray-700 text-xs">
                              {file.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFile(i)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {uploadedFiles.length < 10 && (
                      <>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/jpeg,image/png,image/webp,image/heic,application/pdf,.doc,.docx,.hwp,.hwpx"
                          onChange={handleFileChange}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label
                          htmlFor="photo-upload"
                          className={cn(
                            "inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-pointer hover:border-[#0C5F6B] hover:text-[#0C5F6B] transition-colors",
                            isUploading && "opacity-60 pointer-events-none"
                          )}
                        >
                          {isUploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Paperclip className="w-4 h-4" />
                          )}
                          {isUploading
                            ? "?…ë¡œ??ì¤?.."
                            : uploadedFiles.length === 0
                            ? "?Œì¼ ?…ë¡œ??
                            : "?Œì¼ ì¶”ê?"}
                        </label>
                        {uploadedFiles.length === 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                            ? íƒ???Œì¼??ì¡´ì¬?˜ì? ?ŠìŠµ?ˆë‹¤.
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* ê°œì¸?•ë³´ ?™ì˜ */}
                  <div className="border border-gray-100 rounded-xl p-4 space-y-3">
                    {/* ?„ìˆ˜ ?™ì˜ */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => setPrivacyModalOpen(true)}
                          className="text-sm font-semibold text-gray-700 hover:text-[#0C5F6B] underline decoration-dotted flex items-center gap-1"
                        >
                          ê°œì¸?•ë³´ ?˜ì§‘ ë°??´ìš© ?™ì˜
                          <ExternalLink className="w-3 h-3" />
                        </button>
                        <span className="text-red-500 text-xs font-bold">*</span>
                      </div>
                      <Controller
                        name="agreement"
                        control={control}
                        render={({ field }) => (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              checked={field.value === true}
                              onChange={() => field.onChange(true)}
                              className="w-4 h-4 accent-[#0C5F6B]"
                            />
                            <span className="text-sm text-gray-600">?™ì˜?©ë‹ˆ??/span>
                          </label>
                        )}
                      />
                      {errors.agreement && (
                        <p className={errorCls}>{errors.agreement.message}</p>
                      )}
                    </div>

                    <hr className="border-gray-100" />

                    {/* ? íƒ ?™ì˜ */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => setMarketingModalOpen(true)}
                          className="text-sm font-semibold text-gray-700 hover:text-[#0C5F6B] underline decoration-dotted flex items-center gap-1"
                        >
                          ë§ˆì????˜ì‹  ?™ì˜
                          <ExternalLink className="w-3 h-3" />
                        </button>
                        <span className="text-xs text-gray-400">(? íƒ)</span>
                      </div>
                      <Controller
                        name="marketingConsent"
                        control={control}
                        render={({ field }) => (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              checked={field.value === true}
                              onChange={() => field.onChange(true)}
                              className="w-4 h-4 accent-[#0C5F6B]"
                            />
                            <span className="text-sm text-gray-600">?™ì˜?©ë‹ˆ??/span>
                          </label>
                        )}
                      />
                    </div>
                  </div>

                  {/* ?œì¶œ ë²„íŠ¼ */}
                  <button
                    type="submit"
                    disabled={isPending || isUploading}
                    className="w-full py-3.5 bg-[#0C5F6B] text-white font-bold rounded-xl hover:bg-[#0E9E7E] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        ?œì¶œ ì¤?..
                      </>
                    ) : (
                      <>
                        ?œì¶œ?˜ê¸°
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ?€?€ ?±ê³µ ëª¨ë‹¬ ?€?€ */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-8 text-center">
            <CheckCircle2 className="w-14 h-14 text-[#10B981] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              ë¬¸ì˜ê°€ ?‘ìˆ˜?˜ì—ˆ?µë‹ˆ??
            </h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              ë¹ ë¥¸ ?œì¼ ?´ì— ?´ë‹¹?ê? ?°ë½?œë¦¬ê² ìŠµ?ˆë‹¤.
              {submittedEmail && (
                <><br />?‘ìˆ˜ ?•ì¸ ?´ë©”?¼ì„ ë°œì†¡?ˆìŠµ?ˆë‹¤.</>
              )}
            </p>

            {isLoggedIn ? (
              <div className="space-y-2">
                <Link
                  href="/my/inquiries"
                  className="block w-full py-3 bg-[#0C5F6B] text-white font-semibold rounded-xl hover:bg-[#0E9E7E] transition-colors text-sm"
                  onClick={() => setShowSuccessModal(false)}
                >
                  ë¬¸ì˜ ?´ì—­ ?•ì¸?˜ê¸°
                </Link>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="block w-full py-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ?«ê¸°
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-left">
                  <p className="text-xs font-semibold text-blue-800 mb-1">ë¬¸ì˜ ?´ì—­???¨ë¼?¸ìœ¼ë¡??•ì¸?˜ì„¸??/p>
                  <p className="text-xs text-blue-600 leading-relaxed">
                    ë¡œê·¸?¸í•˜ë©??‘ìˆ˜ ?„í™©Â·ê²¬ì  ê²°ê³¼ë¥??¤ì‹œê°„ìœ¼ë¡?ì¶”ì ?????ˆìŠµ?ˆë‹¤.
                  </p>
                </div>
                <Link
                  href="/support/inquiry-status"
                  className="block w-full py-2.5 bg-[#0C5F6B] text-white font-semibold rounded-xl hover:bg-[#0E9E7E] transition-colors text-sm text-center"
                  onClick={() => setShowSuccessModal(false)}
                >
                  ë¬¸ì˜?„í™© ì¡°íšŒ?˜ê¸°
                </Link>
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    className="flex-1 py-2 border border-[#0C5F6B] text-[#0C5F6B] font-semibold rounded-xl hover:bg-blue-50 transition-colors text-sm text-center"
                    onClick={() => setShowSuccessModal(false)}
                  >
                    ë¡œê·¸??
                  </Link>
                  <Link
                    href="/register"
                    className="flex-1 py-2 border border-gray-300 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm text-center"
                    onClick={() => setShowSuccessModal(false)}
                  >
                    ?Œì›ê°€??
                  </Link>
                </div>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="block w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ?«ê¸°
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ?€?€ ê°œì¸?•ë³´ ëª¨ë‹¬ ?€?€ */}
      {privacyModalOpen && (
        <PrivacyModal
          title="ê°œì¸?•ë³´ ?˜ì§‘ ë°??´ìš© ?™ì˜"
          content={PRIVACY_FULL_TEXT}
          onClose={() => setPrivacyModalOpen(false)}
        />
      )}

      {/* ?€?€ ë§ˆì???ëª¨ë‹¬ ?€?€ */}
      {marketingModalOpen && (
        <PrivacyModal
          title="ë§ˆì????˜ì‹  ?™ì˜"
          content={MARKETING_FULL_TEXT}
          onClose={() => setMarketingModalOpen(false)}
        />
      )}
    </>
  );
}

// ?€?€?€ ?´ë©”???ë™?„ì„± ?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€

const EMAIL_DOMAINS = [
  "naver.com",
  "gmail.com",
  "daum.net",
  "kakao.com",
  "hanmail.net",
  "nate.com",
  "outlook.com",
  "icloud.com",
];

function EmailAutocomplete({
  value,
  onChange,
  onBlur,
  hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  hasError?: boolean;
}) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const inputCls = cn(
    "w-full border rounded-lg px-4 py-2.5 text-sm outline-none transition-colors",
    "focus:ring-2 focus:ring-[#0C5F6B]/25 focus:border-[#0C5F6B]",
    hasError
      ? "border-red-400 bg-red-50/30"
      : "border-gray-200 bg-white hover:border-gray-300"
  );

  function getSuggestions(v: string): string[] {
    const atIdx = v.indexOf("@");
    if (atIdx < 1) return [];
    const local = v.slice(0, atIdx);
    const domainTyped = v.slice(atIdx + 1).toLowerCase();
    const matched = EMAIL_DOMAINS.filter((d) => d.startsWith(domainTyped));
    // ?„ì „???…ë ¥?ìœ¼ë©??¨ê?
    if (matched.length === 1 && matched[0] === domainTyped) return [];
    return matched.map((d) => `${local}@${d}`);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    onChange(v);
    const next = getSuggestions(v);
    setSuggestions(next);
    setActiveIdx(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      select(suggestions[activeIdx]);
    } else if (e.key === "Escape") {
      setSuggestions([]);
      setActiveIdx(-1);
    }
  }

  function select(v: string) {
    onChange(v);
    setSuggestions([]);
    setActiveIdx(-1);
  }

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSuggestions([]);
        setActiveIdx(-1);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        type="email"
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        placeholder="example@company.com"
        autoComplete="off"
        className={inputCls}
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((s, idx) => (
            <li key={s}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  select(s);
                }}
                className={cn(
                  "w-full px-4 py-2.5 text-sm text-left flex items-center gap-2 transition-colors",
                  idx === activeIdx
                    ? "bg-[#0C5F6B] text-white"
                    : "text-gray-700 hover:bg-[#0C5F6B]/5 hover:text-[#0C5F6B]"
                )}
              >
                <Mail className={cn("w-3.5 h-3.5 shrink-0", idx === activeIdx ? "text-white/70" : "text-gray-400")} />
                <span>{s}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PrivacyModal({
  title,
  content,
  onClose,
}: {
  title: string;
  content: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-4">
          <pre className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed font-sans">
            {content}
          </pre>
        </div>
        <div className="px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#0C5F6B] text-white text-sm font-semibold rounded-xl hover:bg-[#0E9E7E] transition-colors"
          >
            ?•ì¸
          </button>
        </div>
      </div>
    </div>
  );
}
