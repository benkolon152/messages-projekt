import { useEffect, useState, useRef } from "react";
import { api } from "../services/api";
import { toast } from "react-toastify";
import "./Inbox.css";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friendQuery, setFriendQuery] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(-1);
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
          // Find the newest message (first in DESC order)
          const newestMessage = data[0];
          // Only show notification if it's from someone else
          if (newestMessage && newestMessage.senderId !== userId) {
            const senderName = newestMessage.sender?.username || "Someone";
            toast.info(`New message from ${senderName}`);
          }
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
  const filteredFriends = friends.filter(f => f.username?.toLowerCase().includes(friendQuery.toLowerCase()));
  useEffect(() => {
    setHighlightIndex(filteredFriends.length ? 0 : -1);
  }, [friendQuery, friends]);

  return (
    <div style={{ display: "flex", height: "88vh", gap: 0, color: "var(--text)" }}>
      {/* Left sidebar - Friends list */}
      <div style={{ width: "300px", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <div style={{ padding: "1rem", borderBottom: "1px solid var(--border)", background: "var(--panel-subtle)" }}>
          <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Messages</h2>
        </div>
        <div style={{ padding: "0.75rem", borderBottom: "1px solid var(--border)" }}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Search friends..."
              value={friendQuery}
              onChange={e => setFriendQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Escape") {
                  setFriendQuery("");
                  return;
                }
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setHighlightIndex(prev => Math.min((prev < 0 ? 0 : prev + 1), Math.max(filteredFriends.length - 1, 0)));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setHighlightIndex(prev => Math.max((prev < 0 ? 0 : prev - 1), 0));
                } else if (e.key === "Enter") {
                  if (highlightIndex >= 0 && filteredFriends[highlightIndex]) {
                    setSelectedFriend(filteredFriends[highlightIndex].id);
                  }
                }
              }}
              style={{
                width: "100%",
                padding: "0.5rem 2rem 0.5rem 0.75rem",
                borderRadius: "0.25rem",
                border: "1px solid var(--input-border)",
                background: "var(--input-bg)",
                color: "var(--text)"
              }}
            />
            {friendQuery && (
              <button
                aria-label="Clear search"
                onClick={() => setFriendQuery("")}
                style={{
                  position: "absolute",
                  right: "0.5rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "var(--muted)",
                  cursor: "pointer",
                  fontSize: "1rem",
                  lineHeight: 1
                }}
              >
                ×
              </button>
            )}
          </div>
        </div>
        {friends.length === 0 ? (
          <div style={{ padding: "1rem", color: "var(--muted)" }}>No friends yet</div>
        ) : (
          filteredFriends.length === 0 ? (
            <div style={{ padding: "1rem", color: "var(--muted)" }}>No matching friends</div>
          ) : (
            filteredFriends.map((f, idx) => (
              <button
                key={f.id}
                onClick={() => setSelectedFriend(f.id)}
                style={{
                  background: selectedFriend === f.id
                    ? "var(--accent)"
                    : (idx === highlightIndex ? "var(--panel-subtle)" : "transparent"),
                  color: selectedFriend === f.id ? "var(--accent-contrast)" : "var(--text)",
                  border: "none",
                  padding: "1rem",
                  textAlign: "left",
                  cursor: "pointer",
                  borderBottom: "1px solid var(--border)",
                  fontSize: "1rem",
                  outline: idx === highlightIndex && selectedFriend !== f.id ? "2px solid var(--accent)" : "none"
                }}
              >
                {f.username}
              </button>
            ))
          )
        )}
      </div>

      {/* Right side - Chat area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {selectedFriend ? (
          <>
            {/* Chat header */}
            <div style={{ padding: "1rem", borderBottom: "1px solid var(--border)", background: "var(--panel-subtle)" }}>
              <h3 style={{ margin: 0 }}>
                {friends.find(f => f.id === selectedFriend)?.username}
              </h3>
            </div>

            {/* Messages area */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--muted)", marginTop: "2rem" }}>
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map(m => (
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
                        background: m.senderId === userId ? "var(--bubble-self-bg)" : "var(--bubble-other-bg)",
                        color: m.senderId === userId ? "var(--bubble-self-text)" : "var(--bubble-other-text)",
                        wordWrap: "break-word"
                      }}
                    >
                      {m.content}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input area */}
            <div style={{ padding: "1rem", borderTop: "1px solid var(--border)", display: "flex", gap: "0.5rem", background: "var(--panel-subtle)" }}>
              <input
                placeholder="Type a message..."
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                onKeyPress={e => e.key === "Enter" && sendMessage(selectedFriend)}
                style={{
                  flex: 1,
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.25rem",
                  border: "1px solid var(--input-border)",
                  background: "var(--input-bg)",
                  color: "var(--text)",
                  fontSize: "0.95rem",
                  resize: "none"
                }}
              />
              <button
                onClick={() => sendMessage(selectedFriend)}
                style={{
                  background: "var(--accent)",
                  color: "var(--accent-contrast)",
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
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
            <p>Select a friend to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
