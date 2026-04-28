// src/pages/EventDetail.tsx
import { useState, useEffect, type JSXElementConstructor, type Key, type ReactElement, type ReactNode, type ReactPortal } from "react";
import { useParams, Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { fetchJudges, type Judge } from "../api/judges";
import {
    fetchEventDetails,
    assignJudgeToTeam,
    removeJudgeFromTeam,
    type TeamInEvent,
} from "../api/events";
import {
    fetchEventScores,
    saveScore,
    approveScore,
    fetchScoreHistory,
    type Score,
    type ScoreHistory,
} from "../api/scores";

// ─── Score Edit Modal ─────────────────────────────────────────
function ScoreModal({
    score,
    teamName,
    onClose,
    onSaved,
}: {
    score: {
        event_id: number;
        team_id: number;
        round: number;
        judge_id: number;        // must be a number, not null
        score_id?: number;
        technical_score?: number | null;
        innovation_design_score?: number | null;
        theme_score?: number | null;
        real_world_score?: number | null;
        teamwork_score?: number | null;
    };
    teamName: string;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [form, setForm] = useState({
        technical_score: score.technical_score ?? "",
        innovation_design_score: score.innovation_design_score ?? "",
        theme_score: score.theme_score ?? "",
        real_world_score: score.real_world_score ?? "",
        teamwork_score: score.teamwork_score ?? "",
        reason_change: "",
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const isEdit = !!score.score_id;

    const setField = (field: string, value: any) =>
        setForm((f) => ({ ...f, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!score.judge_id) {
            setError("Please select a judge before saving the score.");
            return;
        }
        setSaving(true);
        setError("");
        try {
            await saveScore(score.event_id, {
                team_id: score.team_id,
                round: score.round,
                judge_id: score.judge_id,
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
                    <h2 className="tdm-title">{isEdit ? "Edit Score" : "New Score"}</h2>
                    <button className="tdm-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit} className="tdm-form">
                    <p>Team: {teamName} | Round {score.round}</p>
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
                            {saving ? <span className="spinner-sm" /> : isEdit ? "Update" : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}

// ─── Score History Modal ──────────────────────────────────────
function HistoryModal({ scoreId, onClose }: { scoreId: number; onClose: () => void }) {
    const [history, setHistory] = useState<ScoreHistory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchScoreHistory(scoreId)
            .then(setHistory)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [scoreId]);

    return createPortal(
        <div className="tdm-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="tdm-box tdm-box-sm">
                <div className="tdm-head">
                    <h2 className="tdm-title">Score History</h2>
                    <button className="tdm-close" onClick={onClose}>×</button>
                </div>
                {loading ? (
                    <div className="td-loading"><span className="spinner-sm" /></div>
                ) : history.length === 0 ? (
                    <p>No changes recorded.</p>
                ) : (
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
    const [scores, setScores] = useState<Score[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingScore, setEditingScore] = useState<any>(null);
    const [viewingHistory, setViewingHistory] = useState<number | null>(null);

    const loadData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [eventDetails, judgesList, scoresList] = await Promise.all([
                fetchEventDetails(Number(id)),
                fetchJudges(),
                fetchEventScores(Number(id)),
            ]);
            setEvent(eventDetails.event);
            setTeams(eventDetails.teams ?? []);
            setAllJudges(judgesList ?? []);
            setScores(scoresList ?? []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const handleAssignJudge = async (team_id: number, judge_id: number) => {
        if (!id || !judge_id) return;
        try {
            await assignJudgeToTeam(Number(id), team_id, judge_id);
            loadData();
        } catch (err: any) {
            alert("Failed to assign judge: " + err.message);
        }
    };

    const handleRemoveJudge = async (team_id: number, judge_id: number) => {
        if (!id || !judge_id) return;
        try {
            await removeJudgeFromTeam(Number(id), team_id, judge_id);
            loadData();
        } catch (err: any) {
            alert("Failed to remove judge: " + err.message);
        }
    };

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

    // Group scores by team_id
    const scoresByTeam = (scores || []).reduce((acc, s) => {
        if (!acc[s.team_id]) acc[s.team_id] = [];
        acc[s.team_id].push(s);
        return acc;
    }, {} as Record<number, Score[]>);

    return (
        <div className="td-root">
            <div className="td-header">
                <div>
                    <h1 className="td-title">{event.name}</h1>
                    <p className="td-subtitle">{new Date(event.date).toLocaleDateString()} · {event.category || "Uncategorized"}</p>
                </div>
                <Link to="/events" className="btn-secondary">← Back to Events</Link>
            </div>

            {/* Teams & Judges Section */}
            <div className="detail-card">
                <h3>Teams / Scoreboard</h3>
                <table className="td-table">
                    <thead>
                        <tr>
                            <th>Team</th><th>Category</th><th>Total Points</th><th>Assigned Judges</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(teams || []).map((team) => (
                            <tr key={team.team_id}>
                                <td className="td-name">{team.team_name} (ID: {team.team_id})</td>
                                <td>{team.category}</td>
                                <td className="td-points"><strong>{team.total_points ?? 0}</strong></td>
                                <td>
                                    {(team.judges || []).map((j) => (
                                        <span key={j.judge_id} className="judge-badge">
                                            {j.first_name} {j.surname}
                                            <button
                                                onClick={() =>
                                                    typeof j.judge_id === "number" && handleRemoveJudge(team.team_id, j.judge_id)
                                                }
                                                className="remove-judge"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </td>
                                <td>
                                    <select
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val) {
                                                handleAssignJudge(team.team_id, Number(val));
                                            }
                                            e.target.value = "";
                                        }}
                                        value=""
                                    >
                                        <option value="">Assign judge...</option>
                                        {(allJudges || [])
                                            .filter((j) => !(team.judges || []).some((tj: { judge_id: number; }) => tj.judge_id === j.judge_id))
                                            .map((j) => (
                                                <option key={j.judge_id} value={j.judge_id}>
                                                    {j.first_name} {j.surname}
                                                </option>
                                            ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Score Cards Section */}
            <div className="detail-card">
                <h3>Score Cards</h3>
                {(teams || []).map((team) => {
                    const teamScores = scoresByTeam[team.team_id] || [];
                    return (
                        <div key={team.team_id} className="team-score-section">
                            <h4>{team.team_name}</h4>
                            <table className="td-table">
                                <thead>
                                    <tr>
                                        <th>Round</th><th>Technical</th><th>Innovation</th><th>Theme</th><th>Real World</th><th>Teamwork</th>
                                        <th>Total</th><th>Judge</th><th>Approved</th><th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teamScores.map((score) => {
                                        const total =
                                            (score.technical_score || 0) +
                                            (score.innovation_design_score || 0) +
                                            (score.theme_score || 0) +
                                            (score.real_world_score || 0) +
                                            (score.teamwork_score || 0);
                                        return (
                                            <tr key={score.score_id}>
                                                <td>{score.round}</td>
                                                <td>{score.technical_score ?? "—"}</td>
                                                <td>{score.innovation_design_score ?? "—"}</td>
                                                <td>{score.theme_score ?? "—"}</td>
                                                <td>{score.real_world_score ?? "—"}</td>
                                                <td>{score.teamwork_score ?? "—"}</td>
                                                <td><strong>{total}</strong></td>
                                                <td>{score.judge_first} {score.judge_surname}</td>
                                                <td>{score.is_approved ? "✅" : "⏳"}</td>
                                                <td>
                                                    {!score.is_approved && (
                                                        <>
                                                            <button className="btn-icon edit" onClick={() => setEditingScore({ ...score, event_id: Number(id), team_id: team.team_id })}>Edit</button>
                                                            <button className="btn-icon approve" onClick={() => handleApproveScore(score.score_id)}>Approve</button>
                                                        </>
                                                    )}
                                                    <button className="btn-icon view" onClick={() => setViewingHistory(score.score_id)}>History</button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            <button
                                className="btn-secondary"
                                onClick={() =>
                                    setEditingScore({
                                        event_id: Number(id),
                                        team_id: team.team_id,
                                        round: 1,
                                        judge_id: null,   // will be validated before submit
                                        technical_score: "",
                                        innovation_design_score: "",
                                        theme_score: "",
                                        real_world_score: "",
                                        teamwork_score: "",
                                    })
                                }
                            >
                                + Add Score
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Modals */}
            {editingScore && (
                <ScoreModal
                    score={editingScore}
                    teamName={teams.find((t) => t.team_id === editingScore.team_id)?.team_name || ""}
                    onClose={() => setEditingScore(null)}
                    onSaved={() => {
                        setEditingScore(null);
                        loadData();
                    }}
                />
            )}
            {viewingHistory && (
                <HistoryModal scoreId={viewingHistory} onClose={() => setViewingHistory(null)} />
            )}

            <style>{`
        .judge-badge {
          display: inline-block;
          background: rgba(99,102,241,.15);
          border-radius: 20px;
          padding: 2px 8px;
          margin: 0 4px 4px 0;
          font-size: 12px;
        }
        .remove-judge {
          background: none;
          border: none;
          color: #f87171;
          margin-left: 6px;
          cursor: pointer;
          font-size: 14px;
        }
        .remove-judge:hover { color: #ef4444; }
        .team-score-section {
          margin-bottom: 32px;
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 20px;
        }
        .team-score-section h4 {
          font-family: 'Syne', sans-serif;
          margin-bottom: 12px;
          color: #f1f5f9;
        }
        .td-points {
          font-weight: 700;
          color: #60a5fa;
        }
        .btn-icon.approve {
          color: #10b981;
        }
        .btn-icon.view {
          color: #8b5cf6;
        }
        .history-item {
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding: 12px 0;
        }
        .history-item ul {
          margin: 6px 0 0 16px;
          font-size: 12px;
          color: #94a3b8;
        }
      `}</style>
        </div>
    );
}