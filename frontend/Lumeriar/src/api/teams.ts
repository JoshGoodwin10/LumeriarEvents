const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(res: Response) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export interface Team {
  team_id:             number;
  team_name:           string;
  category:            string | null;
  school_id:           number | null;
  year:                number | null;
  theme:               string | null;
  project_description: string | null;
  created_at:          string;
}

export interface TeamFilters {
  school_id?: string;
  category?:  string;
  year?:      string;
  search?:    string;
}

export interface FilterOptions {
  categories: string[];
  years:      number[];
  school_ids: number[];
}

// ── Read ──────────────────────────────────────────────────────
export async function fetchTeams(filters: TeamFilters = {}): Promise<Team[]> {
  const params = new URLSearchParams();
  if (filters.school_id) params.set("school_id", filters.school_id);
  if (filters.category)  params.set("category",  filters.category);
  if (filters.year)      params.set("year",       filters.year);
  if (filters.search)    params.set("search",     filters.search);

  const res = await fetch(`${API_BASE}/api/teams?${params}`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function fetchFilterOptions(): Promise<FilterOptions> {
  const res = await fetch(`${API_BASE}/api/teams/filter-options`, { headers: authHeaders() });
  return handleResponse(res);
}

// ── Create ────────────────────────────────────────────────────
export async function createTeam(data: Omit<Team, "team_id" | "created_at">) {
  const res = await fetch(`${API_BASE}/api/teams`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// ── Update ────────────────────────────────────────────────────
export async function updateTeam(id: number, data: Omit<Team, "team_id" | "created_at">) {
  const res = await fetch(`${API_BASE}/api/teams/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// ── Delete ────────────────────────────────────────────────────
export async function deleteTeam(id: number) {
  const res = await fetch(`${API_BASE}/api/teams/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse(res);
}
