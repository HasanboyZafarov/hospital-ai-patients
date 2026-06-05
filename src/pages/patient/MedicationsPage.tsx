import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Lock, Clock, Pill, AlertTriangle, TrendingUp, Droplets, HelpCircle, Bell } from "lucide-react";
import { usePatientAuth } from "../../stores/patientAuth";
import { useMedications, useMarkMedicationTaken } from "../../api/hooks";
import type { ScheduleItem } from "../../api/hooks";
import { Skeleton } from "../../components/Skeleton";
import { ErrorState } from "../../components/ErrorState";

function nowMinutes(): number { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); }
function scheduleMinutes(t: string): number { const [h, m] = t.split(":").map(Number); return h * 60 + m; }

function getWindowStatus(scheduleTime: string): { available: boolean; label: string } {
  const now = nowMinutes();
  const sched = scheduleMinutes(scheduleTime);
  const windowStart = sched - 30;
  const windowEnd = sched + 60;
  if (now >= windowStart && now <= windowEnd) return { available: true, label: "Now Due" };
  const minutesUntil = now < windowStart ? windowStart - now : 1440 - now + windowStart;
  const h = Math.floor(minutesUntil / 60);
  const m = minutesUntil % 60;
  return { available: false, label: h > 0 ? `in ${h}h ${m}m` : `in ${m}m` };
}

function useNow() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);
}

