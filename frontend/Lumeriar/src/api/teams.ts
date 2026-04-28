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
  team_id: number;
  team_name: string;
  category: string | null;
  school_id: number | null;
  school_name?: string | null; // Optional, included when fetching teams with school details
  year: number | null;
  theme: string | null;
  project_description: string | null;
  created_at: string;
}

export interface TeamFilters {
  school_id?: string;
  category?: string;
  year?: string;
  search?: string;
}

export interface FilterOptions {
  categories: string[];
  years: number[];
  school_ids: number[];
}

// ── Read ──────────────────────────────────────────────────────
export async function fetchTeams(filters: TeamFilters = {}): Promise<Team[]> {
  const params = new URLSearchParams();
  if (filters.school_id) params.set("school_id", filters.school_id);
  if (filters.category) params.set("category", filters.category);
  if (filters.year) params.set("year", filters.year);
  if (filters.search) params.set("search", filters.search);

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

// api/teams.ts

export interface TeamWithDetails {
  team: Team;
  school: {
    school_id: number;
    school_name: string;
    best_score: number | null;
    avg_score: number | null;
    province: string;
    created_at: string;
    no_teams: number;
  } | null;
  coaches: Array<{
    coach_id: number;
    first_name: string;
    surname: string;
    email: string;
    phone_no: string;
    date_of_birth: string;
    created_at: string;
  }>;
  students: Array<{
    student_id: number;
    first_name: string;
    surname: string;
    date_of_birth: string;
    grade: number | null;
    role: string | null;
    shirt_size: string | null;
    dietary: string | null;
  }>;
  documents: Array<{
    document_id: number;
    name: string;
    type: string;
  }>;
  eventTeams: Array<{
    event_team_id: number;
    event_id: number;
    total_points_created_at: string | null;
  }>;
}

export async function fetchTeamWithDetails(id: number): Promise<TeamWithDetails> {
  const res = await fetch(`${API_BASE}/api/teams/${id}/details`, { headers: authHeaders() });
  return handleResponse(res);
}
