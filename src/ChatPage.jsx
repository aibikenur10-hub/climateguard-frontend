import { useNavigate } from "react-router-dom";
import Chat from "./Chat";
import "./ChatPage.css";

export default function ChatPage() {
  const navigate = useNavigate();

  return (
    <div className="chat-page">
      <div className="chat-page-header">
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Вернуться
        </button>
        <div className="chat-page-title">
          <span className="logo-mark" style={{ width: 28, height: 28, fontSize: 10 }}>CG</span>
          <span>Чат с AI</span>
        </div>
      </div>
      <div className="chat-page-body">
        <Chat />
      </div>
    </div>
  );
}
