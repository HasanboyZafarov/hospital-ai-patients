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
      className="flex rounded-lg overflow-hidden w-full"
      style={{
        border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid var(--border)",
        background: isDark ? "rgba(255,255,255,0.04)" : "var(--surface)",
        justifyContent: "space-between",
      }}
    >
      {LANGS.map(({ code, label }) => {
        const isActive = lang === code;
        return (
          <button
            key={code}
            onClick={() => setLang(code)}
            className="text-xs font-semibold transition-all duration-150"
            style={{
              padding: "6px 12px",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-display)",
              background: isActive
                ? isDark ? "rgba(14,165,233,0.2)" : "var(--teal)"
                : "transparent",
              color: isActive
                ? isDark ? "var(--teal)" : "white"
                : isDark ? "rgba(255,255,255,0.3)" : "var(--text-muted)",
              borderRight: "none",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
