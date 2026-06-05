import { useTranslation } from "react-i18next";
import { CheckCircle2, Circle, Pill, Salad, Activity, Ban, ClipboardCheck, Calendar } from "lucide-react";
import { useChecklist, useCompleteChecklistItem } from "../../api/hooks";
import type { CareItemType, ScheduleItem } from "../../api/hooks";
import { Skeleton } from "../../components/Skeleton";
import { ErrorState } from "../../components/ErrorState";

const typeIcon: Record<CareItemType, React.ElementType> = {
  MEDICATION: Pill,
  DIET: Salad,
  ACTIVITY: Activity,
  EXERCISE: Activity,
  RESTRICTION: Ban,
  CHECKUP: ClipboardCheck,
};

const typeStyle: Record<CareItemType, { bg: string; color: string; border: string }> = {
  MEDICATION: { bg: "var(--teal-dim)", color: "#0EA5E9", border: "rgba(14,165,233,0.2)" },
  DIET: { bg: "rgba(5,150,105,0.07)", color: "var(--success)", border: "rgba(5,150,105,0.18)" },
  ACTIVITY: { bg: "rgba(14,165,233,0.06)", color: "#0EA5E9", border: "rgba(14,165,233,0.14)" },
  EXERCISE: { bg: "rgba(14,165,233,0.06)", color: "#0EA5E9", border: "rgba(14,165,233,0.14)" },
  RESTRICTION: { bg: "rgba(229,62,62,0.06)", color: "var(--danger)", border: "rgba(229,62,62,0.15)" },
  CHECKUP: { bg: "rgba(217,119,6,0.06)", color: "var(--warning)", border: "rgba(217,119,6,0.15)" },
};

function ChecklistSkeleton() {
  return (
    <div className="p-4 pb-24" style={{ background: "var(--surface)" }}>
      <div className="mb-5 flex flex-col gap-2">
        <Skeleton width={120} height={20} />
        <Skeleton width={180} height={12} />
        <Skeleton width="100%" height={4} radius={999} style={{ marginTop: 6 }} />
      </div>
      <div className="space-y-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: "var(--surface-card)", border: "1.5px solid var(--border)" }}>
            <Skeleton width={20} height={20} radius={999} />
            <div className="flex-1 flex flex-col gap-1.5">
              <Skeleton width="65%" height={13} />
              <Skeleton width="90%" height={10} />
              <Skeleton width={50} height={10} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ChecklistPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useChecklist();
  const complete = useCompleteChecklistItem();

  if (isLoading) return <ChecklistSkeleton />;
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  const items: ScheduleItem[] = data.items ?? [];
  const completed = data.completed ?? items.filter((i) => i.completed).length;
  const total = data.total ?? items.length;
  const allDone = total > 0 && completed === total;

  function toggle(item: ScheduleItem) {
    complete.mutate({
      itemId: item.itemId,
      scheduleTime: item.scheduleTime ?? "",
      completed: !item.completed,
    });
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center" style={{ minHeight: "60vh" }}>
        <Calendar size={32} style={{ color: "var(--text-muted)", marginBottom: "12px" }} />
        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{t("patient.checklist.empty")}</p>
        <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>{t("patient.checklist.emptyHint")}</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24" style={{ background: "var(--surface)" }}>
      <div className="mb-5">
        <h1 className="text-xl font-semibold mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{t("patient.checklist.title")}</h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{t("patient.checklist.progress", { done: completed, total })}</p>
        <div className="mt-3 h-1 rounded-full" style={{ background: "var(--border)" }}>
          <div className="h-1 rounded-full transition-all duration-500" style={{ width: `${total > 0 ? Math.round((completed / total) * 100) : 0}%`, background: "#0EA5E9" }} />
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const style = typeStyle[item.type] ?? typeStyle.CHECKUP;
          const Icon = typeIcon[item.type] ?? ClipboardCheck;
          const key = `${item.itemId}-${item.scheduleTime ?? ""}`;
          return (
            <button
              key={key}
              onClick={() => toggle(item)}
              disabled={complete.isPending}
              className="w-full flex items-start gap-3 p-4 rounded-2xl text-left transition-all duration-150 active:scale-[0.99]"
              style={{
                background: item.completed ? "var(--surface-card)" : style.bg,
                border: `1.5px solid ${item.completed ? "var(--border)" : style.border}`,
                opacity: item.completed ? 0.6 : 1,
                cursor: complete.isPending ? "wait" : "pointer",
              }}
            >
              {item.completed
                ? <CheckCircle2 size={20} style={{ color: "var(--success)", flexShrink: 0, marginTop: 1 }} />
                : <Circle size={20} style={{ color: "var(--border)", flexShrink: 0, marginTop: 1 }} />
              }
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Icon size={13} style={{ color: item.completed ? "var(--text-muted)" : style.color, flexShrink: 0 }} />
                  <span className="text-sm font-medium" style={{ fontFamily: "var(--font-display)", color: item.completed ? "var(--text-muted)" : "var(--text-primary)", textDecoration: item.completed ? "line-through" : "none" }}>
                    {item.title}
                  </span>
                </div>
                <p className="text-xs leading-snug" style={{ color: "var(--text-muted)" }}>{item.description}</p>
                {item.scheduleTime && (<p className="text-xs mt-1 font-medium" style={{ color: "#0EA5E9" }}>{item.scheduleTime}</p>)}
              </div>
            </button>
          );
        })}
      </div>

      {allDone && (
        <div className="mt-5 p-5 rounded-2xl flex flex-col items-center text-center" style={{ background: "rgba(5,150,105,0.07)", border: "1.5px solid rgba(5,150,105,0.2)" }}>
          <CheckCircle2 size={32} style={{ color: "var(--success)", marginBottom: "10px" }} />
          <p className="font-semibold text-sm" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{t("patient.checklist.allDone")}</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{t("patient.checklist.allDoneHint")}</p>
        </div>
      )}
    </div>
  );
}
