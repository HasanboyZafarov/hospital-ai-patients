import { useState } from "react";
import { mockCarePlan } from "../../mocks/data";
import type { CarePlanItem } from "../../types";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Circle, Pill, Salad, Activity, Ban, ClipboardCheck, Calendar } from "lucide-react";

const typeIcon: Record<string, React.ElementType> = {
  MEDICATION: Pill, DIET: Salad, ACTIVITY: Activity, RESTRICTION: Ban, CHECKUP: ClipboardCheck,
};

const typeStyle: Record<string, { bg: string; color: string; border: string }> = {
  MEDICATION: { bg: "var(--teal-dim)", color: "var(--teal)", border: "rgba(14,165,233,0.2)" },
  DIET: { bg: "rgba(5,150,105,0.07)", color: "var(--success)", border: "rgba(5,150,105,0.18)" },
  ACTIVITY: { bg: "rgba(14,165,233,0.06)", color: "var(--teal)", border: "rgba(14,165,233,0.14)" },
  RESTRICTION: { bg: "rgba(229,62,62,0.06)", color: "var(--danger)", border: "rgba(229,62,62,0.15)" },
  CHECKUP: { bg: "rgba(217,119,6,0.06)", color: "var(--warning)", border: "rgba(217,119,6,0.15)" },
};

export default function ChecklistPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<CarePlanItem[]>(
    mockCarePlan.items.filter((i) => i.dayOffset === 0)
  );

  function toggle(id: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isCompleted: !i.isCompleted } : i)));
  }

  const completed = items.filter((i) => i.isCompleted).length;
  const allDone = items.length > 0 && completed === items.length;

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
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{t("patient.checklist.progress", { done: completed, total: items.length })}</p>
        <div className="mt-3 h-1 rounded-full" style={{ background: "var(--border)" }}>
          <div className="h-1 rounded-full transition-all duration-500" style={{ width: `${Math.round((completed / items.length) * 100)}%`, background: "var(--teal)" }} />
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const style = typeStyle[item.type] ?? typeStyle.CHECKUP;
          const Icon = typeIcon[item.type] ?? ClipboardCheck;
          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className="w-full flex items-start gap-3 p-4 rounded-2xl text-left transition-all duration-150 active:scale-[0.99]"
              style={{
                background: item.isCompleted ? "var(--surface-card)" : style.bg,
                border: `1.5px solid ${item.isCompleted ? "var(--border)" : style.border}`,
                opacity: item.isCompleted ? 0.6 : 1,
                cursor: "pointer",
              }}
            >
              {item.isCompleted
                ? <CheckCircle2 size={20} style={{ color: "var(--success)", flexShrink: 0, marginTop: 1 }} />
                : <Circle size={20} style={{ color: "var(--border)", flexShrink: 0, marginTop: 1 }} />
              }
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Icon size={13} style={{ color: item.isCompleted ? "var(--text-muted)" : style.color, flexShrink: 0 }} />
                  <span className="text-sm font-medium" style={{ fontFamily: "var(--font-display)", color: item.isCompleted ? "var(--text-muted)" : "var(--text-primary)", textDecoration: item.isCompleted ? "line-through" : "none" }}>
                    {item.title}
                  </span>
                </div>
                <p className="text-xs leading-snug" style={{ color: "var(--text-muted)" }}>{item.description}</p>
                {item.scheduleTime && (<p className="text-xs mt-1 font-medium" style={{ color: "var(--teal)" }}>{item.scheduleTime}</p>)}
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
