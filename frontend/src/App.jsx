import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Inbox from "./pages/Inbox";
import Users from "./pages/Users";
import ProtectedRoute from "./components/ProtectedRoute";
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/users" element={<Users />} />
        <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}