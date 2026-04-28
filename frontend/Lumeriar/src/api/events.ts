// src/api/events.ts
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

// ─── Types ─────────────────────────────────────────────────────
export interface Event {
    event_id: number;
    name: string;
    date: string;
    category: string | null;
    created_at: string;
    team_count?: number; // optional, used in list view
}

export interface EventFilters {
    search?: string;
    category?: string;
}

export interface EventFilterOptions {
    categories: string[];
}

export interface TeamInEvent {
    event_team_id: number;
    team_id: number;
    team_name: string;
    category: string;
    total_points: number | null;
    joined_at: string;
    judges: {
        judge_id: number;
        first_name: string;
        surname: string;
        email: string;
        role: string;
    }[];
}

export interface EventDetails {
    event: {
        event_id: number;
        name: string;
        date: string;
        category: string | null;
        created_at: string;
    };
    teams: TeamInEvent[];
}

// ─── Event CRUD (already existing) ───────────────────────────
export async function fetchEvents(filters: EventFilters = {}): Promise<Event[]> {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.category) params.set("category", filters.category);

    const res = await fetch(`${API_BASE}/api/events?${params}`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function fetchEventFilterOptions(): Promise<EventFilterOptions> {
    const res = await fetch(`${API_BASE}/api/events/filter-options`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function createEvent(data: Omit<Event, "event_id" | "created_at">) {
    const res = await fetch(`${API_BASE}/api/events`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
}

export async function updateEvent(id: number, data: Partial<Omit<Event, "event_id" | "created_at">>) {
    const res = await fetch(`${API_BASE}/api/events/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
}

export async function deleteEvent(id: number) {
    const res = await fetch(`${API_BASE}/api/events/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
    return handleResponse(res);
}

// ─── New: Event Details & Judge Assignment ────────────────────
export async function fetchEventDetails(id: number): Promise<EventDetails> {
    const res = await fetch(`${API_BASE}/api/events/${id}/details`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function assignJudgeToTeam(eventId: number, teamId: number, judgeId: number) {
    const res = await fetch(`${API_BASE}/api/events/${eventId}/assign-judge`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ team_id: teamId, judge_id: judgeId }),
    });
    return handleResponse(res);
}

export async function removeJudgeFromTeam(eventId: number, teamId: number, judgeId: number) {
    const res = await fetch(`${API_BASE}/api/events/${eventId}/remove-judge`, {
        method: "DELETE",
        headers: authHeaders(),
        body: JSON.stringify({ team_id: teamId, judge_id: judgeId }),
    });
    return handleResponse(res);
}