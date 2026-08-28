// src/api/documents.ts
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

export interface Document {
    document_id: number;
    name: string;
    description: string;
    version: string;
    file_name: string;
    upload_date: string;
    is_current: number;
}

export async function fetchDocuments(): Promise<Document[]> {
    const res = await fetch(`${API_BASE}/api/documents/all`, { headers: authHeaders() });
    return handleResponse(res);
}