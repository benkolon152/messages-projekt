import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("token");
  
  // Hide navbar on login and register pages
  const isAuthPage = location.pathname === "/" || location.pathname === "/register";

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  if (isAuthPage) {
    return (
      <nav className="navbar">
        <h1 className="logo">ChatApp</h1>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <h1 className="logo">ChatApp</h1>
      <div className="nav-links">
        {isLoggedIn ? (
          <>
            <Link to="/inbox">Requests</Link>
            <Link to="/messages">Messages</Link>
            <Link to="/users">Users</Link>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </>
        ) : null}
      </div>
    </nav>
  );
}