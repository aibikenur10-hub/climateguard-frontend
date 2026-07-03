import { useState, useEffect, useRef } from "react";
import "./Chat.css";

const API_URL = import.meta.env.VITE_API_URL;

const MODES = [
  { id: "climate", label: "Климатолог", desc: "Экспертный анализ климатических рисков" },
  { id: "mentor", label: "Ментор", desc: "Объясняет просто и понятно" },
  { id: "researcher", label: "Исследователь", desc: "Данные, цифры, источники" },
];

const HISTORIES = { climate: [], mentor: [], researcher: [] };

export default function Chat() {
  const [mode, setMode] = useState("climate");
  const [histories, setHistories] = useState(HISTORIES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState({ climate: false, mentor: false, researcher: false });
  const bottomRef = useRef(null);

  const messages = histories[mode];
  const sessionId = `user_1_${mode}`;

  useEffect(() => {
    if (loaded[mode]) return;
    async function loadHistory() {
      try {
        const res = await fetch(`${API_URL}/history/${sessionId}`);
        const data = await res.json();
        setHistories(prev => ({ ...prev, [mode]: data.messages || [] }));
        setLoaded(prev => ({ ...prev, [mode]: true }));
      } catch {
        setLoaded(prev => ({ ...prev, [mode]: true }));
      }
    }
    loadHistory();
  }, [mode]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setHistories(prev => ({ ...prev, [mode]: [...prev[mode], userMsg] }));
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, session_id: sessionId, mode }),
      });
      const data = await res.json();
      setHistories(prev => ({
        ...prev,
        [mode]: [...prev[mode], { role: "assistant", content: data.reply }]
      }));
    } catch {
      setHistories(prev => ({
        ...prev,
        [mode]: [...prev[mode], { role: "assistant", content: "Ошибка. Попробуйте снова." }]
      }));
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const currentMode = MODES.find(m => m.id === mode);

  return (
    <div className="chat-container">
      <div className="chat-modes">
        {MODES.map(m => (
          <button
            key={m.id}
            className={`chat-mode-btn ${mode === m.id ? "active" : ""}`}
            onClick={() => setMode(m.id)}
            title={m.desc}
          >
            {m.label}
            {histories[m.id].length > 0 && (
              <span className="chat-mode-count">{Math.ceil(histories[m.id].length / 2)}</span>
            )}
          </button>
        ))}
        <span className="chat-mode-desc">{currentMode?.desc}</span>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            Задайте вопрос о климатических рисках Казахстана
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <span className="label">{msg.role === "user" ? "Вы" : "Oylan"}</span>
            <p>{msg.content}</p>
          </div>
        ))}
        {loading && (
          <div className="message assistant loading">
            <span className="label">Oylan</span>
            <div className="chat-typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Напишите вопрос... (Enter для отправки)"
          rows={2}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}>
          Отправить
        </button>
      </div>
    </div>
  );
}
