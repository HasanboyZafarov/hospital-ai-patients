import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check, Globe } from "lucide-react";
import { useLangStore } from "../stores/langStore";

const LANGS = [
  { code: "en", label: "English", short: "EN" },
  { code: "ru", label: "Русский", short: "RU" },
  { code: "uz", label: "O'zbekcha", short: "UZ" },
] as const;

interface Props {
  variant?: "dark" | "light";
}

export function LanguageSelect({ variant = "dark" }: Props) {
  const { lang, setLang } = useLangStore();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const isDark = variant === "dark";

  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", onClick);
      document.addEventListener("keydown", onKey);
    }
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const triggerBg = isDark ? "rgba(255,255,255,0.06)" : "var(--surface)";
  const triggerBorder = isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid var(--border)";
  const triggerColor = isDark ? "white" : "var(--text-primary)";
  const menuBg = isDark ? "#0F2040" : "var(--surface-card)";
  const menuBorder = isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid var(--border)";
  const menuShadow = isDark
    ? "0 12px 32px rgba(0,0,0,0.45)"
    : "0 12px 28px rgba(10,22,40,0.12)";
  const optionHoverBg = isDark ? "rgba(14,165,233,0.12)" : "var(--surface)";
  const mutedText = isDark ? "rgba(255,255,255,0.55)" : "var(--text-muted)";

  return (
    <div ref={rootRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 transition-all duration-150"
        style={{
          padding: "8px 12px",
          borderRadius: "10px",
          background: triggerBg,
          border: triggerBorder,
          color: triggerColor,
          fontFamily: "var(--font-display)",
          fontSize: "12px",
          fontWeight: 600,
          cursor: "pointer",
          letterSpacing: "0.05em",
        }}
      >
        <Globe size={14} style={{ color: isDark ? "#0EA5E9" : "var(--text-secondary)" }} />
        <span>{current.short}</span>
        <ChevronDown
          size={14}
          style={{
            color: mutedText,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s ease",
          }}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            minWidth: "160px",
            padding: "4px",
            margin: 0,
            listStyle: "none",
            borderRadius: "12px",
            background: menuBg,
            border: menuBorder,
            boxShadow: menuShadow,
            zIndex: 50,
          }}
        >
          {LANGS.map((l) => {
            const active = l.code === lang;
            return (
              <li key={l.code} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    setLang(l.code);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-2 transition-colors duration-100"
                  onMouseEnter={(e) => (e.currentTarget.style.background = optionHoverBg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "8px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "var(--font-body)",
                    fontSize: "13px",
                    color: triggerColor,
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "22px",
                      height: "22px",
                      borderRadius: "6px",
                      background: active ? "#0EA5E9" : isDark ? "rgba(255,255,255,0.05)" : "var(--surface)",
                      color: active ? "white" : mutedText,
                      fontSize: "10px",
                      fontWeight: 700,
                      fontFamily: "var(--font-display)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {l.short}
                  </span>
                  <span style={{ flex: 1, fontWeight: active ? 600 : 500 }}>{l.label}</span>
                  {active && <Check size={14} style={{ color: "#0EA5E9", flexShrink: 0 }} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
