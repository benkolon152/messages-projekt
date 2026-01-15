import { useEffect, useState } from "react";
import { api } from "../services/api";
import { toast } from "react-toastify";
import "./Inbox.css";

export default function Inbox() {
  const [requests, setRequests] = useState([]);

  async function loadRequests() {
    try {
      const data = await api("/friendships/requests/pending");
      setRequests(data);
    } catch (err) {
      console.log("No pending requests");
    }
  }

  async function acceptRequest(friendshipId) {
    try {
      await api(`/friendships/accept/${friendshipId}`, "POST", {});
      toast.success("Friend request accepted");
      loadRequests();
    } catch (err) {
      toast.error("Failed to accept request");
    }
  }

  async function declineRequest(friendshipId) {
    try {
      await api(`/friendships/decline/${friendshipId}`, "POST", {});
      toast.success("Friend request declined");
      loadRequests();
    } catch (err) {
      toast.error("Failed to decline request");
    }
  }

  useEffect(() => {
    loadRequests();
    const i = setInterval(loadRequests, 5000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="container">
      <h2>Friend Requests</h2>

      {requests.length === 0 ? (
        <p>No pending friend requests</p>
      ) : (
        requests.map(r => (
          <div key={r.id} className="card" style={{ marginBottom: "1rem" }}>
            <p><strong>{r.user?.username}</strong> sent you a friend request</p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => acceptRequest(r.id)}
                style={{
                  background: "#22c55e",
                  color: "white",
                  padding: "0.5rem 1rem",
                  border: "none",
                  borderRadius: "0.25rem",
                  cursor: "pointer"
                }}
              >
                Accept
              </button>
              <button
                onClick={() => declineRequest(r.id)}
                style={{
                  background: "#ef4444",
                  color: "white",
                  padding: "0.5rem 1rem",
                  border: "none",
                  borderRadius: "0.25rem",
                  cursor: "pointer"
                }}
              >
                Decline
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}