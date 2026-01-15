import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <h1 className="logo">ChatApp</h1>
      <div className="nav-links">
        <Link to="/inbox">Inbox</Link>
        <Link to="/users">Users</Link>
      </div>
    </nav>
  );
}