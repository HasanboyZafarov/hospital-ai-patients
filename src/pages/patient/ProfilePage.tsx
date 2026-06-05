import { useNavigate } from "react-router-dom";
import { usePatientAuth } from "../../stores/patientAuth";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { User, Calendar, Stethoscope, KeyRound, Phone, Mail, LogOut, ShieldCheck, ChevronRight } from "lucide-react";
import { usePatientProfile } from "../../api/hooks";
import { Skeleton } from "../../components/Skeleton";
import { ErrorState } from "../../components/ErrorState";

function ProfileSkeleton() {
  return (
    <div className="p-4 pb-8" style={{ background: "var(--surface)" }}>
      <div className="flex flex-col items-center pt-4 pb-6 gap-3">
        <Skeleton width={80} height={80} radius={999} />
        <Skeleton width={160} height={20} />
        <Skeleton width={110} height={11} />
      </div>
      <div className="rounded-2xl p-4 mb-4 flex flex-col gap-2.5" style={{ background: "var(--navy)" }}>
        <div className="flex items-center justify-between">
          <Skeleton width={120} height={11} dark />
          <Skeleton width={80} height={11} dark />
        </div>
        <Skeleton width="100%" height={6} radius={999} dark />
        <Skeleton width={100} height={10} dark />
      </div>
      <div className="rounded-2xl overflow-hidden mb-4" style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: i < 4 ? "1px solid var(--border)" : "none" }}>
            <Skeleton width={32} height={32} radius={10} />
            <div className="flex-1 flex flex-col gap-1.5">
              <Skeleton width={70} height={10} />
              <Skeleton width={160} height={13} />
            </div>
          </div>
        ))}
      </div>
      <Skeleton width="100%" height={68} radius={16} style={{ marginBottom: 16 }} />
      <Skeleton width="100%" height={48} radius={16} style={{ marginBottom: 16 }} />
      <Skeleton width="100%" height={52} radius={14} />
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { logout } = usePatientAuth();
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = usePatientProfile();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  if (isLoading) return <ProfileSkeleton />;
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  const initials = data.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const surgeryDate = data.surgery?.date
    ? new Date(data.surgery.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—";
  const postOpDay = data.surgery?.postOpDay ?? 0;
  const totalDays = data.surgery?.totalDays ?? 0;
  const pct = data.surgery?.progressPct ?? (totalDays > 0 ? Math.min(100, Math.round((postOpDay / totalDays) * 100)) : 0);

  const infoRows = [
    { icon: Stethoscope, label: t("patient.profile.surgery"),    value: data.surgery?.type ?? "—" },
    { icon: Calendar,    label: t("patient.profile.surgeryDate"), value: surgeryDate },
    { icon: KeyRound,    label: t("patient.profile.accessCode"),  value: data.accessCode },
    { icon: Mail,        label: t("patient.profile.email"),       value: data.email },
    { icon: Phone,       label: t("patient.profile.phone"),       value: data.phone ?? "—" },
  ];

  return (
    <div className="p-4 pb-8" style={{ background: "var(--surface)" }}>
      <div className="flex flex-col items-center pt-4 pb-6">
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-3" style={{ background: "var(--navy)", color: "#0EA5E9", fontFamily: "var(--font-display)", border: "2.5px solid rgba(14,165,233,0.3)" }}>
          {initials}
        </div>
        <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{data.fullName}</h1>
        <div className="flex items-center gap-1.5 mt-1.5">
          <ShieldCheck size={13} style={{ color: "var(--success)" }} />
          <span className="text-xs font-semibold" style={{ color: "var(--success)", fontFamily: "var(--font-display)" }}>{t("patient.profile.verifiedPatient")}</span>
        </div>
      </div>

      <div className="rounded-2xl p-4 mb-4" style={{ background: "var(--navy)" }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold" style={{ color: "#0EA5E9", fontFamily: "var(--font-display)" }}>{t("patient.profile.recoveryProgress")}</p>
          <span className="text-xs font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{t("patient.profile.dayOf", { day: postOpDay, total: totalDays })}</span>
        </div>
        <div className="h-1.5 rounded-full mb-2" style={{ background: "rgba(255,255,255,0.1)" }}>
          <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #0EA5E9, #38BDF8)" }} />
        </div>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{t("patient.profile.percentComplete", { pct })}</p>
      </div>

      <div className="rounded-2xl overflow-hidden mb-4" style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
        {infoRows.map(({ icon: Icon, label, value }, i) => (
          <div key={label} className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: i < infoRows.length - 1 ? "1px solid var(--border)" : "none" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--teal-dim)" }}>
              <Icon size={15} style={{ color: "#0EA5E9" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
              <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-4 mb-4" style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
        <p className="text-sm font-semibold mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{t("language.label")}</p>
        <LanguageSwitcher variant="light" />
      </div>

      <div className="rounded-2xl overflow-hidden mb-4" style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
        <button className="w-full flex items-center gap-3 px-4 py-3.5" style={{ background: "none", border: "none", cursor: "pointer" }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--teal-dim)" }}><User size={15} style={{ color: "#0EA5E9" }} /></div>
          <span className="flex-1 text-sm font-medium text-left" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>{t("patient.profile.contactSupport")}</span>
          <ChevronRight size={16} style={{ color: "var(--text-muted)" }} />
        </button>
      </div>

      <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2.5 font-semibold text-sm transition-all" style={{ height: "52px", borderRadius: "14px", background: "rgba(229,62,62,0.08)", color: "var(--danger)", border: "1.5px solid rgba(229,62,62,0.18)", fontFamily: "var(--font-body)", cursor: "pointer" }}>
        <LogOut size={17} />
        {t("nav.logout")}
      </button>
    </div>
  );
}
