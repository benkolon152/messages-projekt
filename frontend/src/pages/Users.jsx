import { useEffect, useState } from "react";
import { api } from "../services/api";
import { toast } from "react-toastify";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState({});
  const [friends, setFriends] = useState([]);
  const [requestsSent, setRequestsSent] = useState({});

  useEffect(() => {
    loadUsers();
    loadFriends();
  }, []);

  async function loadUsers() {
    try {
      const data = await api("/users");
      setUsers(data);
    } catch (err) {
      toast.error("Failed to load users");
    }
  }

  async function loadFriends() {
    try {
      const data = await api("/friendships");
      setFriends(data.map(f => f.id));
    } catch (err) {
      console.log("No friends yet");
    }
  }

  async function addFriend(userId) {
    try {
      await api(`/friendships/request/${userId}`, "POST", {});
      setRequestsSent({ ...requestsSent, [userId]: true });
      toast.success("Friend request sent");
    } catch (err) {
      toast.error("Failed to send friend request");
    }
  }

  async function sendMessage(userId) {
    try {
      const content = messages[userId];
      if (!content) {
        toast.error("Please enter a message");
        return;
      }

      await api("/messages", "POST", {
        receiverId: userId,
        content: content,
      });
      toast.success("Message sent");
      setMessages({ ...messages, [userId]: "" });
    } catch (err) {
      toast.error(err.message || "Failed to send message");
    }
  }

  return (
    <div className="container">
      <h2>Users</h2>

      {users.length === 0 ? (
        <p>No users found</p>
      ) : (
        users.map(u => {
          const isFriend = friends.includes(u.id);
          const requestSent = requestsSent[u.id];

          return (
            <div key={u.id} className="card" style={{ marginBottom: "1rem" }}>
              <p>👤 {u.username}</p>

              {!isFriend ? (
                <button
                  onClick={() => addFriend(u.id)}
                  disabled={requestSent}
                  style={{
                    background: requestSent ? "#999" : "#2563eb",
                    color: "white",
                    padding: "0.5rem 1rem",
                    border: "none",
                    borderRadius: "0.25rem",
                    cursor: requestSent ? "default" : "pointer",
                    marginBottom: "1rem"
                  }}
                >
                  {requestSent ? "Request Sent" : "Add Friend"}
                </button>
              ) : (
                <>
                  <p style={{ color: "green", margin: "0.5rem 0" }}>✓ Friends</p>
                  <input
                    placeholder="Message..."
                    value={messages[u.id] || ""}
                    onChange={e => setMessages({ ...messages, [u.id]: e.target.value })}
                  />
                  <button
                    onClick={() => sendMessage(u.id)}
                    style={{
                      background: "#10b981",
                      color: "white",
                      padding: "0.5rem 1rem",
                      border: "none",
                      borderRadius: "0.25rem",
                      cursor: "pointer"
                    }}
                  >
                    Send
                  </button>
                </>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}