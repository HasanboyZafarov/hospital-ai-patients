import { AlertCircle, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  title?: string;
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export function ErrorState({ title, message, onRetry, compact = false }: Props) {
  const { t } = useTranslation();
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{
        minHeight: compact ? "auto" : "60vh",
        padding: compact ? "20px 16px" : "32px 20px",
        gap: "12px",
      }}
    >
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: "56px",
          height: "56px",
          background: "rgba(229,62,62,0.08)",
          border: "1.5px solid rgba(229,62,62,0.2)",
        }}
      >
        <AlertCircle size={26} style={{ color: "var(--danger)" }} />
      </div>
      <div>
        <p
          className="font-semibold text-sm"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
        >
          {title ?? t("common.errorTitle", "Something went wrong")}
        </p>
        <p
          className="text-xs mt-1 leading-relaxed"
          style={{ color: "var(--text-secondary)", maxWidth: "260px" }}
        >
          {message ?? t("common.errorMessage", "We could not load this content. Check your connection and try again.")}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 text-sm font-semibold transition-all duration-150 active:opacity-70"
          style={{
            marginTop: "8px",
            padding: "10px 18px",
            borderRadius: "12px",
            background: "#144EED",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
          }}
        >
          <RefreshCw size={15} />
          {t("common.retry", "Retry")}
        </button>
      )}
    </div>
  );
}
