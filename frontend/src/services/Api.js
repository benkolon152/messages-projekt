const API_URL = import.meta.env.VITE_API_URL;

export async function api(path, method = "GET", body) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("token"),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    throw new Error("API error");
  }

  return res.json();
}