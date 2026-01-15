import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../services/api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleRegister() {
    try {
      await api("/auth/register", "POST", { username, password });
      toast.success("Registration successful");
      navigate("/");
    } catch {
      toast.error("Username already exists");
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Register</h2>

        <input onChange={e => setUsername(e.target.value)} placeholder="Username" />
        <input type="password" onChange={e => setPassword(e.target.value)} placeholder="Password" />

        <button onClick={handleRegister}>Create account</button>
      </div>
    </div>
  );
}