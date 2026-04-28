//import { API_BASE, authHeaders, handleResponse } from './teams'; // or extract common utils
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export interface School {
    school_id: number;
    school_name: string;
    best_score: number | null;
    avg_score: number | null;
    province: string;
    created_at: string;
    no_teams: number;
}

export async function fetchSchools(): Promise<School[]> {
    const res = await fetch(`${API_BASE}/api/schools`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function createSchool(data: Omit<School, 'school_id' | 'created_at'>) {
    const res = await fetch(`${API_BASE}/api/schools`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
}

export async function updateSchool(id: number, data: Partial<School>) {
    const res = await fetch(`${API_BASE}/api/schools/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
}

export async function deleteSchool(id: number) {
    const res = await fetch(`${API_BASE}/api/schools/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    return handleResponse(res);
}

function authHeaders(): HeadersInit | undefined {
    throw new Error("Function not implemented.");
}


function handleResponse(res: Response): School[] | PromiseLike<School[]> {
    throw new Error("Function not implemented.");
}

// api/schools.ts or add to teams.ts
export async function fetchSchoolsList(): Promise<{ school_id: number; school_name: string }[]> {
    const res = await fetch(`${API_BASE}/api/schools`, { headers: authHeaders() });
    const data = await handleResponse(res);
    // return only id and name
    return data.map((s: any) => ({ school_id: s.school_id, school_name: s.school_name }));
}
