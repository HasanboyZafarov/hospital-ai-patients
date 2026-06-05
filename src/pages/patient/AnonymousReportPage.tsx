import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Stethoscope, Heart, Settings, Building2, Pill, MoreHorizontal, CheckCircle2, Shield } from "lucide-react";
import { toast } from "react-toastify";
import { useSubmitComplaint } from "../../api/hooks";
import type { ComplaintCategory, ComplaintUrgency } from "../../api/hooks";

const CATEGORIES = [
  { key: "doctor",     api: "DOCTOR" as ComplaintCategory,     Icon: Stethoscope },
  { key: "nurse",      api: "NURSE" as ComplaintCategory,      Icon: Heart },
  { key: "service",    api: "SERVICE" as ComplaintCategory,    Icon: Settings },
  { key: "facility",   api: "FACILITY" as ComplaintCategory,   Icon: Building2 },
  { key: "medication", api: "MEDICATION" as ComplaintCategory, Icon: Pill },
  { key: "other",      api: "OTHER" as ComplaintCategory,      Icon: MoreHorizontal },
] as const;

const URGENCIES: { key: "low" | "medium" | "high"; api: ComplaintUrgency }[] = [
  { key: "low",    api: "LOW" },
  { key: "medium", api: "MEDIUM" },
  { key: "high",   api: "HIGH" },
];

const URGENCY_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  low:    { bg: "rgba(5,150,105,0.08)",  color: "var(--success)", border: "rgba(5,150,105,0.25)" },
  medium: { bg: "rgba(217,119,6,0.08)",  color: "var(--warning)", border: "rgba(217,119,6,0.25)" },
  high:   { bg: "rgba(229,62,62,0.08)",  color: "var(--danger)",  border: "rgba(229,62,62,0.25)" },
};

export default function AnonymousReportPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [category, setCategory] = useState<string | null>(null);
  const [details, setDetails] = useState("");
  const [urgency, setUrgency] = useState<"low" | "medium" | "high">("medium");
  const [submitted, setSubmitted] = useState(false);
  const submit = useSubmitComplaint();

  if (submitted) {
    return (
      <div className="flex flex-col min-h-full" style={{ background: "var(--surface)" }}>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 gap-5">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(5,150,105,0.1)", border: "2px solid rgba(5,150,105,0.25)" }}>
            <CheckCircle2 size={36} style={{ color: "var(--success)" }} />
          </div>
          <div className="text-center">
            <p className="text-xs font-bold tracking-widest mb-2" style={{ color: "var(--success)", fontFamily: "var(--font-display)" }}>{t("patient.report.anonymous")}</p>
            <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{t("patient.report.successTitle")}</h1>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{t("patient.report.successBody")}</p>
          </div>
          <div className="w-full rounded-2xl p-4 flex items-start gap-3" style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
            <Shield size={16} style={{ color: "var(--teal)", flexShrink: 0, marginTop: 1 }} />
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{t("patient.report.subtitle")}</p>
          </div>
          <button onClick={() => navigate("/profile")} className="w-full font-semibold text-sm" style={{ height: "52px", borderRadius: "14px", background: "#144EED", color: "white", fontFamily: "var(--font-body)", border: "none", cursor: "pointer", boxShadow: "var(--shadow-blue)" }}>
            {t("patient.report.backToProfile")}
          </button>
        </div>
      </div>
    );
  }

  const canSubmit = !!category && details.trim().length > 0;

  return (
    <div className="min-h-full" style={{ background: "var(--surface)" }}>
      <div className="px-5 pt-6 pb-4 flex items-center gap-3" style={{ background: "var(--surface-card)", borderBottom: "1px solid var(--border)" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}><ChevronLeft size={20} style={{ color: "var(--text-secondary)" }} /></button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-base" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{t("patient.report.title")}</h1>
          <p className="text-xs flex items-center gap-1.5 mt-0.5">
            <Shield size={10} style={{ color: "var(--success)" }} />
            <span className="font-semibold tracking-widest" style={{ color: "var(--success)", fontSize: "10px", fontFamily: "var(--font-display)" }}>{t("patient.report.anonymous")}</span>
          </p>
        </div>
      </div>

      <div className="px-5 pt-5 pb-8 space-y-5">
        <div>
          <p className="text-sm font-semibold mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{t("patient.report.categoryLabel")}</p>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(({ key, Icon }) => {
              const isActive = category === key;
              return (
                <button key={key} onClick={() => setCategory(isActive ? null : key)} className="flex flex-col items-center gap-2 p-3.5 rounded-2xl transition-all duration-150 active:scale-[0.97]"
                  style={{ background: isActive ? "var(--teal-dim)" : "var(--surface-card)", border: isActive ? "1.5px solid var(--teal)" : "1px solid var(--border)", cursor: "pointer" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: isActive ? "rgba(14,165,233,0.15)" : "var(--surface)" }}>
                    <Icon size={17} style={{ color: isActive ? "var(--teal)" : "var(--text-muted)" }} />
                  </div>
                  <span className="text-xs font-medium" style={{ fontFamily: "var(--font-display)", color: isActive ? "var(--teal)" : "var(--text-secondary)" }}>
                    {t(`patient.report.categories.${key}`)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{t("patient.report.detailsLabel")}</p>
          <textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder={t("patient.report.detailsPlaceholder")} rows={5}
            className="w-full text-sm focus:outline-none resize-none p-4 rounded-2xl"
            style={{ background: "var(--surface-card)", border: "1px solid var(--border)", color: "var(--text-primary)", fontFamily: "var(--font-body)", lineHeight: 1.6 }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--teal)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
          <p className="text-xs mt-1 text-right" style={{ color: "var(--text-muted)" }}>{details.length} / 500</p>
        </div>

        <div>
          <p className="text-sm font-semibold mb-2.5" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{t("patient.report.urgencyLabel")}</p>
          <div className="flex gap-2">
            {URGENCIES.map(({ key }) => {
              const isActive = urgency === key;
              const s = URGENCY_STYLE[key];
              return (
                <button key={key} onClick={() => setUrgency(key)} className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all"
                  style={{ background: isActive ? s.bg : "var(--surface-card)", border: isActive ? `1.5px solid ${s.border}` : "1px solid var(--border)", color: isActive ? s.color : "var(--text-muted)", fontFamily: "var(--font-display)", cursor: "pointer" }}>
                  {t(`patient.report.urgency.${key}`)}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => {
            if (!canSubmit || submit.isPending) return;
            const cat = CATEGORIES.find((c) => c.key === category)?.api;
            const urg = URGENCIES.find((u) => u.key === urgency)?.api ?? "MEDIUM";
            if (!cat) return;
            submit.mutate(
              { category: cat, description: details.trim(), urgency: urg },
              {
                onSuccess: () => setSubmitted(true),
                onError: () => toast.error(t("common.errorLoading", "Failed to submit")),
              }
            );
          }}
          disabled={!canSubmit || submit.isPending}
          className="w-full font-semibold text-sm transition-all"
          style={{ height: "52px", borderRadius: "14px", background: canSubmit && !submit.isPending ? "linear-gradient(135deg, #144EED 0%, #1D4ED8 100%)" : "var(--border)", color: canSubmit && !submit.isPending ? "white" : "var(--text-muted)", fontFamily: "var(--font-body)", border: "none", cursor: canSubmit && !submit.isPending ? "pointer" : "not-allowed" }}
        >
          {submit.isPending ? t("common.loading") : t("patient.report.submit")}
        </button>
      </div>
    </div>
  );
}
