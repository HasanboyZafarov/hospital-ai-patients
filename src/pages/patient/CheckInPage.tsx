import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Thermometer, Activity, AlertTriangle, CheckCircle2, Frown, Meh, Smile, Heart, Zap, Bot } from "lucide-react";
import { usePatientAuth } from "../../stores/patientAuth";

const SYMPTOMS = ["Fatigue", "Dizziness", "Nausea", "Headache", "Insomnia", "Cough", "Chills", "Swelling"];
const MOODS = [{ icon: Frown, value: "low" }, { icon: Meh, value: "neutral" }, { icon: Smile, value: "good" }, { icon: Heart, value: "great" }, { icon: Zap, value: "strong" }];

export default function CheckInPage() {
  const navigate = useNavigate();
  const { patient } = usePatientAuth();
  const { t } = useTranslation();
  const [painLevel, setPainLevel] = useState(3);
  const [temperature, setTemperature] = useState("36.6");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [mood, setMood] = useState("good");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const firstName = patient?.user.fullName.split(" ")[0] ?? "there";

  function toggleSymptom(s: string) {
    setSymptoms((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  }

  const aiInsight = painLevel <= 3 ? t("patient.checkIn.aiInsight.low") : painLevel <= 6 ? t("patient.checkIn.aiInsight.medium") : t("patient.checkIn.aiInsight.high");

  if (submitted) {
    const riskLevel = painLevel >= 7 || Number(temperature) >= 38 ? "HIGH" : painLevel >= 5 ? "MEDIUM" : "LOW";
    const isHigh = riskLevel === "HIGH";
    const isMed = riskLevel === "MEDIUM";
    const RiskIcon = isHigh ? AlertTriangle : isMed ? Activity : CheckCircle2;
    const riskColor = isHigh ? "var(--danger)" : isMed ? "var(--warning)" : "var(--success)";
    const riskBg = isHigh ? "rgba(229,62,62,0.07)" : isMed ? "rgba(217,119,6,0.07)" : "rgba(5,150,105,0.07)";
    const riskBorder = isHigh ? "rgba(229,62,62,0.2)" : isMed ? "rgba(217,119,6,0.2)" : "rgba(5,150,105,0.2)";
    const riskMessage = isHigh ? t("patient.checkIn.messages.high") : isMed ? t("patient.checkIn.messages.medium") : t("patient.checkIn.messages.low");

    return (
      <div className="flex flex-col h-full" style={{ background: "var(--navy)" }}>
        <div className="flex-1 flex flex-col items-center justify-center px-5 py-8 gap-5 min-h-0">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: riskBg, border: `2px solid ${riskBorder}` }}>
            <RiskIcon size={34} style={{ color: riskColor }} />
          </div>
          <div className="text-center">
            <p className="text-xs font-bold tracking-widest mb-2" style={{ color: riskColor, fontFamily: "var(--font-display)" }}>{t("patient.checkIn.completeBanner", { risk: riskLevel })}</p>
            <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>{t("patient.checkIn.completeHeading")}</h1>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{riskMessage}</p>
          </div>
          <div className="w-full rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <p className="text-xs font-semibold tracking-widest mb-3 text-center" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-display)" }}>{t("patient.checkIn.todaysVitals")}</p>
            <div className="flex">
              <div className="flex-1 text-center">
                <p className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{painLevel}<span className="text-sm font-normal" style={{ color: "rgba(255,255,255,0.35)" }}>/10</span></p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{t("patient.checkIn.vitals.pain")}</p>
              </div>
              <div className="w-px self-stretch" style={{ background: "rgba(255,255,255,0.1)" }} />
              <div className="flex-1 text-center">
                <p className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{temperature}<span className="text-sm font-normal" style={{ color: "rgba(255,255,255,0.35)" }}>°C</span></p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{t("patient.checkIn.vitals.temp")}</p>
              </div>
            </div>
          </div>
          <button onClick={() => navigate("/")} className="w-full font-semibold text-sm transition-colors" style={{ height: "52px", borderRadius: "14px", background: "rgba(255,255,255,0.1)", color: "white", fontFamily: "var(--font-body)", border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer" }}>
            {t("patient.checkIn.backToHome")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full" style={{ background: "var(--surface)" }}>
      <div className="px-5 pt-6 pb-4 flex items-center justify-between" style={{ background: "var(--surface-card)", borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}><ChevronLeft size={20} style={{ color: "var(--text-secondary)" }} /></button>
          <h1 className="font-bold text-base" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{t("patient.checkIn.title")}</h1>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "var(--navy)", color: "var(--teal)", fontFamily: "var(--font-display)" }}>
          {(patient?.user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2) ?? "P").toUpperCase()}
        </div>
      </div>

      <div className="px-5 pt-5 pb-6 space-y-6">
        <div>
          <p className="font-semibold text-base" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{t("patient.checkIn.greeting", { name: firstName })}</p>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{t("greetings.patientFeeling")}</p>
        </div>

        <div className="rounded-2xl p-4" style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
          <p className="font-semibold text-sm mb-4" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{t("patient.checkIn.currentMood")}</p>
          <div className="flex justify-between">
            {MOODS.map((m) => {
              const MoodIcon = m.icon;
              const isSelected = mood === m.value;
              return (
                <button key={m.value} onClick={() => setMood(m.value)} className="flex flex-col items-center gap-1.5" style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <div className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-150" style={{ background: isSelected ? "var(--teal)" : "var(--surface)", border: isSelected ? "none" : "1.5px solid var(--border)" }}>
                    <MoodIcon size={20} style={{ color: isSelected ? "white" : "var(--text-muted)" }} />
                  </div>
                  <span className="text-xs font-medium" style={{ color: isSelected ? "var(--teal)" : "var(--text-muted)", fontFamily: "var(--font-body)" }}>{t(`mood.${m.value}`)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl p-4" style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-sm" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{t("patient.checkIn.painLevel")}</p>
            <span className="text-lg font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--teal)" }}>{painLevel}</span>
          </div>
          <div className="relative" style={{ height: "20px" }}>
            <div className="absolute top-1/2 left-0 right-0 rounded-full pointer-events-none" style={{ height: "6px", transform: "translateY(-50%)", background: "linear-gradient(to right, #22c55e 0%, #eab308 50%, #ef4444 100%)" }} />
            <input type="range" min={0} max={10} value={painLevel} onChange={(e) => setPainLevel(Number(e.target.value))} className="pain-slider relative w-full" style={{ WebkitAppearance: "none", background: "transparent", cursor: "pointer", height: "20px" }} />
          </div>
          <div className="flex justify-between text-xs mt-2" style={{ color: "var(--text-muted)" }}>
            <span>{t("patient.checkIn.painNone")}</span>
            <span>{t("patient.checkIn.painSevere")}</span>
          </div>
        </div>

        <div className="rounded-2xl p-4" style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
          <p className="font-semibold text-sm mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{t("patient.checkIn.bodyTemperature")}</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center px-4 rounded-xl" style={{ height: "48px", border: "1.5px solid var(--border)", background: "var(--surface)" }}>
              <input type="number" step="0.1" min="35" max="42" value={temperature} onChange={(e) => setTemperature(e.target.value)} className="flex-1 bg-transparent text-base focus:outline-none" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)", fontWeight: 500, border: "none" }} />
              <span className="text-sm font-medium flex-shrink-0" style={{ color: "var(--text-muted)" }}>°C</span>
            </div>
            <span className="text-xs font-medium" style={{ color: Number(temperature) >= 38 ? "var(--danger)" : Number(temperature) >= 37.5 ? "var(--warning)" : "var(--success)" }}>
              {Number(temperature) >= 38 ? t("common.fever") : Number(temperature) >= 37.5 ? t("common.elevated") : t("common.normal")}
            </span>
          </div>
        </div>

        <div className="rounded-2xl p-4" style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
          <p className="font-semibold text-sm mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{t("patient.checkIn.symptomsToday")}</p>
          <div className="flex flex-wrap gap-2">
            {SYMPTOMS.map((s) => {
              const active = symptoms.includes(s);
              return (
                <button key={s} onClick={() => toggleSymptom(s)} className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all" style={{ background: active ? "var(--teal-dim)" : "var(--surface)", border: active ? "1.5px solid var(--teal)" : "1.5px solid var(--border)", color: active ? "var(--teal)" : "var(--text-secondary)", cursor: "pointer", fontFamily: "var(--font-body)" }}>
                  {t(`symptoms.${s}`, s)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl p-4" style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
          <p className="font-semibold text-sm mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
            {t("patient.checkIn.additionalNotes")} <span className="font-normal text-xs" style={{ color: "var(--text-muted)" }}>{t("common.optional")}</span>
          </p>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("patient.checkIn.notesPlaceholder")} rows={2} className="w-full text-sm focus:outline-none resize-none bg-transparent" style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)", border: "none" }} />
        </div>

        <div>
          <button onClick={() => setSubmitted(true)} className="w-full flex items-center justify-center gap-2 font-semibold text-sm transition-all" style={{ height: "52px", borderRadius: "14px", background: "linear-gradient(135deg, var(--teal) 0%, #38BDF8 100%)", color: "white", fontFamily: "var(--font-body)", border: "none", cursor: "pointer" }}>
            {t("patient.checkIn.submit")} <Thermometer size={16} />
          </button>
          <p className="text-xs text-center mt-2 leading-relaxed" style={{ color: "var(--text-muted)" }}>{t("patient.checkIn.encrypted")}</p>
        </div>

        <div className="rounded-2xl p-4" style={{ background: "var(--navy)" }}>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(14,165,233,0.2)" }}>
              <Bot size={18} style={{ color: "var(--teal)" }} />
            </div>
            <div>
              <p className="font-semibold text-sm text-white mb-1" style={{ fontFamily: "var(--font-display)" }}>{t("patient.checkIn.aiHealthGuide")}</p>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{aiInsight}</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .pain-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%; background: var(--teal); border: 3px solid white; box-shadow: 0 1px 6px rgba(0,0,0,0.18); cursor: pointer; }
        .pain-slider::-moz-range-thumb { width: 22px; height: 22px; border-radius: 50%; background: var(--teal); box-shadow: 0 1px 6px rgba(0,0,0,0.18); cursor: pointer; border: none; }
      `}</style>
    </div>
  );
}
