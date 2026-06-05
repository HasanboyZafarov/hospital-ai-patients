import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CheckCircle, ChevronRight, Pill, Activity, ClipboardCheck,
  Salad, Ban, Calendar, TrendingUp, Flag,
} from "lucide-react";
import { usePatientAuth } from "../../stores/patientAuth";
import { useDashboard } from "../../api/hooks";
import type { CareItemType } from "../../api/hooks";
import { Skeleton } from "../../components/Skeleton";
import { ErrorState } from "../../components/ErrorState";

const typeIcon: Record<CareItemType, React.ElementType> = {
  MEDICATION: Pill,
  ACTIVITY: Activity,
  EXERCISE: Activity,
  DIET: Salad,
  RESTRICTION: Ban,
  CHECKUP: ClipboardCheck,
};

function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data, min + 1);
  const w = 110, h = 32;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / (max - min)) * h;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke="#144EED" strokeWidth="2.5"
        strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function HomeSkeleton() {
  return (
    <div className="min-h-full" style={{ background: "var(--surface)" }}>
      <div className="px-5 pt-8 pb-1 flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton width={90} height={11} />
          <Skeleton width={180} height={22} />
        </div>
        <Skeleton width={40} height={40} radius={999} />
      </div>
      <div className="px-4 pt-4 pb-6 space-y-4">
        <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: "var(--navy)" }}>
          <Skeleton width={60} height={60} radius={999} dark />
          <div className="flex-1 flex flex-col gap-2">
            <Skeleton width="60%" height={14} dark />
            <Skeleton width="40%" height={10} dark />
            <Skeleton width="100%" height={4} radius={999} dark />
          </div>
        </div>
        <Skeleton width="100%" height={52} radius={16} />
        <Skeleton width="100%" height={56} radius={16} />
        <div>
          <div className="flex items-center justify-between mb-3">
            <Skeleton width={140} height={16} />
            <Skeleton width={50} height={12} />
          </div>
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl" style={{ background: "var(--surface-card)", border: "1px solid var(--border)", padding: "12px 14px" }}>
                <Skeleton width={36} height={36} radius={12} />
                <div className="flex-1 flex flex-col gap-1.5">
                  <Skeleton width="70%" height={13} />
                  <Skeleton width="50%" height={10} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
          <Skeleton width={150} height={15} />
          <div className="flex items-center gap-3">
            <Skeleton width={70} height={36} />
            <Skeleton width={110} height={32} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PatientHomePage() {
  const navigate = useNavigate();
  const { fullName } = usePatientAuth();
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useDashboard();

  if (isLoading) return <HomeSkeleton />;
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  const h = new Date().getHours();
  const greeting = h < 12 ? t("greetings.goodMorning") : h < 17 ? t("greetings.goodAfternoon") : t("greetings.goodEvening");

  const displayName = data.patient.fullName || fullName || "";
  const initials = displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const { postOpDay, progressPct } = data.recovery;
  const recoveryPhase =
    postOpDay < 7 ? t("patient.home.recoveryPhase1") :
    postOpDay < 21 ? t("patient.home.recoveryPhase2") :
    postOpDay < 60 ? t("patient.home.recoveryPhase3") :
    t("patient.home.fullRecovery");

  const todayItems = data.todaySchedule ?? [];
  const painTrend = (data.weeklyVitality?.painTrend ?? []).map((p) => p.pain);
  const latestPain = data.weeklyVitality?.latestPain ?? null;

  return (
    <div className="min-h-full" style={{ background: "var(--surface)" }}>
      <div className="px-5 pt-8 pb-1 flex items-start justify-between">
        <div>
          <p className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>{greeting},</p>
          <h1 className="text-2xl font-bold mt-0.5" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
            {displayName}
          </h1>
        </div>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1"
          style={{ background: "var(--navy)", color: "#144EED", fontFamily: "var(--font-display)", border: "2px solid rgba(14,165,233,0.25)" }}
        >
          {initials}
        </div>
      </div>

      <div className="px-4 pt-4 pb-6 space-y-4">
        <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: "var(--navy)" }}>
          <div
            className="w-[60px] h-[60px] rounded-full flex flex-col items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.12)" }}
          >
            <span className="text-xl font-bold text-white leading-none" style={{ fontFamily: "var(--font-display)" }}>{postOpDay}</span>
            <span className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{t("common.days")}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold" style={{ color: "#144EED", fontFamily: "var(--font-display)", fontSize: "15px" }}>{recoveryPhase}</p>
            <p className="text-xs mt-0.5 leading-snug" style={{ color: "rgba(255,255,255,0.5)" }}>{t("patient.home.phaseProgress", { pct: progressPct })}</p>
            <div className="mt-2 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
              <div className="h-1 rounded-full" style={{ width: `${progressPct}%`, background: "linear-gradient(90deg, #144EED, #1D4ED8)" }} />
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate("/checkin")}
          className="w-full flex items-center justify-center gap-2.5 font-semibold transition-all duration-150"
          style={{ height: "52px", borderRadius: "16px", background: "linear-gradient(135deg, #144EED 0%, #1D4ED8 100%)", color: "white", fontFamily: "var(--font-display)", fontSize: "15px", border: "none", cursor: "pointer" }}
        >
          <CheckCircle size={20} />
          {t("patient.home.dailyCheckIn")}
        </button>

        <button
          onClick={() => navigate("/report")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-opacity duration-150 active:opacity-70"
          style={{ background: "var(--surface-card)", border: "1px solid var(--border)", cursor: "pointer" }}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(229,62,62,0.08)" }}>
            <Flag size={16} style={{ color: "var(--danger)" }} />
          </div>
          <span className="flex-1 text-sm font-semibold text-left" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
            {t("patient.report.reportIssue")}
          </span>
          <ChevronRight size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
        </button>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", fontSize: "16px" }}>
              {t("patient.home.todaysSchedule")}
            </h2>
            <button onClick={() => navigate("/checklist")} className="text-xs font-medium" style={{ color: "var(--teal)", background: "none", border: "none", cursor: "pointer" }}>
              {t("common.viewAll")}
            </button>
          </div>

          {todayItems.length === 0 ? (
            <div className="p-5 rounded-2xl flex flex-col items-center text-center" style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
              <Calendar size={26} style={{ color: "var(--text-muted)", marginBottom: "8px" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("patient.home.noTasks")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayItems.slice(0, 3).map((item) => {
                const Icon = typeIcon[item.type] ?? ClipboardCheck;
                return (
                  <div
                    key={`${item.itemId}-${item.scheduleTime ?? ""}`}
                    onClick={() => navigate("/checklist")}
                    className="flex items-center gap-3 rounded-2xl transition-opacity duration-150 active:opacity-70"
                    style={{ background: "var(--surface-card)", border: "1px solid var(--border)", padding: "12px 14px", cursor: "pointer" }}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--teal-dim)" }}>
                      <Icon size={16} style={{ color: "#144EED" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{item.title}</p>
                      <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-secondary)" }}>{item.description}{item.scheduleTime ? ` · ${item.scheduleTime}` : ""}</p>
                    </div>
                    <ChevronRight size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl p-4" style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
          <h2 className="font-semibold mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", fontSize: "16px" }}>
            {t("patient.home.weeklyVitality")}
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <p className="text-xs font-semibold tracking-widest mb-0.5" style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>{t("patient.home.pain")}</p>
              <p className="font-bold leading-none" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", fontSize: "32px" }}>
                {latestPain ?? "–"}
                <span className="text-sm font-normal ml-0.5" style={{ color: "var(--text-muted)" }}>/10</span>
              </p>
            </div>
            <div className="flex-1 flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-1">
                <TrendingUp size={13} style={{ color: "#144EED" }} />
                <span className="text-xs font-semibold" style={{ color: "#144EED", fontFamily: "var(--font-display)" }}>{t("patient.home.steadyProgress")}</span>
              </div>
              {painTrend.length > 1 && <Sparkline data={painTrend} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
