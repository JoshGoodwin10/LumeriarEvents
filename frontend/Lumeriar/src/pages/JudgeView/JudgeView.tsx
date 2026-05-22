// src/pages/JudgeView.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { fetchEventDetails, type TeamInEvent } from '../../api/events';
import { saveScore, fetchScoreHistory, type ScoreHistory } from '../../api/scores';
import '../../layout/dashboard.css';

// ─── Score Modal for Judge (no judge selection) ──────────────
function JudgeScoreModal({
    eventTeamId,
    teamName,
    round,
    existingScore,
    judgeId,
    onClose,
    onSaved,
}: {
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
    };
    judgeId: number;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [form, setForm] = useState({
        technical_score: existingScore?.technical_score ?? "",
        innovation_design_score: existingScore?.innovation_design_score ?? "",
        theme_score: existingScore?.theme_score ?? "",
        real_world_score: existingScore?.real_world_score ?? "",
        teamwork_score: existingScore?.teamwork_score ?? "",
        change_reason: "",
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const setField = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            await saveScore({
                event_team_id: eventTeamId,
                round,
                judge_id: judgeId,
                technical_score: form.technical_score ? Number(form.technical_score) : null,
                innovation_design_score: form.innovation_design_score ? Number(form.innovation_design_score) : null,
                theme_score: form.theme_score ? Number(form.theme_score) : null,
                real_world_score: form.real_world_score ? Number(form.real_world_score) : null,
                teamwork_score: form.teamwork_score ? Number(form.teamwork_score) : null,
                change_reason: form.change_reason,
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
                        <textarea rows={2} value={form.change_reason} onChange={(e) => setField("change_reason", e.target.value)} />
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
                                <p><em>{h.change_reason}</em></p>
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

// ─── Main Judge View ─────────────────────────────────────────
interface ExtendedRound {
    round: number;
    total: number;
    breakdown: {
        technical: number | null;
        innovation_design: number | null;
        theme: number | null;
        real_world: number | null;
        teamwork: number | null;
    };
    score_id: number;
    is_approved: number;   // unused in UI but present
}

interface ExtendedTeamInEvent extends TeamInEvent {
    scores: {
        rounds: ExtendedRound[];
        overall_total: number;
    };
}

export default function JudgeView() {
    const { userId, token } = useAuth();
    const [eventsHead, setEventsHead] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<{ event: any; team: ExtendedTeamInEvent }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingScore, setEditingScore] = useState<{
        eventTeamId: number;
        teamName: string;
        round: number;
        scoreId?: number;
        technical?: number | null;
        innovation?: number | null;
        theme?: number | null;
        realWorld?: number | null;
        teamwork?: number | null;
    } | null>(null);
    const [viewingHistory, setViewingHistory] = useState<number | null>(null);

    useEffect(() => {
        if (!userId) return;
        const fetchData = async () => {
            try {
                // Fetch events where judge is head
                const eventsRes = await fetch(`/api/judges/${userId}/events-as-head`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const eventsData = await eventsRes.json();
                setEventsHead(eventsData);

                // Fetch teams-to-score
                const teamsRes = await fetch(`/api/judges/${userId}/teams-to-score`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const teamsData = await teamsRes.json();

                // For each team, fetch full event details to get score breakdowns with score_id
                const assignmentsData = await Promise.all(teamsData.map(async (assignment: any) => {
                    const eventDetails = await fetchEventDetails(assignment.event_id);
                    const team = eventDetails.teams.find(t => t.team_id === assignment.team_id);
                    if (!team) return null;
                    return { event: eventDetails.event, team: team as ExtendedTeamInEvent };
                }));
                setAssignments(assignmentsData.filter(a => a !== null));
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userId, token]);

    if (loading) return <div className="td-loading"><span className="spinner-lg" /></div>;
    if (error) return <div className="td-error">{error}</div>;

    return (
        <div className="td-root">
            <div className="td-header">
                <h1 className="td-title">Judge Dashboard</h1>
            </div>

            {/* Events where head judge */}
            <div className="detail-card">
                <h2>Events where you are Head Judge</h2>
                {eventsHead.length === 0 ? (
                    <p>No events assigned as head judge.</p>
                ) : (
                    <div className="events-list">
                        {eventsHead.map((event) => (
                            <div key={event.event_id} className="event-card">
                                <div className="event-info">
                                    <h3>{event.name}</h3>
                                    <p>{event.venue} – {new Date(event.date).toLocaleDateString()}</p>
                                </div>
                                <Link to={`/events/${event.event_id}?approve=true`} className="btn-details">
                                    Review Scores & Approve
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Scorecards for assigned teams */}
            <div className="detail-card">
                <h2>Teams you are scoring (Scorecards)</h2>
                {assignments.length === 0 ? (
                    <p>No team scores recorded yet.</p>
                ) : (
                    assignments.map(({ event, team }) => (
                        <div key={`${event.event_id}-${team.team_id}`} className="team-score-section">
                            <h4>{team.team_name} – {event.name} ({new Date(event.date).toLocaleDateString()})</h4>
                            <table className="td-table">
                                <thead>
                                    <tr>
                                        <th>Round</th><th>Technical</th><th>Innovation</th><th>Theme</th><th>Real World</th><th>Teamwork</th>
                                        <th>Total</th><th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {team.scores.rounds.map((roundScore) => {
                                        const b = roundScore.breakdown;
                                        const total = roundScore.total;
                                        return (
                                            <tr key={team.event_team_id + "_" + roundScore.round}>
                                                <td>{roundScore.round}</td>
                                                <td>{b.technical ?? "—"}</td>
                                                <td>{b.innovation_design ?? "—"}</td>
                                                <td>{b.theme ?? "—"}</td>
                                                <td>{b.real_world ?? "—"}</td>
                                                <td>{b.teamwork ?? "—"}</td>
                                                <td><strong>{total}</strong></td>
                                                <td>
                                                    <button
                                                        className="btn-icon edit"
                                                        onClick={() => setEditingScore({
                                                            eventTeamId: team.event_team_id,
                                                            teamName: team.team_name,
                                                            round: roundScore.round,
                                                            scoreId: roundScore.score_id,
                                                            technical: b.technical,
                                                            innovation: b.innovation_design,
                                                            theme: b.theme,
                                                            realWorld: b.real_world,
                                                            teamwork: b.teamwork,
                                                        })}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="btn-icon history"
                                                        onClick={() => setViewingHistory(roundScore.score_id)}
                                                    >
                                                        History
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                </tbody>
                            </table>
                        </div>
                    ))
                )}
            </div>

            {/* Modals */}
            {editingScore && (
                <JudgeScoreModal
                    eventTeamId={editingScore.eventTeamId}
                    teamName={editingScore.teamName}
                    round={editingScore.round}
                    existingScore={editingScore.scoreId ? {
                        score_id: editingScore.scoreId,
                        technical_score: editingScore.technical ?? null,
                        innovation_design_score: editingScore.innovation ?? null,
                        theme_score: editingScore.theme ?? null,
                        real_world_score: editingScore.realWorld ?? null,
                        teamwork_score: editingScore.teamwork ?? null,
                    } : undefined}
                    judgeId={userId!}
                    onClose={() => setEditingScore(null)}
                    onSaved={() => {
                        setEditingScore(null);
                        window.location.reload();
                    }}
                />
            )}
            {viewingHistory && <HistoryModal scoreId={viewingHistory} onClose={() => setViewingHistory(null)} />}

            <style>{`
                .detail-card { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.08); border-radius: 12px; padding: 20px; margin-bottom: 24px; }
                .detail-card h2 { margin-top: 0; font-size: 1.3rem; }
                .team-score-section { margin-bottom: 32px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; }
                .team-score-section h4 { font-family: 'Syne', sans-serif; margin-bottom: 12px; color: #f1f5f9; }
                .btn-primary { background: #f39c12; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; color: #000; }
                .spinner-sm { display: inline-block; width: 12px; height: 12px; border: 2px solid #fff; border-top-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .history-item { border-bottom: 1px solid rgba(255,255,255,0.1); padding: 12px 0; }
                .history-item ul { margin: 6px 0 0 16px; font-size: 12px; color: #94a3b8; }
                .event-card { display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); }
                .btn-details { background: #60a5fa; color: white; padding: 4px 12px; border-radius: 4px; text-decoration: none; }
                .btn-icon { background: none; border: none; cursor: pointer; margin-right: 8px; }
                .btn-icon.edit { color: #60a5fa; }
                .btn-icon.history { color: #8b5cf6; }
            `}</style>
        </div>
    );
}