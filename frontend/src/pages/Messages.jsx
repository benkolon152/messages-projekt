import { useEffect, useState } from "react";
import { api } from "../services/api";
import { toast } from "react-toastify";
import "./Inbox.css";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [count, setCount] = useState(0);

  async function loadMessages() {
    try {
      const data = await api("/messages");
      if (data.length > count) {
        toast.info("New message received");
        setCount(data.length);
      }
      setMessages(data);
    } catch (err) {
      toast.error("Failed to load messages");
    }
  }

  useEffect(() => {
    loadMessages();
    const i = setInterval(loadMessages, 5000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="container">
      <h2>Messages</h2>

      {messages.length === 0 ? (
        <p>No messages</p>
      ) : (
        messages.map(m => (
          <div key={m.id} className="message left">
            <strong>From {m.sender?.username}:</strong> {m.content}
          </div>
        ))
      )}
    </div>
  );
}
