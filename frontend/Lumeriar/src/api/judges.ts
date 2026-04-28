// src/api/judges.ts
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

export interface Judge {
    judge_id: number;
    first_name: string;
    surname: string;
    school_id: number;
    email: string;
    phone_no: string;
    date_of_birth: string;
    role: string;
    created_at: string;
    // joined fields
    school_name?: string;
}

export interface JudgeFilters {
    search?: string;
    school_id?: string;
    role?: string;
}

export interface JudgeFilterOptions {
    schools: { school_id: number; school_name: string }[];
    roles: string[];
}

export async function fetchJudges(filters: JudgeFilters = {}): Promise<Judge[]> {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.school_id) params.set("school_id", filters.school_id);
    if (filters.role) params.set("role", filters.role);

    const res = await fetch(`${API_BASE}/api/judges?${params}`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function fetchJudgeFilterOptions(): Promise<JudgeFilterOptions> {
    const res = await fetch(`${API_BASE}/api/judges/filter-options`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function createJudge(data: Omit<Judge, "judge_id" | "created_at" | "school_name">) {
    const res = await fetch(`${API_BASE}/api/judges`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
}

export async function updateJudge(id: number, data: Partial<Omit<Judge, "judge_id" | "created_at" | "school_name">>) {
    const res = await fetch(`${API_BASE}/api/judges/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
}

export async function deleteJudge(id: number) {
    const res = await fetch(`${API_BASE}/api/judges/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
    return handleResponse(res);
}