import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePatientAuth } from "../../stores/patientAuth";
import { usePatientLogin } from "../../api/hooks";
import { LockKeyhole, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { LanguageSelect } from "../../components/LanguageSelect";

export default function PatientLoginPage() {
  const { t } = useTranslation();
  const [digits, setDigits] = useState<string[]>(Array(4).fill(""));
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const { setAuth } = usePatientAuth();
  const navigate = useNavigate();
  const login = usePatientLogin();

  const allFilled = digits.every((d) => d !== "");
  const loading = login.isPending;

  function handleInput(i: number, val: string) {
    const v = val.replace(/[^0-9]/g, "");
    if (!v) {
      const next = [...digits];
      next[i] = "";
      setDigits(next);
      return;
    }
    const next = [...digits];
    next[i] = v[v.length - 1];
    setDigits(next);
    if (i < 3) refs.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const text = e.clipboardData
      .getData("text")
      .replace(/[^0-9]/g, "")
      .slice(0, 4);
    const next = Array(4).fill("");
    text.split("").forEach((c, i) => {
      next[i] = c;
    });
    setDigits(next);
    refs.current[Math.min(text.length, 3)]?.focus();
    e.preventDefault();
  }

  function failVisual(msg: string) {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 600);
    setDigits(Array(4).fill(""));
    setTimeout(() => refs.current[0]?.focus(), 50);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allFilled || loading) return;
    const code = `HOSP-${digits.join("")}`;
    login.mutate(code, {
      onSuccess: (d) => {
        setAuth(d.accessToken, d.user.fullName, d.patient.id);
        toast.success(
          t("auth.patient.welcomeBack", { name: d.user.fullName.split(" ")[0] }),
          { position: "top-center", autoClose: 3000 }
        );
        navigate("/");
      },
      onError: () => failVisual(t("auth.patient.invalidCode")),
    });
  }

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  return (
    <div
      style={{
        background: "var(--navy)",
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: 20, right: 20 }}>
        <LanguageSelect variant="dark" />
      </div>

      <div style={{ width: "100%", maxWidth: "380px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(14,165,233,0.12)",
              border: "1.5px solid rgba(14,165,233,0.3)",
            }}
          >
            <LockKeyhole size={28} style={{ color: "#144EED" }} />
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "white",
              marginBottom: "8px",
              fontFamily: "var(--font-display)",
            }}
          >
            {t("auth.patient.title")}
          </h1>
          <p style={{ fontSize: "14px", lineHeight: 1.5, color: "var(--text-muted)" }}>
            {t("auth.patient.subtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.15em",
              color: "#144EED",
              marginBottom: "12px",
              fontFamily: "var(--font-display)",
            }}
          >
            {t("auth.patient.verification")}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <span
              style={{
                fontWeight: 700,
                fontSize: "16px",
                color: "white",
                fontFamily: "var(--font-display)",
                flexShrink: 0,
              }}
            >
              HOSP–
            </span>
            <div
              style={{
                display: "flex",
                gap: "8px",
                flex: 1,
                animation: shake ? "shake 0.4s ease" : undefined,
              }}
            >
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleInput(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    width: "100%",
                    height: "56px",
                    textAlign: "center",
                    fontSize: "22px",
                    fontWeight: 700,
                    borderRadius: "12px",
                    outline: "none",
                    fontFamily: "var(--font-display)",
                    background: d ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.07)",
                    border: d ? "1.5px solid #144EED" : "1.5px solid rgba(255,255,255,0.12)",
                    color: "white",
                    caretColor: "#144EED",
                    transition: "all 0.15s ease",
                  }}
                />
              ))}
            </div>
          </div>

          {error && (
            <p
              style={{
                fontSize: "12px",
                textAlign: "center",
                marginBottom: "16px",
                color: "#FC8181",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!allFilled || loading}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              fontWeight: 600,
              fontSize: "14px",
              height: "52px",
              borderRadius: "12px",
              border: "none",
              background:
                allFilled && !loading
                  ? "linear-gradient(135deg, #144EED, #1D4ED8)"
                  : "rgba(255,255,255,0.08)",
              color: allFilled && !loading ? "white" : "rgba(255,255,255,0.3)",
              cursor: allFilled && !loading ? "pointer" : "not-allowed",
              fontFamily: "var(--font-body)",
              transition: "all 0.15s ease",
            }}
          >
            {loading ? t("common.loading") : t("auth.patient.unlock")}
            {!loading && <ChevronRight size={17} />}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            fontSize: "12px",
            marginTop: "20px",
            color: "rgba(255,255,255,0.3)",
          }}
        >
          {t("auth.patient.lostCode")}{" "}
          <span style={{ color: "#144EED", cursor: "pointer" }}>
            {t("auth.patient.contactSupport")}
          </span>
        </p>

        <p
          style={{
            textAlign: "center",
            fontSize: "11px",
            marginTop: "40px",
            color: "rgba(255,255,255,0.15)",
          }}
        >
          {t("auth.patient.poweredBy")}
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
