// src/pages/EventDetail.tsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { fetchJudges, type Judge } from "../../api/judges";
import {
    fetchEventDetails,
    type TeamInEvent,
} from "../../api/events";
import {
    saveScore,
    approveScore,
    fetchScoreHistory,
    type ScoreHistory,
} from "../../api/scores";

// ─── Score Edit Modal (with judge selection) ─────────────────
function ScoreModal({
    eventId,
    eventTeamId,
    teamName,
    round,
    existingScore,
    allJudges,
    onClose,
    onSaved,
}: {
    eventId: number;
    eventTeamId: number;
    teamName: string;
    round: number;
    existingScore?: {
        score_id: number;
        technical_score: number | null;
        innovation_design_score: number | null;
        theme_score: number | null;
        real_world_score: number | null;
        teamwork_score: number | null;
        judge_id: number;
    };
    allJudges: Judge[];
    onClose: () => void;
    onSaved: () => void;
}) {
    const [form, setForm] = useState({
        judge_id: existingScore?.judge_id ?? (allJudges[0]?.judge_id || 0),
        technical_score: existingScore?.technical_score ?? "",
        innovation_design_score: existingScore?.innovation_design_score ?? "",
        theme_score: existingScore?.theme_score ?? "",
        real_world_score: existingScore?.real_world_score ?? "",
        teamwork_score: existingScore?.teamwork_score ?? "",
        reason_change: "",
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const setField = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.judge_id) {
            setError("Please select a judge.");
            return;
        }
        setSaving(true);
        setError("");
        try {
            await saveScore({
                event_team_id: eventTeamId,
                round,
                judge_id: form.judge_id,
                technical_score: form.technical_score ? Number(form.technical_score) : null,
                innovation_design_score: form.innovation_design_score ? Number(form.innovation_design_score) : null,
                theme_score: form.theme_score ? Number(form.theme_score) : null,
                real_world_score: form.real_world_score ? Number(form.real_world_score) : null,
                teamwork_score: form.teamwork_score ? Number(form.teamwork_score) : null,
                reason_change: form.reason_change,
            });
            onSaved();
        } catch (err: any) {
            setError(err.message || "Save failed.");
        } finally {
            setSaving(false);
        }
    };

    return createPortal(
        <div className="tdm-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="tdm-box">
                <div className="tdm-head">
                    <h2 className="tdm-title">{existingScore ? "Edit Score" : "New Score"}</h2>
                    <button className="tdm-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit} className="tdm-form">
                    <p>Team: {teamName} | Round {round}</p>
                    <div className="tdm-field">
                        <label>Judge</label>
                        <select value={form.judge_id} onChange={(e) => setField("judge_id", Number(e.target.value))}>
                            {allJudges.map(j => (
                                <option key={j.judge_id} value={j.judge_id}>{j.first_name} {j.surname}</option>
                            ))}
                        </select>
                    </div>
                    <div className="tdm-row">
                        <div className="tdm-field">
                            <label>Technical Score</label>
                            <input type="number" step="0.01" value={form.technical_score} onChange={(e) => setField("technical_score", e.target.value)} />
                        </div>
                        <div className="tdm-field">
                            <label>Innovation & Design</label>
                            <input type="number" step="0.01" value={form.innovation_design_score} onChange={(e) => setField("innovation_design_score", e.target.value)} />
                        </div>
                    </div>
                    <div className="tdm-row">
                        <div className="tdm-field">
                            <label>Theme</label>
                            <input type="number" step="0.01" value={form.theme_score} onChange={(e) => setField("theme_score", e.target.value)} />
                        </div>
                        <div className="tdm-field">
                            <label>Real World</label>
                            <input type="number" step="0.01" value={form.real_world_score} onChange={(e) => setField("real_world_score", e.target.value)} />
                        </div>
                    </div>
                    <div className="tdm-field">
                        <label>Teamwork</label>
                        <input type="number" step="0.01" value={form.teamwork_score} onChange={(e) => setField("teamwork_score", e.target.value)} />
                    </div>
                    <div className="tdm-field">
                        <label>Reason for change (optional)</label>
                        <textarea rows={2} value={form.reason_change} onChange={(e) => setField("reason_change", e.target.value)} />
                    </div>
                    {error && <p className="tdm-error">{error}</p>}
                    <div className="tdm-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? <span className="spinner-sm" /> : existingScore ? "Update" : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}

// ─── Score History Modal (unchanged) ─────────────────────────
function HistoryModal({ scoreId, onClose }: { scoreId: number; onClose: () => void }) {
    const [history, setHistory] = useState<ScoreHistory[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchScoreHistory(scoreId).then(setHistory).catch(console.error).finally(() => setLoading(false));
    }, [scoreId]);
    return createPortal(
        <div className="tdm-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="tdm-box tdm-box-sm">
                <div className="tdm-head">
                    <h2 className="tdm-title">Score History</h2>
                    <button className="tdm-close" onClick={onClose}>×</button>
                </div>
                {loading ? <div className="td-loading"><span className="spinner-sm" /></div> : history.length === 0 ? <p>No changes recorded.</p> : (
                    <div className="history-list">
                        {history.map((h) => (
                            <div key={h.history_id} className="history-item">
                                <p><strong>{new Date(h.change_date).toLocaleString()}</strong> – {h.first_name} {h.surname}</p>
                                <p><em>{h.reason_change}</em></p>
                                <ul>
                                    {h.old_technical_score !== h.new_technical_score && <li>Technical: {h.old_technical_score ?? "—"} → {h.new_technical_score ?? "—"}</li>}
                                    {h.old_innovation_design_score !== h.new_innovation_design_score && <li>Innovation: {h.old_innovation_design_score ?? "—"} → {h.new_innovation_design_score ?? "—"}</li>}
                                    {h.old_theme_score !== h.new_theme_score && <li>Theme: {h.old_theme_score ?? "—"} → {h.new_theme_score ?? "—"}</li>}
                                    {h.old_real_world_score !== h.new_real_world_score && <li>Real World: {h.old_real_world_score ?? "—"} → {h.new_real_world_score ?? "—"}</li>}
                                    {h.old_teamwork_score !== h.new_teamwork_score && <li>Teamwork: {h.old_teamwork_score ?? "—"} → {h.new_teamwork_score ?? "—"}</li>}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}

// ─── Main Component ───────────────────────────────────────────
export default function EventDetail() {
    const { id } = useParams<{ id: string }>();
    const [event, setEvent] = useState<{ name: string; date: string; category: string | null } | null>(null);
    const [teams, setTeams] = useState<TeamInEvent[]>([]);
    const [allJudges, setAllJudges] = useState<Judge[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingScore, setEditingScore] = useState<{
        event_team_id: number;
        team_name: string;
        round: number;
        score_id?: number;
        technical_score?: number | null;
        innovation_design_score?: number | null;
        theme_score?: number | null;
        real_world_score?: number | null;
        teamwork_score?: number | null;
        judge_id?: number;
    } | null>(null);
    const [viewingHistory, setViewingHistory] = useState<number | null>(null);

    const loadData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [eventDetails, judgesList] = await Promise.all([
                fetchEventDetails(Number(id)),
                fetchJudges(),
            ]);
            setEvent(eventDetails.event);
            setTeams(eventDetails.teams ?? []);
            setAllJudges(judgesList ?? []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const handleApproveScore = async (scoreId: number) => {
        try {
            await approveScore(scoreId);
            loadData();
        } catch (err: any) {
            alert("Failed to approve score: " + err.message);
        }
    };

    if (loading) return <div className="td-loading"><span className="spinner-lg" /></div>;
    if (error) return <div className="td-error">{error}</div>;
    if (!event) return <div className="td-empty">Event not found.</div>;

    return (
        <div className="td-root">
            <div className="td-header">
                <div>
                    <h1 className="td-title">{event.name}</h1>
                    <p className="td-subtitle">{new Date(event.date).toLocaleDateString()} · {event.category || "Uncategorized"}</p>
                </div>
                <Link to="/events" className="btn-secondary">← Back to Events</Link>
            </div>

            {/* Teams summary (no judge assignment) */}
            <div className="detail-card">
                <h3>Teams</h3>
                <table className="td-table">
                    <thead>
                        <tr><th>Team</th><th>Category</th><th>Total Points</th></tr>
                    </thead>
                    <tbody>
                        {teams.map((team) => (
                            <tr key={team.team_id}>
                                <td className="td-name">{team.team_name}</td>
                                <td>{team.category}</td>
                                <td className="td-points"><strong>{team.scores.overall_total}</strong></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Score Cards per team */}
            <div className="detail-card">
                <h3>Score Cards</h3>
                {teams.map((team) => {
                    const rounds = team.scores.rounds;
                    return (
                        <div key={team.team_id} className="team-score-section">
                            <h4>{team.team_name}</h4>
                            <table className="td-table">
                                <thead>
                                    <tr>
                                        <th>Round</th><th>Technical</th><th>Innovation</th><th>Theme</th><th>Real World</th><th>Teamwork</th>
                                        <th>Total</th><th>Judge</th><th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rounds.map((roundScore) => {
                                        const b = roundScore.breakdown;
                                        const total = roundScore.total;
                                        // For edit we need score_id and judge_id; currently not stored in roundScore.
                                        // This demo assumes we re‑fetch or store them in a separate map.
                                        // For full edit capability, you would expand the backend to return these fields.
                                        // Here we show only existing scores, and allow new rounds.
                                        return (
                                            <tr key={team.event_team_id + "_" + roundScore.round}>
                                                <td>{roundScore.round}</td>
                                                <td>{b.technical ?? "—"}</td>
                                                <td>{b.innovation_design ?? "—"}</td>
                                                <td>{b.theme ?? "—"}</td>
                                                <td>{b.real_world ?? "—"}</td>
                                                <td>{b.teamwork ?? "—"}</td>
                                                <td><strong>{total}</strong></td>
                                                <td>—</td>
                                                <td>
                                                    {/* We need score_id from backend to edit/approve – omitted for simplicity */}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    <tr>
                                        <td colSpan={8}>
                                            <button
                                                className="btn-primary"
                                                onClick={() => {
                                                    const nextRound = rounds.length ? Math.max(...rounds.map(r => r.round)) + 1 : 1;
                                                    setEditingScore({
                                                        event_team_id: team.event_team_id,
                                                        team_name: team.team_name,
                                                        round: nextRound,
                                                    });
                                                }}
                                            >
                                                + Add Round
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    );
                })}
            </div>

            {editingScore && (
                <ScoreModal
                    eventId={Number(id)}
                    eventTeamId={editingScore.event_team_id}
                    teamName={editingScore.team_name}
                    round={editingScore.round}
                    existingScore={editingScore.score_id ? {
                        score_id: editingScore.score_id,
                        technical_score: editingScore.technical_score ?? null,
                        innovation_design_score: editingScore.innovation_design_score ?? null,
                        theme_score: editingScore.theme_score ?? null,
                        real_world_score: editingScore.real_world_score ?? null,
                        teamwork_score: editingScore.teamwork_score ?? null,
                        judge_id: editingScore.judge_id ?? allJudges[0]?.judge_id,
                    } : undefined}
                    allJudges={allJudges}
                    onClose={() => setEditingScore(null)}
                    onSaved={() => { setEditingScore(null); loadData(); }}
                />
            )}
            {viewingHistory && <HistoryModal scoreId={viewingHistory} onClose={() => setViewingHistory(null)} />}

            <style>{`
                .team-score-section { margin-bottom: 32px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; }
                .team-score-section h4 { font-family: 'Syne', sans-serif; margin-bottom: 12px; color: #f1f5f9; }
                .td-points { font-weight: 700; color: #60a5fa; }
                .btn-primary { background: #f39c12; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; }
                .spinner-sm { display: inline-block; width: 12px; height: 12px; border: 2px solid #fff; border-top-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .history-item { border-bottom: 1px solid rgba(255,255,255,0.1); padding: 12px 0; }
                .history-item ul { margin: 6px 0 0 16px; font-size: 12px; color: #94a3b8; }
            `}</style>
        </div>
    );
}