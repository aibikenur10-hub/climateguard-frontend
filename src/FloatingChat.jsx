import { useNavigate } from "react-router-dom";
import "./FloatingChat.css";

export default function FloatingChat() {
  const navigate = useNavigate();

  return (
    <div className="floating-buttons">
      <button className="floating-btn" onClick={() => navigate("/forecast")}>
        Узнать прогноз риска
      </button>
      <button className="floating-btn primary" onClick={() => navigate("/chat")}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        Чат с AI
      </button>
    </div>
  );
}