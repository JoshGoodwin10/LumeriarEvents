// src/api/requests.ts
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

export interface TeamRequest {
    request_id: number;
    team_name: string;
    category: string | null;
    school_id: number | null;
    theme: string | null;               // "Agri - Agricultural Technology", etc.
    created_at: string;
    province: string | null;
    event: string | null;               // event name or event_id? We'll store event_id as number
    project_description: string | null;
    how_heard: string | null;
    build_budget_materials: string | null;
    engineering_plans: string | null;   // file path
    progress_1: string | null;
    progress_2: string | null;
    progress_3: string | null;
    progress_4: string | null;
    progress_5: string | null;
    engineering_journal: string | null;
    is_approved: boolean;
}

export interface StudentRequest {
    student_id: number;
    first_name: string;
    surname: string;
    date_of_birth: string | null;
    grade: number | null;
    role: string | null;
    requested_team: number;             // team_request_id
    shirt_size: string | null;
    dietary_requirements: string | null;
    created_at: string;
    parent_guardian_consent_form: string | null;   // file path
    signed_integrity_declaration: string | null;   // file path
}

export interface CoachRequest {
    request_id: number;
    first_name: string;
    surname: string;
    email: string | null;
    phone_no: string | null;
    date_of_birth: string | null;
    requested_team: number;            // team_request_id
    created_at: string;
    shirt_size: string | null;
    dietary_requirements: string | null;
}

export interface RequestDetails {
    teamRequest: TeamRequest;
    students: StudentRequest[];
    coach: CoachRequest | null;
}

export async function fetchTeamRequests(filters?: { search?: string; is_approved?: boolean }): Promise<TeamRequest[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.set("search", filters.search);
    if (filters?.is_approved !== undefined) params.set("is_approved", String(filters.is_approved));
    const res = await fetch(`${API_BASE}/api/requests?${params}`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function fetchTeamRequestDetails(id: number): Promise<RequestDetails> {
    const res = await fetch(`${API_BASE}/api/requests/${id}/details`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function approveTeamRequest(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/api/requests/${id}/approve`, {
        method: "POST",
        headers: authHeaders(),
    });
    return handleResponse(res);
}