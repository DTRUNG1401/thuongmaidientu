import { useState } from "react";
import ChatWindow from "./ChatWindow";
import { sendMessage } from "../services/chatbotService";
import "../styles/chatbot.css";

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([
    { type: "bot", text: "Xin chào, mình có thể giúp gì cho bạn?" },
  ]);

  const send = async () => {
    if (!text.trim()) return;

    const userMsg = { type: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setText("");

    try {
      const res = await sendMessage(text);
      setMessages((prev) => [...prev, { type: "bot", text: res.data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "Backend chatbot chua san sang, nhung ban van co the mua hang binh thuong." },
      ]);
    }
  };

  return (
    <>
      <button className="chat-button" onClick={() => setOpen(!open)} aria-label="Mo chat">
        Chat
      </button>
      {open && <ChatWindow messages={messages} send={send} text={text} setText={setText} />}
    </>
  );
}

export default Chatbot;
