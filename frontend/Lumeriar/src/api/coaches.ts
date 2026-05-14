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
    email: string | null;
    phone_no: string | null;
    date_of_birth: string | null;
    staff_number: string | null;
    dietary_requirements: string | null;
    shirt_size: string | null;
    signed_integrity_declaration: string | null; // filename or flag; adjust as needed
    school_id: number | null;
    school_name?: string;          // joined from School table
    created_at: string;
}

export interface CoachFilters {
    search?: string;
    school_id?: string;            // filter by school
}

export interface CoachFilterOptions {
    schools: { school_id: number; school_name: string }[];
}

export async function fetchCoaches(filters: CoachFilters = {}): Promise<Coach[]> {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.school_id) params.set("school_id", filters.school_id);

    const res = await fetch(`${API_BASE}/api/coaches?${params}`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function fetchCoachFilterOptions(): Promise<CoachFilterOptions> {
    const res = await fetch(`${API_BASE}/api/coaches/filter-options`, { headers: authHeaders() });
    return handleResponse(res);
}

// Create: all fields except coach_id, created_at, school_name
export async function createCoach(data: Omit<Coach, "coach_id" | "created_at" | "school_name">) {
    const res = await fetch(`${API_BASE}/api/coaches`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
}

// Update: partial fields
export async function updateCoach(id: number, data: Partial<Omit<Coach, "coach_id" | "created_at" | "school_name">>) {
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