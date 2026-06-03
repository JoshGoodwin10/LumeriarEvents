// src/pages/ScoringJudgeView.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
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

// ─── Score History Modal ─────────────────────────────────────
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

// ─── Extended types ──────────────────────────────────────────
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
    is_approved: number;
}

interface ExtendedTeamInEvent extends TeamInEvent {
    scores: {
        rounds: ExtendedRound[];
        overall_total: number;
    };
}

export default function ScoringJudgeView() {
    const { eventId } = useParams<{ eventId: string }>();
    const { userId, token } = useAuth();
    const navigate = useNavigate();

    const [event, setEvent] = useState<{ name: string; date: string; category: string | null } | null>(null);
    const [teams, setTeams] = useState<ExtendedTeamInEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingScore, setEditingScore] = useState<any>(null);
    const [viewingHistory, setViewingHistory] = useState<number | null>(null);

    const loadData = async () => {
        if (!eventId) return;
        setLoading(true);
        try {
            const eventDetails = await fetchEventDetails(Number(eventId));
            setEvent(eventDetails.event);
            setTeams(eventDetails.teams as ExtendedTeamInEvent[]);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [eventId]);

    const handleSaved = () => {
        loadData(); // refresh after score edit
        setEditingScore(null);
    };

    if (loading) return <div className="td-loading"><span className="spinner-lg" /></div>;
    if (error) return <div className="td-error">{error}</div>;
    if (!event) return <div className="td-empty">Event not found.</div>;

    // Sort teams by overall total (highest first) for the scoreboard
    const sortedTeams = [...teams].sort((a, b) => b.scores.overall_total - a.scores.overall_total);

    return (
        <div className="td-root">
            <div className="td-header">
                <div>
                    <h1 className="td-title">{event.name}</h1>
                    <p className="td-subtitle">{new Date(event.date).toLocaleDateString()} · {event.category || "Uncategorized"}</p>
                </div>
                <Link to="/judge/view" className="btn-secondary">← Back to Dashboard</Link>
            </div>

            {/* Scoreboard Section */}
            <div className="detail-card">
                <h3>Scoreboard</h3>
                <table className="td-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Team Name</th>
                            <th>Total Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTeams.map((team, index) => (
                            <tr key={team.team_id}>
                                <td className="td-id">{index + 1}</td>
                                <td className="td-name">{team.team_name}</td>
                                <td className="td-points"><strong>{team.scores.overall_total}</strong></td>
                            </tr>
                        ))}
                        {sortedTeams.length === 0 && (
                            <tr>
                                <td colSpan={3} className="td-empty">No teams available.</td>
                            </tr>
                        )}
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
                                        <th>Total</th><th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rounds.map((roundScore) => {
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
                    );
                })}
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
                    onSaved={handleSaved}
                />
            )}
            {viewingHistory && <HistoryModal scoreId={viewingHistory} onClose={() => setViewingHistory(null)} />}

            <style>{`
                .team-score-section {
                    margin-bottom: 32px;
                    border-top: 1px solid var(--border-light);
                    padding-top: 20px;
                }
                .team-score-section h4 {
                    font-family: 'Syne', sans-serif;
                    margin-bottom: 12px;
                    color: var(--text-primary);
                }
                .btn-icon {
                    background: none;
                    border: none;
                    cursor: pointer;
                    margin-right: 8px;
                }
                .btn-icon.edit { color: #60a5fa; }
                .btn-icon.history { color: #8b5cf6; }
                .btn-primary {
                    background: var(--color-lumeriar-orange);
                    border: none;
                    padding: 6px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    color: white;
                }
            `}</style>
        </div>
    );
}