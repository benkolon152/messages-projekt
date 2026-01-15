import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../services/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleLogin() {
    try {
      const data = await api("/auth/login", "POST", { username, password });
      localStorage.setItem("token", data.token);
      toast.success("Login successful");
      navigate("/inbox");
    } catch {
      toast.error("Invalid credentials");
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Login</h2>

        <input onChange={e => setUsername(e.target.value)} placeholder="Username" />
        <input type="password" onChange={e => setPassword(e.target.value)} placeholder="Password" />

        <button onClick={handleLogin}>Login</button>
        <p>
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}