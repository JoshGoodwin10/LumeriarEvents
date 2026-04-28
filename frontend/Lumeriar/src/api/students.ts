// src/api/students.ts
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

export interface Student {
    student_id: number;
    first_name: string;
    surname: string;
    date_of_birth: string | null;
    team_id: number | null;
    created_at: string;
    grade: number | null;
    role: string | null;
    shirt_size: string | null;
    dietary_requirements: string | null;
    team_name?: string;  // joined from Team
}

export interface StudentFilters {
    search?: string;
    team_id?: string;
    grade?: string;
    role?: string;
}

export interface StudentFilterOptions {
    teams: { team_id: number; team_name: string }[];
    grades: number[];
    roles: string[];
}

export async function fetchStudents(filters: StudentFilters = {}): Promise<Student[]> {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.team_id) params.set("team_id", filters.team_id);
    if (filters.grade) params.set("grade", filters.grade);
    if (filters.role) params.set("role", filters.role);

    const res = await fetch(`${API_BASE}/api/students?${params}`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function fetchStudentFilterOptions(): Promise<StudentFilterOptions> {
    const res = await fetch(`${API_BASE}/api/students/filter-options`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function createStudent(data: Omit<Student, "student_id" | "created_at" | "team_name">) {
    const res = await fetch(`${API_BASE}/api/students`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
}

export async function updateStudent(id: number, data: Partial<Omit<Student, "student_id" | "created_at" | "team_name">>) {
    const res = await fetch(`${API_BASE}/api/students/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
}

export async function deleteStudent(id: number) {
    const res = await fetch(`${API_BASE}/api/students/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
    return handleResponse(res);
}