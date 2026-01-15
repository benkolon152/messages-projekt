import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../services/api.js";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleLogin() {
    try {
      const data = await api("/auth/login", "POST", { username, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      toast.success("Login successful");
      navigate("/messages");
    } catch {
      toast.error("Invalid credentials");
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Login</h2>

        <input onChange={e => setUsername(e.target.value)} onKeyPress={e => e.key === "Enter" && handleLogin()} placeholder="Username" />
        <input type="password" onChange={e => setPassword(e.target.value)} onKeyPress={e => e.key === "Enter" && handleLogin()} placeholder="Password" />

        <button id="loginbutton" onClick={handleLogin}>Login</button>
        <p>
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}