// src/api/scores.ts
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

export interface Score {
    score_id: number;
    event_team_id: number;
    team_id: number;            // added via join
    team_name: string;          // from join
    round: number;
    technical_score: number | null;
    innovation_design_score: number | null;
    theme_score: number | null;
    real_world_score: number | null;
    teamwork_score: number | null;
    judge_id: number;
    judge_first: string;
    judge_surname: string;
    is_approved: boolean;
    created_at: string;
    updated_at: string;
}

export interface ScoreHistory {
    history_id: number;
    score_id: number;
    judge_id: number;
    first_name: string;
    surname: string;
    change_date: string;
    reason_change: string;
    old_technical_score: number;
    new_technical_score: number;
    old_innovation_design_score: number;
    new_innovation_design_score: number;
    old_theme_score: number;
    new_theme_score: number;
    old_real_world_score: number;
    new_real_world_score: number;
    old_teamwork_score: number;
    new_teamwork_score: number;
}

// Fetch all scores for a given event (returns scores with team & judge details)
export async function fetchEventScores(eventId: number): Promise<Score[]> {
    const res = await fetch(`${API_BASE}/api/scores/event/${eventId}`, { headers: authHeaders() });
    return handleResponse(res);
}

// Create or update a score for a specific team, round, and judge in an event
export async function saveScore(
    eventId: number,
    data: {
        team_id: number;
        round: number;
        judge_id: number;
        technical_score?: number | null;
        innovation_design_score?: number | null;
        theme_score?: number | null;
        real_world_score?: number | null;
        teamwork_score?: number | null;
        reason_change?: string;
    }
) {
    const res = await fetch(`${API_BASE}/api/scores/event/${eventId}`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
}

// Approve a score (only admin)
export async function approveScore(scoreId: number) {
    const res = await fetch(`${API_BASE}/api/scores/${scoreId}/approve`, {
        method: "PUT",
        headers: authHeaders(),
    });
    return handleResponse(res);
}

// Fetch history of changes for a specific score
export async function fetchScoreHistory(scoreId: number): Promise<ScoreHistory[]> {
    const res = await fetch(`${API_BASE}/api/scores/${scoreId}/history`, { headers: authHeaders() });
    return handleResponse(res);
}