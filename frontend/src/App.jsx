import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Inbox from "./pages/Inbox";
import Messages from "./pages/Messages";
import Users from "./pages/Users";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import './App.css'

export default function App() {
  const isDark = typeof window !== 'undefined' && localStorage.getItem("darkMode") === "true";
  return (
    <BrowserRouter>
      <ToastContainer theme={isDark ? "dark" : "light"} />
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}