const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function api(path, method = "GET", body) {
  const headers = {
    "Content-Type": "application/json",
  };
  
  const token = localStorage.getItem("token");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`API Error ${res.status}:`, errorText);
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}