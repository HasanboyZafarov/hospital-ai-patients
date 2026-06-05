import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, MoreVertical, Send, Bot } from "lucide-react";
import { streamChat, useChatHistory } from "../../api/hooks";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function AIChatPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: history } = useChatHistory();

  const [sessionMessages, setSessionMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [initialTs] = useState(() => new Date());

  const historyMessages = useMemo<Message[]>(() => {
    if (!history || history.length === 0) return [];
    const out: Message[] = [];
    for (const entry of history) {
      const ts = new Date(entry.createdAt);
      out.push({ role: "user", content: entry.input, timestamp: ts });
      out.push({ role: "assistant", content: entry.output, timestamp: ts });
    }
    return out;
  }, [history]);

  const messages = useMemo<Message[]>(
    () => [
      { role: "assistant", content: t("patient.chat.initialMessage"), timestamp: initialTs },
      ...historyMessages,
      ...sessionMessages,
    ],
    [t, historyMessages, sessionMessages, initialTs]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const quickChips = [
    t("patient.chat.quickChips.logPain"),
    t("patient.chat.quickChips.checkMeds"),
    t("patient.chat.quickChips.talk"),
  ];

  async function sendText(text: string) {
    if (!text || loading) return;
    setInput("");
    const userMsg: Message = { role: "user", content: text, timestamp: new Date() };
    const assistantMsg: Message = { role: "assistant", content: "", timestamp: new Date() };
    setSessionMessages((prev) => [...prev, userMsg, assistantMsg]);
    setLoading(true);

    const convo = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      await streamChat(
        convo,
        (delta) => {
          setSessionMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last?.role === "assistant") {
              next[next.length - 1] = { ...last, content: last.content + delta };
            }
            return next;
          });
        },
        ctrl.signal
      );
    } catch {
      setSessionMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.role === "assistant" && !last.content) {
          next[next.length - 1] = { ...last, content: t("patient.chat.replies.default") };
        }
        return next;
      });
    } finally {
      setLoading(false);
    }
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
            <div className="max-w-[82%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
              style={{
                background: msg.role === "assistant" ? "var(--surface-card)" : "var(--navy)",
                border: msg.role === "assistant" ? "1px solid var(--border)" : "none",
                color: msg.role === "assistant" ? "var(--text-primary)" : "white",
                borderRadius: msg.role === "assistant" ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
                fontFamily: "var(--font-body)",
              }}>
              {msg.content || (loading && i === messages.length - 1 ? "…" : "")}
            </div>
            <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
              {formatTime(msg.timestamp)} · {msg.role === "assistant" ? (<span className="flex items-center gap-1"><Bot size={11} /> {t("patient.chat.aiAssistant")}</span>) : t("patient.chat.you")}
            </p>
          </div>
        ))}

        {loading && messages[messages.length - 1]?.content === "" && (
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
        <input type="text" placeholder={t("patient.chat.placeholder")} value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendText(input.trim())}
          className="flex-1 px-4 text-sm focus:outline-none"
          style={{ height: "40px", borderRadius: "20px", border: "1.5px solid var(--border)", background: "var(--surface)", color: "var(--text-primary)", fontFamily: "var(--font-body)" }} />
        <button onClick={() => sendText(input.trim())} disabled={!input.trim() || loading}
          className="flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            width: "40px", height: "40px", borderRadius: "12px",
            background: !input.trim() || loading ? "var(--border)" : "#0EA5E9",
            color: !input.trim() || loading ? "var(--text-muted)" : "white",
            border: "none", cursor: !input.trim() || loading ? "not-allowed" : "pointer",
          }}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
