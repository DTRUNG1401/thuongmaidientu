function ChatWindow({ messages, send, text, setText }) {
  const handleKeyDown = (event) => {
    if (event.key === "Enter") send();
  };

  return (
    <div className="chat-window">
      <div className="chat-header">AI Assistant</div>
      <div className="chat-body">
        {messages.map((msg, index) => (
          <div key={`${msg.type}-${index}`} className={msg.type}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-footer">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập câu hỏi..."
        />
        <button onClick={send}>Gửi</button>
      </div>
    </div>
  );
}

export default ChatWindow;
