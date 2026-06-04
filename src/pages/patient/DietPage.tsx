import { mockCarePlan } from "../../mocks/data";
import { useTranslation } from "react-i18next";
import { Utensils, Leaf, Droplet, Ban, Salad } from "lucide-react";

const TIP_ICONS = [Utensils, Leaf, Droplet, Ban];
const TIP_KEYS = ["protein", "antiInflammatory", "hydration", "avoid"] as const;

const dietItems = mockCarePlan.items.filter((i) => i.type === "DIET");

export default function DietPage() {
  const { t } = useTranslation();

  return (
    <div className="p-4 pb-24" style={{ background: "var(--surface)" }}>
      <h1 className="text-xl font-semibold mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{t("patient.diet.title")}</h1>
      <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>{t("patient.diet.subtitle")}</p>

      <div className="mb-5">
        <h2 className="text-xs font-semibold tracking-widest mb-2" style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>{t("patient.diet.prescribed")}</h2>
        {dietItems.length > 0 ? (
          <div className="space-y-2">
            {dietItems.map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: "rgba(5,150,105,0.07)", border: "1px solid rgba(5,150,105,0.18)" }}>
                <Salad size={16} style={{ color: "var(--success)", flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p className="font-medium text-sm" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{item.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-5 rounded-2xl flex flex-col items-center text-center" style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
            <Salad size={26} style={{ color: "var(--text-muted)", marginBottom: "8px" }} />
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{t("patient.diet.empty")}</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{t("patient.diet.emptyHint")}</p>
          </div>
        )}
      </div>

      <h2 className="text-xs font-semibold tracking-widest mb-3" style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>{t("patient.diet.tipsHeading")}</h2>
      <div className="grid grid-cols-2 gap-3">
        {TIP_KEYS.map((key, i) => {
          const Icon = TIP_ICONS[i];
          return (
            <div key={key} className="p-4 rounded-2xl min-w-0 overflow-hidden" style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5" style={{ background: "var(--teal-dim)" }}>
                <Icon size={16} style={{ color: "var(--teal)" }} />
              </div>
              <p className="font-semibold text-sm mb-1 break-words" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{t(`patient.diet.tips.${key}.title`)}</p>
              <p className="text-xs leading-relaxed break-words" style={{ color: "var(--text-secondary)" }}>{t(`patient.diet.tips.${key}.desc`)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
