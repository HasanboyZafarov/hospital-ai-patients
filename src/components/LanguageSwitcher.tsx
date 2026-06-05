import { useLangStore } from "../stores/langStore";

const LANGS = [
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
  { code: "uz", label: "UZ" },
] as const;

interface Props {
  variant?: "dark" | "light";
}

export function LanguageSwitcher({ variant = "dark" }: Props) {
  const { lang, setLang } = useLangStore();
  const isDark = variant === "dark";

  return (
    <div
      className="flex w-full gap-1"
      style={{
        padding: "4px",
        borderRadius: "12px",
        background: isDark ? "rgba(255,255,255,0.06)" : "var(--surface)",
        border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid var(--border)",
      }}
    >
      {LANGS.map(({ code, label }) => {
        const isActive = lang === code;
        return (
          <button
            key={code}
            onClick={() => setLang(code)}
            className="flex-1 text-xs font-semibold transition-all duration-200"
            style={{
              padding: "8px 0",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-display)",
              letterSpacing: "0.05em",
              background: isActive
                ? isDark ? "#144EED" : "var(--surface-card)"
                : "transparent",
              color: isActive
                ? isDark ? "white" : "var(--brand-dark)"
                : isDark ? "rgba(255,255,255,0.45)" : "var(--text-muted)",
              boxShadow: isActive && !isDark ? "0 1px 3px rgba(10,22,40,0.08), 0 0 0 1px var(--border)" : "none",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
