import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("token");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  const dropdownRef = useRef(null);
  
  // Hide navbar on login and register pages
  const isAuthPage = location.pathname === "/" || location.pathname === "/register";

  // Apply dark mode on mount and when it changes
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [isDarkMode]);

  // Close dropdown when clicking outside
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
            <Link to="/inbox">Requests</Link>
            <Link to="/messages">Messages</Link>
            <Link to="/users">Users</Link>
            <div className="settings-dropdown" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                className="settings-btn"
              >
                Settings ▼
              </button>
              {isDropdownOpen && (
                <div className="dropdown-menu">
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