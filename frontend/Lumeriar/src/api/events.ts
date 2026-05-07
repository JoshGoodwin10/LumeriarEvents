// api/events.ts

export interface Event {
    event_id: number;
    name: string;
    date: string;
    venue: string | null;
    start_time: string | null;
    end_time: string | null;
    registration_open: boolean;
    category: string | null;
    created_at: string;
    team_count?: number;
}

export interface EventFilters {
    search?: string;
    category?: string;
}

export interface EventFilterOptions {
    categories: string[];
}

// Helper to get the stored token (adjust localStorage key if needed)
const getToken = (): string | null => {
    return localStorage.getItem('token'); // or 'accessToken'
};

// Helper for authenticated requests (adds Bearer token)
const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response;
};

// ─── Public GET endpoints (no token required) ─────────────────
export async function fetchEvents(filters: EventFilters = {}): Promise<Event[]> {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.category) params.append("category", filters.category);
    const res = await fetch(`/api/events?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch events");
    return res.json();
}

export async function fetchEventFilterOptions(): Promise<EventFilterOptions> {
    const res = await fetch("/api/events/filter-options");
    if (!res.ok) throw new Error("Failed to fetch filter options");
    return res.json();
}

// ─── Write operations (require authentication) ─────────────────
export type EventPayload = Omit<Event, "event_id" | "created_at" | "team_count">;

export async function createEvent(payload: EventPayload): Promise<{ event_id: number }> {
    const res = await authFetch("/api/events", {
        method: "POST",
        body: JSON.stringify(payload),
    });
    return res.json();
}

export async function updateEvent(eventId: number, payload: Partial<EventPayload>): Promise<void> {
    await authFetch(`/api/events/${eventId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function deleteEvent(eventId: number): Promise<void> {
    await authFetch(`/api/events/${eventId}`, { method: "DELETE" });
}

// Add these interfaces and functions to your existing api/events.ts

export interface Judge {
    judge_id: number;
    first_name: string;
    surname: string;
    email: string;
    role: string;
}

export interface TeamInEvent {
    event_team_id: number;
    team_id: number;
    team_name: string;
    category: string;
    total_points: number | null;
    joined_at: string;
    judges: Judge[];
}

export interface EventDetails {
    event: Event;          // the Event type from your existing definitions
    teams: TeamInEvent[];
}

// GET /api/events/:id/details (public)
export async function fetchEventDetails(eventId: number): Promise<EventDetails> {
    const res = await fetch(`/api/events/${eventId}/details`);
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to fetch event details' }));
        throw new Error(err.message || `HTTP ${res.status}`);
    }
    return res.json();
}

// POST /api/events/:id/assign-judge (requires auth)
export async function assignJudgeToTeam(eventId: number, teamId: number, judgeId: number): Promise<{ message: string }> {
    const res = await authFetch(`/api/events/${eventId}/assign-judge`, {
        method: 'POST',
        body: JSON.stringify({ team_id: teamId, judge_id: judgeId }),
    });
    return res.json();
}

// DELETE /api/events/:id/remove-judge (requires auth)
export async function removeJudgeFromTeam(eventId: number, teamId: number, judgeId: number): Promise<{ message: string }> {
    const res = await authFetch(`/api/events/${eventId}/remove-judge`, {
        method: 'DELETE',
        body: JSON.stringify({ team_id: teamId, judge_id: judgeId }),
    });
    return res.json();
}