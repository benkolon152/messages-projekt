// Normalize base API URL: ensure protocol and no trailing slash
const rawBase = import.meta.env.VITE_API_URL || "http://localhost:3000";
const withProtocol = /^(https?:)/.test(rawBase) ? rawBase : `https://${rawBase}`;
const API_URL = withProtocol.replace(/\/+$/, "");

export async function api(path, method = "GET", body) {
  const headers = {
    "Content-Type": "application/json",
  };
  
  const token = localStorage.getItem("token");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const fullPath = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;

  let res;
  try {
    res = await fetch(fullPath, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    console.error("Network error calling:", fullPath, err);
    throw err;
  }

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`API Error ${res.status}:`, errorText);
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}