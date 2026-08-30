// api/scores.ts
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

export interface Score {
    score_id: number;
    event_team_id: number;
    round: number;
    technical_score: number | null;
    innovation_design_score: number | null;
    theme_score: number | null;
    real_world_score: number | null;
    teamwork_score: number | null;
    judge_id: number;
    is_approved: number;
    created_at: string;
    // joined fields for convenience
    judge_first?: string;
    judge_surname?: string;
}

export interface ScorePayload {
    event_team_id: number;
    round: number;
    judge_id: number;
    technical_score?: number | null;
    innovation_design_score?: number | null;
    theme_score?: number | null;
    real_world_score?: number | null;
    teamwork_score?: number | null;
    change_reason?: string;
}

// Fetch all scores for a given event (optional, if needed)
export async function fetchEventScores(eventId: number): Promise<Score[]> {
    const res = await fetch(`${API_BASE}/api/scores/event/${eventId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error('Failed to fetch scores');
    return res.json();
}

// Save (create or update) a score – uses event_team_id
export async function saveScore(payload: ScorePayload): Promise<{ score_id: number }> {
    const res = await authFetch(`${API_BASE}/api/scores`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return res.json();
}

// Approve a score
export async function approveScore(scoreId: number): Promise<void> {
    await authFetch(`${API_BASE}/api/scores/${scoreId}/approve`, { method: 'PUT' });
}

// Fetch history for a score
export interface ScoreHistory {
    history_id: number;
    score_id: number;
    change_date: string;
    first_name: string;
    surname: string;
    change_reason: string;
    old_technical_score: number | null;
    new_technical_score: number | null;
    old_innovation_design_score: number | null;
    new_innovation_design_score: number | null;
    old_theme_score: number | null;
    new_theme_score: number | null;
    old_real_world_score: number | null;
    new_real_world_score: number | null;
    old_teamwork_score: number | null;
    new_teamwork_score: number | null;
}

export async function fetchScoreHistory(scoreId: number): Promise<ScoreHistory[]> {
    const res = await fetch(`${API_BASE}/api/scores/${scoreId}/history`, {
        headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
}