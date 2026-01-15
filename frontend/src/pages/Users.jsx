import { useEffect, useState } from "react";
import { api } from "../services/api";
import { toast } from "react-toastify";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
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
                    cursor: requestSent ? "default" : "pointer"
                  }}
                >
                  {requestSent ? "Request Sent" : "Add Friend"}
                </button>
              ) : (
                <p style={{ color: "green", margin: "0.5rem 0" }}>✓ Friends</p>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}