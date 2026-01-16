import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api.js";
import "./Navbar.css";

const apiBase = (() => {
  const raw = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const withProtocol = /^(https?:)/.test(raw) ? raw : `https://${raw}`;
  return withProtocol.replace(/\/+$, "");
})();

function getProfileSrc(url) {
  if (!url) return null;
  const clean = url.trim();
  if (/^https?:/i.test(clean)) return clean;
  return `${apiBase}${clean.startsWith("/") ? "" : "/"}${clean}`;
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("token");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const isAuthPage = location.pathname === "/" || location.pathname === "/register";

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (isLoggedIn && !isAuthPage) {
      loadProfilePicture();
    } else {
      setProfilePicture(null);
    }
  }, [isLoggedIn, isAuthPage]);

  async function loadProfilePicture() {
    try {
      const data = await api("/users/me");
      setProfilePicture(data?.profilePicture || null);
    } catch (err) {
      console.error("Failed to load profile picture:", err);
      setProfilePicture(null);
    }
  }

  async function handleProfilePictureUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      const rawBase = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const withProtocol = /^(https?:)/.test(rawBase) ? rawBase : `https://${rawBase}`;
      const API_URL = withProtocol.replace(/\/+$/, "");

      const response = await fetch(`${API_URL}/users/profile-picture`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: formData
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setProfilePicture(data.profilePicture);
      toast.success("Profile picture updated");
      setIsDropdownOpen(false);
    } catch (err) {
      toast.error("Failed to upload profile picture");
    }
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleDarkMode() {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("darkMode", newMode.toString());
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setProfilePicture(null);
    setIsDropdownOpen(false);
    navigate("/");
  }

  if (isAuthPage) {
    return (
      <nav className="navbar">
        <h1 className="logo">Chat Hub</h1>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <h1 className="logo">Chat Hub</h1>
      <div className="nav-links">
        {isLoggedIn ? (
          <>
            <Link to="/messages">Messages</Link>
            <Link to="/users">Users</Link>
            <Link to="/inbox">Requests</Link>
            <div className="settings-dropdown" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                className="settings-btn"
              >
                {profilePicture ? (
                  <img
                    src={getProfileSrc(profilePicture)}
                    alt="Profile"
                    className="profile-picture-small"
                  />
                ) : (
                  <span className="profile-placeholder">👤</span>
                )}
                Settings ▼
              </button>
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <button onClick={() => fileInputRef.current?.click()} className="dropdown-item">
                    📷 Upload Picture
                  </button>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    onChange={handleProfilePictureUpload}
                    style={{ display: "none" }}
                  />
                  <button onClick={toggleDarkMode} className="dropdown-item">
                    {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
                  </button>
                  <button onClick={handleLogout} className="dropdown-item logout-item">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </nav>
  );
}