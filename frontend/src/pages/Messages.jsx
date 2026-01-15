import { useEffect, useState, useRef } from "react";
import { api } from "../services/api";
import { toast } from "react-toastify";
import "./Inbox.css";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [previousCount, setPreviousCount] = useState(0);
  const hasNotified = useRef(false);
  const messagesEndRef = useRef(null);
  const userId = parseInt(localStorage.getItem("userId"));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function loadMessages(forFriendId = null) {
    try {
      const data = await api("/messages");
      
      // Filter to show messages with selected friend
      let filtered = data;
      const friendToShow = forFriendId !== null ? forFriendId : selectedFriend;
      
      if (friendToShow) {
        filtered = data.filter(m => {
          // Show messages where I'm either the sender or receiver
          // AND the other person is the selected friend
          const isFromFriend = m.senderId === friendToShow && m.receiverId === userId;
          const isToFriend = m.senderId === userId && m.receiverId === friendToShow;
          return isFromFriend || isToFriend;
        });
      }
      
      // Only notify if count increased since last check
      if (data.length > previousCount && previousCount > 0) {
        if (!hasNotified.current) {
          toast.info("New message received");
          hasNotified.current = true;
        }
      } else {
        hasNotified.current = false;
      }
      setPreviousCount(data.length);
      
      // Reverse to show chronologically (backend returns DESC)
      setMessages([...filtered].reverse());
    } catch (err) {
      console.error("Error loading messages:", err);
      toast.error("Failed to load messages");
    }
  }

  async function loadFriends() {
    try {
      const data = await api("/friendships");
      setFriends(data);
    } catch (err) {
      console.log("No friends yet");
    }
  }

  async function sendMessage(friendId) {
    try {
      if (!messageText.trim()) {
        toast.error("Please enter a message");
        return;
      }
      const content = messageText;
      setMessageText("");
      
      await api("/messages", "POST", {
        receiverId: friendId,
        content: content
      });
      toast.success("Message sent");
      // Reload messages immediately with the friend ID to filter correctly
      await loadMessages(friendId);
    } catch (err) {
      console.error("Send message error:", err);
      toast.error(err.message || "Failed to send message");
    }
  }

  useEffect(() => {
    loadFriends();
  }, []);

  useEffect(() => {
    loadMessages();
    const i = setInterval(() => {
      loadMessages();
    }, 5000);
    return () => clearInterval(i);
  }, [selectedFriend]);

  return (
    <div style={{ display: "flex", height: "75vh", gap: 0 }}>
      {/* Left sidebar - Friends list */}
      <div style={{ width: "300px", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <div style={{ padding: "1rem", borderBottom: "1px solid #e5e7eb" }}>
          <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Messages</h2>
        </div>
        {friends.length === 0 ? (
          <div style={{ padding: "1rem", color: "#666" }}>No friends yet</div>
        ) : (
          friends.map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFriend(f.id)}
              style={{
                background: selectedFriend === f.id ? "#2563eb" : "transparent",
                color: selectedFriend === f.id ? "white" : "black",
                border: "none",
                padding: "1rem",
                textAlign: "left",
                cursor: "pointer",
                borderBottom: "1px solid #e5e7eb",
                fontSize: "1rem"
              }}
            >
              {f.username}
            </button>
          ))
        )}
      </div>

      {/* Right side - Chat area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {selectedFriend ? (
          <>
            {/* Chat header */}
            <div style={{ padding: "1rem", borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
              <h3 style={{ margin: 0 }}>
                {friends.find(f => f.id === selectedFriend)?.username}
              </h3>
            </div>

            {/* Messages area */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {console.log("Rendering messages. Count:", messages.length, "userId:", userId, "Messages:", messages)}
              {messages.length === 0 ? (
                <div style={{ textAlign: "center", color: "#999", marginTop: "2rem" }}>
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map(m => {
                  console.log("Rendering message:", m);
                  return (
                    <div
                      key={m.id}
                      style={{
                        display: "flex",
                        justifyContent: m.senderId === userId ? "flex-end" : "flex-start",
                        marginBottom: "0.5rem"
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "60%",
                          padding: "0.75rem 1rem",
                          borderRadius: "1rem",
                          background: m.senderId === userId ? "#2563eb" : "#e5e7eb",
                          color: m.senderId === userId ? "white" : "black",
                          wordWrap: "break-word"
                        }}
                      >
                        {m.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input area */}
            <div style={{ padding: "1rem", borderTop: "1px solid #e5e7eb", display: "flex", gap: "0.5rem" }}>
              <input
                placeholder="Type a message..."
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                onKeyPress={e => e.key === "Enter" && sendMessage(selectedFriend)}
                style={{
                  flex: 1,
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.25rem",
                  border: "1px solid #ccc",
                  fontSize: "0.95rem",
                  resize: "none"
                }}
              />
              <button
                onClick={() => sendMessage(selectedFriend)}
                style={{
                  background: "#10b981",
                  color: "white",
                  padding: "0.5rem 1rem",
                  border: "none",
                  borderRadius: "0.25rem",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: "500",
                  maxWidth: "100px",
                  height: "auto"
                }}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>
            <p>Select a friend to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
