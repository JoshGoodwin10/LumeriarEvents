// api/events.ts
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getToken = (): string | null => localStorage.getItem('token');

const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response;
};

// Public types
export interface Event {
    event_id: number;
    name: string;
    date: string;
    venue: string | null;
    rounds: number;
    start_time: string | null;
    end_time: string | null;
    registration_open: boolean;
    category: string | null;
    head_judge: number | null;
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

// Judge (for display)
export interface Judge {
    judge_id: number;
    first_name: string;
    surname: string;
    email: string;
    role: string;
}

// Score breakdown for a single round
export interface RoundScore {
    round: number;
    total: number;
    breakdown: {
        technical: number | null;
        innovation_design: number | null;
        theme: number | null;
        real_world: number | null;
        teamwork: number | null;
    };
}

// Team inside event details (includes scores)
export interface TeamInEvent {
    event_team_id: number;
    team_id: number;
    team_name: string;
    category: string;
    stored_total: number | null;
    judges: Judge[];                // judges who have approved scores for this team
    scores: {
        rounds: RoundScore[];
        overall_total: number;
    };
}

export interface EventDetails {
    event: Event;
    teams: TeamInEvent[];
}

// Public GET endpoints
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

export async function fetchEventDetails(eventId: number): Promise<EventDetails> {
    const res = await fetch(`/api/events/${eventId}/details`);
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to fetch event details' }));
        throw new Error(err.message || `HTTP ${res.status}`);
    }
    return res.json();
}

// Protected write operations (auth required)
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

// ─── NEW: Update only head_judge ──────────────────────────────
export async function updateHeadJudge(eventId: number, headJudgeId: number | null): Promise<void> {
    await authFetch(`/api/events/${eventId}/head-judge`, {
        method: "PUT",
        body: JSON.stringify({ head_judge: headJudgeId }),
    });
}