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

export interface Event {
    team_count: number;
    event_id: number;
    name: string;
    date: string;          // ISO date string (YYYY-MM-DD)
    category: string;
    created_at: string;
}

export interface EventFilters {
    search?: string;
    category?: string;
}

export interface EventFilterOptions {
    categories: string[];
}

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


