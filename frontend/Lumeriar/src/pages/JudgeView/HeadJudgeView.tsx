// src/pages/JudgeView/HeadJudgeView.tsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchEventDetails, type TeamInEvent } from "../../api/events";
import { approveScore, fetchScoreHistory, type ScoreHistory } from "../../api/scores";
import "../../layout/dashboard.css";
import { API_BASE } from '../../api/client';  // adjust path

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

interface Award {
    award_id: number;
    team_id: number;
    team_name: string;
    award_type: string;
    category_name: string | null;
    rank_position: number | null;
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
    const [awards, setAwards] = useState<Award[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingAwards, setLoadingAwards] = useState(false);
    const [error, setError] = useState("");
    const [viewingHistory, setViewingHistory] = useState<number | null>(null);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
    const [generating, setGenerating] = useState(false);

    const loadData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const eventDetails = await fetchEventDetails(Number(id));
            setEvent(eventDetails.event);
            setTeams(eventDetails.teams as ExtendedTeam[]);
            await fetchAwards();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchAwards = async () => {
        if (!id) return;
        setLoadingAwards(true);
        try {
            const res = await fetch(`${API_BASE}/api/awards/event/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setAwards(data);
            } else {
                setAwards([]);
            }
        } catch (err) {
            console.error("Awards fetch error:", err);
            setAwards([]);
        } finally {
            setLoadingAwards(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const handleApproveScore = async (scoreId: number) => {
        try {
            await approveScore(scoreId);
            loadData(); // refresh after approval
        } catch (err: any) {
            alert("Failed to approve score: " + err.message);
        }
    };

    const handleGenerateAwards = async () => {
        if (!selectedTeamId) {
            alert('Please select a team for Most Improved.');
            return;
        }
        setGenerating(true);
        try {
            const res = await fetch(`${API_BASE}/api/awards/generate/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ most_improved_team_id: selectedTeamId }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Generation failed');
            }
            alert('Awards generated successfully!');
            setShowGenerateModal(false);
            setSelectedTeamId(null);
            await fetchAwards(); // refresh awards list
        } catch (err: any) {
            alert(err.message);
        } finally {
            setGenerating(false);
        }
    };

    if (loading) return <div className="td-loading"><span className="spinner-lg" /></div>;
    if (error) return <div className="td-error">{error}</div>;
    if (!event) return <div className="td-empty">Event not found.</div>;

    // Sort teams by overall total descending (highest first)
    const sortedTeams = [...teams].sort((a, b) => b.scores.overall_total - a.scores.overall_total);

    const groupedAwards = awards.reduce((acc, award) => {
        const key = award.category_name || 'Overall';
        if (!acc[key]) acc[key] = [];
        acc[key].push(award);
        return acc;
    }, {} as Record<string, Award[]>);

    return (
        <div className="td-root">
            <div className="td-header">
                <div>
                    <h1 className="td-title">{event.name}</h1>
                    <p className="td-subtitle">{new Date(event.date).toLocaleDateString()} · {event.category || "Uncategorized"}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button className="btn-primary" onClick={() => setShowGenerateModal(true)} disabled={generating}>
                        Generate Awards
                    </button>
                    <Link to={`/head-judge/${id}/appeals`} className="btn-primary">
                        Manage Appeals
                    </Link>
                    <Link to="/judge/view" className="btn-secondary">← Back to Dashboard</Link>
                </div>
            </div>

            {/* Teams summary */}
            <div className="detail-card">
                <h3>Teams</h3>
                <table className="td-table">
                    <thead>
                        <tr>
                            <th>Team</th><th>Category</th><th>Total Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTeams.map((team) => (
                            <tr key={team.team_id}>
                                <td className="td-name">{team.team_name}</td>
                                <td>{team.category}</td>
                                <td className="td-points"><strong>{team.scores.overall_total}</strong></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Score Cards with approval */}
            <div className="detail-card">
                <h3>Score Cards</h3>
                {sortedTeams.map((team) => {
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
                                                <td>{roundScore.judge_id ? `Judge #${roundScore.judge_id}` : "—"}</td>
                                                <td>{isApproved ? "✅ Approved" : "⏳ Pending"}</td>
                                                <td className="actions">
                                                    {!isApproved && (
                                                        <button className="btn-icon approve" onClick={() => handleApproveScore(roundScore.score_id)}>Approve</button>
                                                    )}
                                                    <button className="btn-icon history" onClick={() => setViewingHistory(roundScore.score_id)}>History</button>
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

            {/* Awards Section - centered */}
            <div className="detail-card">
                <h3>Awards</h3>
                {loadingAwards ? (
                    <div>Loading awards...</div>
                ) : awards.length === 0 ? (
                    <p>No awards generated for this event yet.</p>
                ) : (
                    Object.entries(groupedAwards).map(([category, catAwards]) => (
                        <div key={category} style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>{category === 'Overall' ? 'Overall Awards' : category}</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
                                {catAwards.map(award => (
                                    <div key={award.award_id} className="award-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: '12px', padding: '1rem', flex: '0 0 250px' }}>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--color-lumeriar-orange)' }}>{award.award_type}</div>
                                        <div style={{ marginTop: '0.5rem' }}>
                                            <span style={{ fontWeight: 'bold' }}>{award.team_name}</span>
                                            {award.rank_position && <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>(#{award.rank_position})</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Combined Generate & Nominate Modal */}
            {showGenerateModal && createPortal(
                <div className="tdm-backdrop" onClick={() => setShowGenerateModal(false)}>
                    <div className="tdm-box" onClick={(e) => e.stopPropagation()}>
                        <div className="tdm-head">
                            <h2 className="tdm-title">Generate Awards</h2>
                            <button className="tdm-close" onClick={() => setShowGenerateModal(false)}>×</button>
                        </div>
                        <div className="tdm-field">
                            <label className="tdm-label">Select Most Improved Team</label>
                            <select
                                className="tdm-input"
                                value={selectedTeamId ?? ""}
                                onChange={e => setSelectedTeamId(Number(e.target.value))}
                            >
                                <option value="">-- Select a team --</option>
                                {teams.map(team => (
                                    <option key={team.team_id} value={team.team_id}>{team.team_name}</option>
                                ))}
                            </select>
                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                                You must select a team for Most Improved to generate awards.
                            </p>
                        </div>
                        <div className="tdm-actions">
                            <button className="btn-secondary" onClick={() => setShowGenerateModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleGenerateAwards} disabled={generating}>
                                {generating ? 'Generating...' : 'Generate Awards'}
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
                .award-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-medium);
                    border-radius: 12px;
                    padding: 1rem;
                    text-align: center;
                    flex: 0 0 250px;
                }
                .award-card div:first-child {
                    font-size: 1.1rem;
                    font-weight: bold;
                    color: var(--color-lumeriar-orange);
                }
            `}</style>
        </div>
    );
}