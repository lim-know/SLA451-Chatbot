import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // 페이지가 처음 열렸을 때 DB의 기존 메시지 가져오기
  useEffect(() => {
    fetch("http://localhost:8000/api/messages")
      .then((response) => response.json())
      .then((data) => {
        setMessages(data);
      });
  }, []);

  // 메시지가 추가될 때마다 스크롤을 최하단으로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const content = input.trim();

    if (!content) {
      return;
    }

    // 사용자 메시지를 화면에 먼저 표시
    const userMessage = {
      role: "user",
      content: content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // 서버로 전송
    const response = await fetch(
      "http://localhost:8000/api/messages",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          content: content,
        }),
      }
    );

    const assistantMessage = await response.json();

    // 서버 답변 화면에 추가
    setMessages((prev) => [
      ...prev,
      assistantMessage,
    ]);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  const clearMessages = async () => {
    const confirmed = window.confirm(
      "모든 대화 기록이 삭제되며, 이 작업은 되돌릴 수 없습니다. 계속하시겠습니까?"
    );

    if (!confirmed) {
      return;
    }

    await fetch("http://localhost:8000/api/messages", {
      method: "DELETE",
    });

    setMessages([]);
  };

  return (
    <div className="app">

      <main className="chat">
        <header className="header">
          My Chatbot (1조)

          <button className="clear-button" onClick={clearMessages}>
            🗑 <span className="delete-text">삭제하기</span>
          </button>
        </header>

        <div className="messages">
          {messages.length === 0 && (
            <div className="welcome">
              <h1>무엇을 도와드릴까요?</h1>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={message.id ?? index}
              className={`message ${message.role}`}
            >
              <div className="message-content">
                {message.content}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <div className="input-container">
            <input
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요"
            />

            <button onClick={sendMessage}>
              ↑
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;