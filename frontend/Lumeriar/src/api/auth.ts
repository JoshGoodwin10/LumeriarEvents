const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5173";

export async function loginUser(email_address: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email_address, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data; // { token, user }
}

export async function verifyToken(token: string) {
  const res = await fetch(`${API_BASE}/api/auth/verify`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok;
}
