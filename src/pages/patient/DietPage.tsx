import { useTranslation } from "react-i18next";
import { Utensils, Leaf, Droplet, Ban, Salad } from "lucide-react";
import { useDiet } from "../../api/hooks";
import { Skeleton } from "../../components/Skeleton";
import { ErrorState } from "../../components/ErrorState";

const ICON_BY_NAME: Record<string, React.ElementType> = {
  protein: Utensils,
  leaf: Leaf,
  water: Droplet,
  avoid: Ban,
};

function DietSkeleton() {
  return (
    <div className="p-4 pb-24" style={{ background: "var(--surface)" }}>
      <Skeleton width={150} height={20} />
      <Skeleton width={220} height={12} style={{ marginTop: 6, marginBottom: 20 }} />
      <Skeleton width={100} height={11} style={{ marginBottom: 10 }} />
      <div className="space-y-2 mb-5">
        {[0, 1].map((i) => (
          <div key={i} className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
            <Skeleton width={16} height={16} radius={4} />
            <div className="flex-1 flex flex-col gap-1.5">
              <Skeleton width="50%" height={13} />
              <Skeleton width="85%" height={10} />
            </div>
          </div>
        ))}
      </div>
      <Skeleton width={140} height={11} style={{ marginBottom: 12 }} />
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-2xl flex flex-col gap-2" style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
            <Skeleton width={32} height={32} radius={10} />
            <Skeleton width="70%" height={12} />
            <Skeleton width="100%" height={9} />
            <Skeleton width="80%" height={9} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DietPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useDiet();

  if (isLoading) return <DietSkeleton />;
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  const prescribed = data.prescribed ?? [];
  const tips = data.tips ?? [];

  return (
    <div className="p-4 pb-24" style={{ background: "var(--surface)" }}>
      <h1 className="text-xl font-semibold mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{t("patient.diet.title")}</h1>
      <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>{t("patient.diet.subtitle")}</p>

      <div className="mb-5">
        <h2 className="text-xs font-semibold tracking-widest mb-2" style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>{t("patient.diet.prescribed")}</h2>
        {prescribed.length > 0 ? (
          <div className="space-y-2">
            {prescribed.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: "rgba(5,150,105,0.07)", border: "1px solid rgba(5,150,105,0.18)" }}>
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
        {tips.map((tip, i) => {
          const Icon = ICON_BY_NAME[tip.icon] ?? Salad;
          return (
            <div key={i} className="p-4 rounded-2xl min-w-0 overflow-hidden" style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5" style={{ background: "var(--teal-dim)" }}>
                <Icon size={16} style={{ color: "#0EA5E9" }} />
              </div>
              <p className="font-semibold text-sm mb-1 break-words" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{tip.title}</p>
              <p className="text-xs leading-relaxed break-words" style={{ color: "var(--text-secondary)" }}>{tip.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
