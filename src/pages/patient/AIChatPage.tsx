import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, MoreVertical, Mic, Send, Bot, TrendingDown } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestion?: { label: string; detail: string };
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function AIChatPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const initialMessages: Message[] = [
    { role: "assistant", content: t("patient.chat.initialMessage"), timestamp: new Date(Date.now() - 10 * 60 * 1000) },
  ];

  const mockReplies: Record<string, { content: string; suggestion?: { label: string; detail: string } }> = {
    pain: { content: t("patient.chat.replies.pain") },
    fever: { content: t("patient.chat.replies.fever") },
    medication: { content: t("patient.chat.replies.medication") },
    exercise: { content: t("patient.chat.replies.exercise"), suggestion: { label: "Adjustment", detail: "Modified slide routine · 2m 45s" } },
    default: { content: t("patient.chat.replies.default") },
  };

  function getMockReply(msg: string) {
    const lower = msg.toLowerCase();
    if (lower.includes("pain") || lower.includes("hurt")) return mockReplies.pain;
    if (lower.includes("fever") || lower.includes("temperature")) return mockReplies.fever;
    if (lower.includes("medication") || lower.includes("medicine") || lower.includes("pill")) return mockReplies.medication;
    if (lower.includes("exercise") || lower.includes("walk") || lower.includes("stretch") || lower.includes("stiff")) return mockReplies.exercise;
    return mockReplies.default;
  }

  const quickChips = [
    t("patient.chat.quickChips.logPain"),
    t("patient.chat.quickChips.checkMeds"),
    t("patient.chat.quickChips.talk"),
  ];

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function sendText(text: string) {
    if (!text || loading) return;
    setInput("");
    const userMsg: Message = { role: "user", content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setTimeout(() => {
      const reply = getMockReply(text);
      const aiMsg: Message = { role: "assistant", content: reply.content, timestamp: new Date(), suggestion: reply.suggestion };
      setMessages((prev) => [...prev, aiMsg]);
      setLoading(false);
    }, 900);
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--surface)" }}>
      <div className="flex-shrink-0 px-4 pt-5 pb-3" style={{ background: "var(--surface-card)", borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center">
          <button onClick={() => navigate("/")} className="mr-3 flex-shrink-0" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <ArrowLeft size={20} style={{ color: "var(--text-secondary)" }} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-base" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{t("patient.chat.title")}</h1>
            <p className="text-xs flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "var(--success)" }} />
              <span className="font-semibold tracking-widest" style={{ color: "var(--success)", fontSize: "10px", fontFamily: "var(--font-display)" }}>{t("patient.chat.secureActive")}</span>
            </p>
          </div>
          <button style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <MoreVertical size={20} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 py-4 space-y-4 min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
            <div className="max-w-[82%] px-4 py-3 text-sm leading-relaxed"
              style={{
                background: msg.role === "assistant" ? "var(--surface-card)" : "var(--navy)",
                border: msg.role === "assistant" ? "1px solid var(--border)" : "none",
                color: msg.role === "assistant" ? "var(--text-primary)" : "white",
                borderRadius: msg.role === "assistant" ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
                fontFamily: "var(--font-body)",
              }}>
              {msg.content}
            </div>
            <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
              {formatTime(msg.timestamp)} · {msg.role === "assistant" ? (<span className="flex items-center gap-1"><Bot size={11} /> {t("patient.chat.aiAssistant")}</span>) : t("patient.chat.you")}
            </p>
            {msg.role === "assistant" && msg.suggestion && (
              <div className="mt-2 flex items-center gap-2.5 px-3 py-2.5 rounded-xl" style={{ background: "var(--surface-card)", border: "1px solid var(--border)", maxWidth: "82%" }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--teal-dim)" }}>
                  <TrendingDown size={14} style={{ color: "var(--teal)" }} />
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>{msg.suggestion.label}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)", textTransform: "uppercase", fontSize: "10px" }}>{msg.suggestion.detail}</p>
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex flex-col items-start">
            <div className="px-4 py-3" style={{ background: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: "4px 16px 16px 16px" }}>
              <div className="flex gap-1 items-center">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "var(--text-muted)", animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 2 && (
        <div className="flex-shrink-0 px-4 pb-2 flex gap-2 flex-wrap">
          {quickChips.map((q) => (
            <button key={q} onClick={() => sendText(q)} className="text-xs px-3.5 py-1.5 rounded-full transition-colors"
              style={{ background: "var(--surface-card)", color: "var(--text-secondary)", border: "1px solid var(--border)", fontFamily: "var(--font-body)", cursor: "pointer" }}>
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="flex-shrink-0 px-4 py-3 flex items-center gap-2" style={{ background: "var(--surface-card)", borderTop: "1px solid var(--border)" }}>
        <button style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", flexShrink: 0 }}>
          <Mic size={20} style={{ color: "var(--text-muted)" }} />
        </button>
        <input type="text" placeholder={t("patient.chat.placeholder")} value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendText(input.trim())}
          className="flex-1 px-4 text-sm focus:outline-none"
          style={{ height: "40px", borderRadius: "20px", border: "1.5px solid var(--border)", background: "var(--surface)", color: "var(--text-primary)", fontFamily: "var(--font-body)" }} />
        <button onClick={() => sendText(input.trim())} disabled={!input.trim() || loading}
          className="flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            width: "40px", height: "40px", borderRadius: "12px",
            background: !input.trim() || loading ? "var(--border)" : "var(--teal)",
            color: !input.trim() || loading ? "var(--text-muted)" : "white",
            border: "none", cursor: !input.trim() || loading ? "not-allowed" : "pointer",
          }}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