function MedicationsSkeleton() {
  return (
    <div className="min-h-full" style={{ background: "var(--surface)" }}>
      <div className="px-5 pt-6 pb-4 flex items-center justify-between" style={{ background: "var(--surface-card)", borderBottom: "1px solid var(--border)" }}>
        <Skeleton width={90} height={16} />
        <div className="flex items-center gap-3">
          <Skeleton width={20} height={20} radius={6} />
          <Skeleton width={20} height={20} radius={6} />
          <Skeleton width={32} height={32} radius={999} />
        </div>
      </div>
      <div className="px-5 pt-5 pb-6 space-y-4">
        <div className="flex flex-col gap-2">
          <Skeleton width={130} height={11} />
          <Skeleton width={170} height={24} />
        </div>
        <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
          <Skeleton width={180} height={13} />
          <Skeleton width="100%" height={6} radius={999} />
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl flex items-center gap-3 px-4 py-3.5" style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
            <Skeleton width={48} height={14} />
            <Skeleton width={36} height={36} radius={12} />
            <div className="flex-1 flex flex-col gap-1.5">
              <Skeleton width="60%" height={13} />
              <Skeleton width="40%" height={10} />
            </div>
            <Skeleton width={60} height={28} radius={10} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MedicationsPage() {
  useNow();
  const { t } = useTranslation();
  const { fullName } = usePatientAuth();
  const { data, isLoading, isError, refetch } = useMedications();
  const takeMed = useMarkMedicationTaken();

  const initials = (fullName ?? "P").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  if (isLoading) return <MedicationsSkeleton />;
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  const meds: ScheduleItem[] = data.medications ?? [];
  const takenCount = data.completed ?? meds.filter((m) => m.completed).length;
  const totalCount = data.total ?? meds.length;
  const progressPct = totalCount > 0 ? (takenCount / totalCount) * 100 : 0;

  return (
    <div className="min-h-full" style={{ background: "var(--surface)" }}>
      <div className="px-5 pt-6 pb-4 flex items-center justify-between" style={{ background: "var(--surface-card)", borderBottom: "1px solid var(--border)" }}>
        <span className="font-bold text-base" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{t("common.appName")}</span>
        <div className="flex items-center gap-3">
          <button style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex" }}><HelpCircle size={20} style={{ color: "var(--text-muted)" }} /></button>
          <button style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex" }}><Bell size={20} style={{ color: "var(--text-muted)" }} /></button>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "var(--navy)", color: "#0EA5E9", fontFamily: "var(--font-display)" }}>{initials}</div>
        </div>
      </div>

      <div className="px-5 pt-5 pb-6 space-y-4">
        <div>
          <p className="text-xs font-semibold tracking-widest mb-1" style={{ color: "#0EA5E9", fontFamily: "var(--font-display)" }}>{t("patient.medications.dailyProgress")}</p>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{t("patient.medications.title")}</h1>
        </div>

        {totalCount > 0 && (
          <div className="rounded-2xl p-4" style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
            <p className="text-sm font-semibold mb-2.5" style={{ color: "var(--text-primary)" }}>{t("patient.medications.completedToday", { done: takenCount, total: totalCount })}</p>
            <div className="h-1.5 rounded-full" style={{ background: "var(--border)" }}>
              <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, background: "#0EA5E9" }} />
            </div>
          </div>
        )}

        {meds.length === 0 && (
          <div className="rounded-2xl p-6 flex flex-col items-center text-center" style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
            <Pill size={28} style={{ color: "var(--text-muted)", marginBottom: "10px" }} />
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{t("patient.medications.empty")}</p>
          </div>
        )}

        {meds.length > 0 && (
          <div className="space-y-2">
            {meds.map((med) => {
              const isTaken = med.completed;
              const windowStatus = med.scheduleTime ? getWindowStatus(med.scheduleTime) : null;
              const isDue = windowStatus?.available && !isTaken;
              const key = `${med.itemId}-${med.scheduleTime ?? ""}`;

              return (
                <div key={key} className="rounded-2xl overflow-hidden" style={{ background: "var(--surface-card)", border: isDue ? "1.5px solid #0EA5E9" : "1px solid var(--border)", opacity: isTaken ? 0.65 : 1 }}>
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <div className="flex-shrink-0 w-14">
                      <p className="text-xs font-medium" style={{ color: isTaken ? "var(--text-muted)" : "var(--text-secondary)", fontFamily: "var(--font-display)" }}>{med.scheduleTime ?? "—"}</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: isTaken ? "rgba(5,150,105,0.08)" : isDue ? "var(--teal-dim)" : "var(--surface)" }}>
                      {isTaken ? <CheckCircle2 size={18} style={{ color: "var(--success)" }} /> : isDue ? <Pill size={18} style={{ color: "#0EA5E9" }} /> : <Clock size={18} style={{ color: "var(--text-muted)" }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      {isDue && (<span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: "var(--teal-dim)", color: "#0EA5E9", fontFamily: "var(--font-display)" }}>{t("patient.medications.nowDue")}</span>)}
                      <p className="text-sm font-semibold mt-0.5 truncate" style={{ fontFamily: "var(--font-display)", color: isTaken ? "var(--text-muted)" : "var(--text-primary)", textDecoration: isTaken ? "line-through" : "none" }}>{med.title}{med.dosage ? ` · ${med.dosage}` : ""}</p>
                      {med.frequency && <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{med.frequency}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isTaken ? <Lock size={16} style={{ color: "var(--text-muted)" }} />
                        : isDue ? (
                          <button
                            disabled={takeMed.isPending}
                            onClick={() => takeMed.mutate({ itemId: med.itemId, scheduleTime: med.scheduleTime ?? "", completed: true })}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                            style={{ background: "var(--navy)", color: "white", fontFamily: "var(--font-body)", border: "none", cursor: takeMed.isPending ? "wait" : "pointer" }}
                          >
                            {t("patient.medications.take")}
                          </button>
                        ) : <Lock size={16} style={{ color: "var(--text-muted)" }} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="rounded-2xl p-4" style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
          <div className="flex items-start gap-2 mb-2">
            <TrendingUp size={16} style={{ color: "#0EA5E9", marginTop: 1, flexShrink: 0 }} />
            <p className="font-semibold text-sm" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{t("patient.medications.recoveryInsight")}</p>
          </div>
          <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--text-secondary)" }}>{t("patient.medications.insightBody")}</p>
          <p className="text-xs font-semibold" style={{ color: "#0EA5E9" }}>{t("patient.medications.stability")}</p>
        </div>

        <div className="rounded-2xl p-4" style={{ background: "var(--navy)" }}>
          <div className="flex items-start gap-2 mb-1.5">
            <Droplets size={16} style={{ color: "#0EA5E9", marginTop: 1, flexShrink: 0 }} />
            <p className="font-semibold text-sm text-white" style={{ fontFamily: "var(--font-display)" }}>{t("patient.medications.hydrationAlert")}</p>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{t("patient.medications.hydrationBody")}</p>
        </div>

        <div className="flex items-start gap-2.5 p-3.5 rounded-xl" style={{ background: "rgba(217,119,6,0.06)", border: "1px solid rgba(217,119,6,0.18)" }}>
          <AlertTriangle size={14} style={{ color: "var(--warning)", flexShrink: 0, marginTop: 1 }} />
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{t("patient.medications.windowWarning")}</p>
        </div>
      </div>
    </div>
  );
}
