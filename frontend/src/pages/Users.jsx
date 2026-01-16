import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import { toast } from "react-toastify";

const apiBase = (() => {
  const raw = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const withProtocol = /^(https?:)/.test(raw) ? raw : `https://${raw}`;
   return withProtocol.replace(/\/+$/, "");
})();

function getImg(url) {
  if (!url) return null;
  const clean = url.trim();
  if (/^https?:/i.test(clean)) return clean;
  return `${apiBase}${clean.startsWith("/") ? "" : "/"}${clean}`;
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [friends, setFriends] = useState([]);
  const [requestsSent, setRequestsSent] = useState({});
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    loadUsers();
    loadFriends();
    loadPendingRequests();
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

  async function loadPendingRequests() {
    try {
      const data = await api("/friendships/all-pending");
      const sentIds = data.map(r => r.friendId);
      const initialSent = {};
      sentIds.forEach(id => { initialSent[id] = true; });
      setRequestsSent(initialSent);
      setPendingRequests(sentIds);
    } catch (err) {
      console.log("No pending requests");
    }
  }

  async function addFriend(userId) {
    try {
      await api(`/friendships/request/${userId}`, "POST", {});
      setRequestsSent({ ...requestsSent, [userId]: true });
      setPendingRequests([...pendingRequests, userId]);
      toast.success("Friend request sent");
    } catch (err) {
      const errorMsg = err.message || "Failed to send friend request";
      if (errorMsg.includes("already exists")) {
        toast.error("Friend request already sent");
        setRequestsSent({ ...requestsSent, [userId]: true });
      } else {
        toast.error(errorMsg);
      }
    }
  }

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">
      <h2>Users</h2>

      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "0.75rem",
          marginBottom: "1rem",
          borderRadius: "0.25rem",
          border: "1px solid #ccc",
          fontSize: "1rem"
        }}
      />

      {filteredUsers.length === 0 ? (
        <p>No users found</p>
      ) : (
        filteredUsers.map(u => {
          const isFriend = friends.includes(u.id);
          const requestSent = requestsSent[u.id];

          return (
            <div key={u.id} className="card" style={{ marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                {u.profilePicture ? (
                  <img
                    src={getImg(u.profilePicture)}
                    alt={u.username}
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      objectFit: "cover"
                    }}
                  />
                ) : (
                  <span style={{ fontSize: "2rem" }}>👤</span>
                )}
                <p style={{ margin: 0 }}>{u.username}</p>
              </div>

              {!isFriend ? (
                <button
                  onClick={() => addFriend(u.id)}
                  disabled={requestSent}
                  style={{
                    background: requestSent ? "#999" : "var(--accent)",
                    color: "white",
                    padding: "0.5rem 1rem",
                    border: "none",
                    borderRadius: "0.25rem",
                    cursor: requestSent ? "default" : "pointer"
                  }}
                >
                  {requestSent ? "Request Sent" : "Add Friend"}
                </button>
              ) : (
                <p style={{ color: "var(--accent)", margin: 0 }}>✓ Friends</p>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}