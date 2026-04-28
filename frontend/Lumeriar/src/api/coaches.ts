// src/api/coaches.ts
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

export interface Coach {
    coach_id: number;
    first_name: string;
    surname: string;
    email: string;
    phone_no: string;
    date_of_birth: string;
    team_id: number;
    created_at: string;
    team_name?: string;  // joined from Team
}

export interface CoachFilters {
    search?: string;
    team_id?: string;
}

export interface CoachFilterOptions {
    teams: { team_id: number; team_name: string }[];
}

export async function fetchCoaches(filters: CoachFilters = {}): Promise<Coach[]> {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.team_id) params.set("team_id", filters.team_id);

    const res = await fetch(`${API_BASE}/api/coaches?${params}`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function fetchCoachFilterOptions(): Promise<CoachFilterOptions> {
    const res = await fetch(`${API_BASE}/api/coaches/filter-options`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function createCoach(data: Omit<Coach, "coach_id" | "created_at" | "team_name">) {
    const res = await fetch(`${API_BASE}/api/coaches`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
}

export async function updateCoach(id: number, data: Partial<Omit<Coach, "coach_id" | "created_at" | "team_name">>) {
    const res = await fetch(`${API_BASE}/api/coaches/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
}

export async function deleteCoach(id: number) {
    const res = await fetch(`${API_BASE}/api/coaches/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
    return handleResponse(res);
}