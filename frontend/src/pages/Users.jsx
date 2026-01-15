import { useEffect, useState } from "react";
import { api } from "../services/api";
import { toast } from "react-toastify";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api("/users").then(setUsers);
  }, []);

  async function sendMessage(userId) {
    try {
      await api("/messages", "POST", {
        receiverId: userId,
        content: message,
      });
      toast.success("Message sent");
      setMessage("");
    } catch {
      toast.error("Failed to send message");
    }
  }

  return (
    <div className="container">
      <h2>Users</h2>

      {users.map(u => (
        <div key={u.id} className="card" style={{ marginBottom: "1rem" }}>
          <p>👤 {u.username}</p>
          <input
            placeholder="Message..."
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
          <button onClick={() => sendMessage(u.id)}>Send</button>
        </div>
      ))}
    </div>
  );
}