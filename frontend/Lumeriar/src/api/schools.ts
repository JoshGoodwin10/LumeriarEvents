// src/api/schools.ts
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

export interface School {
    school_id: number;
    school_name: string;
    best_score: number | null;
    avg_score: number | null;
    province: string | null;
    created_at: string;
    no_teams: number;
}

export interface SchoolFilters {
    search?: string;
    province?: string;
}

export interface SchoolFilterOptions {
    provinces: string[];
}

export async function fetchSchools(filters: SchoolFilters = {}): Promise<School[]> {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.province) params.set("province", filters.province);

    const res = await fetch(`${API_BASE}/api/schools?${params}`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function fetchSchoolFilterOptions(): Promise<SchoolFilterOptions> {
    const res = await fetch(`${API_BASE}/api/schools/filter-options`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function createSchool(data: Omit<School, "school_id" | "created_at">) {
    const res = await fetch(`${API_BASE}/api/schools`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
}

export async function updateSchool(id: number, data: Partial<Omit<School, "school_id" | "created_at">>) {
    const res = await fetch(`${API_BASE}/api/schools/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
}

export async function deleteSchool(id: number) {
    const res = await fetch(`${API_BASE}/api/schools/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
    return handleResponse(res);
}