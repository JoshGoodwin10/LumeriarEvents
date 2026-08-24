// src/pages/HeadJudgeView.tsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchEventDetails, type TeamInEvent } from "../../api/events";
import { fetchJudges, type Judge } from "../../api/judges";
import { approveScore, fetchScoreHistory, type ScoreHistory } from "../../api/scores";
import "../../layout/dashboard.css";

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
    judge_id: number | null;
}

interface ExtendedTeam extends TeamInEvent {
    scores: {
        rounds: ExtendedRound[];
        overall_total: number;
    };
}

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

export default function HeadJudgeView() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [event, setEvent] = useState<{ name: string; date: string; category: string | null } | null>(null);
    const [teams, setTeams] = useState<ExtendedTeam[]>([]);
    const [allJudges, setAllJudges] = useState<Judge[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [viewingHistory, setViewingHistory] = useState<number | null>(null);
    const [showNominationModal, setShowNominationModal] = useState(false);
    const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
    const [nominating, setNominating] = useState(false);

    const getJudgeName = (judgeId: number | null) => {
        if (!judgeId) return "—";
        const judge = allJudges.find(j => j.judge_id === judgeId);
        return judge ? `${judge.first_name} ${judge.surname}` : `Judge #${judgeId}`;
    };

    const loadData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [eventDetails, judgesList] = await Promise.all([
                fetchEventDetails(Number(id)),
                fetchJudges(),
            ]);
            setEvent(eventDetails.event);
            setTeams(eventDetails.teams as ExtendedTeam[]);
            setAllJudges(judgesList);
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

    const nominateMostImproved = async () => {
        if (!selectedTeamId) {
            alert("Please select a team.");
            return;
        }
        setNominating(true);
        try {
            const res = await fetch("/api/awards/nominate-most-improved", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ event_id: Number(id), team_id: selectedTeamId }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Nomination failed");
            }
            alert("Most Improved award nominated successfully!");
            setShowNominationModal(false);
            setSelectedTeamId(null);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setNominating(false);
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
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button className="btn-primary" onClick={() => setShowNominationModal(true)}>
                        Nominate Most Improved
                    </button>
                    <Link to="/judge/view" className="btn-secondary">← Back to Dashboard</Link>
                    <Link to={`/head-judge/${id}/appeals`} className="btn-primary">
                        Manage Appeals
                    </Link>
                </div>
            </div>

            <div className="detail-card">
                <h3>Teams</h3>
                <table className="td-table">
                    <thead>
                        <tr>
                            <th>Team</th><th>Category</th><th>Total Points</th>
                        </tr>
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
                                        <th>Total</th><th>Judge</th><th>Status</th><th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rounds.map((roundScore) => {
                                        const b = roundScore.breakdown;
                                        const total = roundScore.total;
                                        const isApproved = roundScore.is_approved === 1;
                                        return (
                                            <tr key={team.event_team_id + "_" + roundScore.round}>
                                                <td>{roundScore.round}</td>
                                                <td>{b.technical ?? "—"}</td>
                                                <td>{b.innovation_design ?? "—"}</td>
                                                <td>{b.theme ?? "—"}</td>
                                                <td>{b.real_world ?? "—"}</td>
                                                <td>{b.teamwork ?? "—"}</td>
                                                <td><strong>{total}</strong></td>
                                                <td>{getJudgeName(roundScore.judge_id)}</td>
                                                <td>{isApproved ? "✅ Approved" : "⏳ Pending"}</td>
                                                <td className="actions">
                                                    {!isApproved && (
                                                        <button
                                                            className="btn-icon approve"
                                                            onClick={() => handleApproveScore(roundScore.score_id)}
                                                            title="Approve Score"
                                                        >
                                                            Approve
                                                        </button>
                                                    )}
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

            {/* Most Improved Nomination Modal */}
            {showNominationModal && createPortal(
                <div className="tdm-backdrop" onClick={() => setShowNominationModal(false)}>
                    <div className="tdm-box" onClick={(e) => e.stopPropagation()}>
                        <div className="tdm-head">
                            <h2>Nominate Most Improved Team</h2>
                            <button className="tdm-close" onClick={() => setShowNominationModal(false)}>×</button>
                        </div>
                        <div className="tdm-field">
                            <label>Select Team</label>
                            <select value={selectedTeamId ?? ""} onChange={e => setSelectedTeamId(Number(e.target.value))}>
                                <option value="">-- Select a team --</option>
                                {teams.map(team => (
                                    <option key={team.team_id} value={team.team_id}>{team.team_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="tdm-actions">
                            <button className="btn-secondary" onClick={() => setShowNominationModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={nominateMostImproved} disabled={nominating}>
                                {nominating ? "Nominating..." : "Nominate"}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* History Modal */}
            {viewingHistory !== null && (
                <HistoryModal scoreId={viewingHistory} onClose={() => setViewingHistory(null)} />
            )}

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
                .td-points {
                    font-weight: 700;
                    color: #60a5fa;
                }
                .btn-icon {
                    background: none;
                    border: none;
                    cursor: pointer;
                    margin-right: 8px;
                }
                .btn-icon.approve {
                    color: #10b981;
                }
                .btn-icon.history {
                    color: #8b5cf6;
                }
                .history-item {
                    border-bottom: 1px solid var(--border-light);
                    padding: 12px 0;
                }
                .history-item ul {
                    margin: 6px 0 0 16px;
                    font-size: 12px;
                    color: var(--text-muted);
                }
            `}</style>
        </div>
    );
}