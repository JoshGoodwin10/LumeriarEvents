const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  // Do NOT set Content-Type – browser will set it for FormData
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
  school_name?: string | null;
  theme: string | null;
  project_description: string | null;
  province: string | null;
  event: string | null;
  how_heard: string | null;
  material_bill: string | null;   // eventually a filename or URL, but for now we store the blob reference
  engineering_plan: string | null;
  project_report: string | null;
  engineering_journal: string | null;
  created_at: string;
}

export interface TeamFilters {
  school_id?: string;
  category?: string;
  search?: string;
}

export interface FilterOptions {
  categories: string[];
  school_ids: number[];
}

// ── CREATE (multipart/form-data) ─────────────────────────────
export async function createTeam(formData: FormData) {
  const res = await fetch(`${API_BASE}/api/teams`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  return handleResponse(res);
}

// ── UPDATE (multipart/form-data) ─────────────────────────────
export async function updateTeam(id: number, formData: FormData) {
  const res = await fetch(`${API_BASE}/api/teams/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });
  return handleResponse(res);
}

// ── READ ─────────────────────────────────────────────────────
export async function fetchTeams(filters: TeamFilters = {}): Promise<Team[]> {
  const params = new URLSearchParams();
  if (filters.school_id) params.set("school_id", filters.school_id);
  if (filters.category) params.set("category", filters.category);
  if (filters.search) params.set("search", filters.search);
  const res = await fetch(`${API_BASE}/api/teams?${params}`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function fetchFilterOptions(): Promise<FilterOptions> {
  const res = await fetch(`${API_BASE}/api/teams/filter-options`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function deleteTeam(id: number) {
  const res = await fetch(`${API_BASE}/api/teams/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// ── Team details (with coaches, students, etc.) ──────────────
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