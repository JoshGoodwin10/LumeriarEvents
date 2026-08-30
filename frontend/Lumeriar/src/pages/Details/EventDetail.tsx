// src/pages/EventDetail.tsx
import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
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
import "../../layout/details.css";

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

// ─── Score Edit Modal (unchanged) ────────────────────────────
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
    // (unchanged – same as before)
    const [form, setForm] = useState({
        judge_id: existingScore?.judge_id ?? (allJudges[0]?.judge_id || 0),
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

// ─── Assign Judge Modal (with centered button) ──────────────
function AssignJudgeModal({
    teamName,
    eventTeamId,
    allJudges,
    onClose,
    onAssigned,
}: {
    teamName: string;
    eventTeamId: number;
    allJudges: Judge[];
    onClose: () => void;
    onAssigned: () => void;
}) {
    const [assigning, setAssigning] = useState<number | null>(null);
    const [error, setError] = useState("");

    const handleAssign = async (judgeId: number) => {
        setAssigning(judgeId);
        setError("");
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/scores/assign-team-judge`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ event_team_id: eventTeamId, judge_id: judgeId }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Failed to assign judge");
            }
            onAssigned();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setAssigning(null);
        }
    };

    return createPortal(
        <div className="tdm-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="tdm-box" style={{ width: "600px", maxWidth: "90vw" }}>
                <div className="tdm-head">
                    <h2 className="tdm-title">Assign Judge to Team: {teamName}</h2>
                    <button className="tdm-close" onClick={onClose}>×</button>
                </div>
                <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
                    <table className="td-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>School</th>
                                <th style={{ textAlign: 'center' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allJudges.map((judge) => (
                                <tr key={judge.judge_id}>
                                    <td>{judge.first_name} {judge.surname}</td>
                                    <td>{judge.school_name || "—"}</td>
                                    <td style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <button
                                            className="btn-primary"
                                            onClick={() => handleAssign(judge.judge_id)}
                                            disabled={assigning === judge.judge_id}
                                            style={{ padding: "4px 12px", fontSize: "0.8rem" }}
                                        >
                                            {assigning === judge.judge_id ? <span className="spinner-sm" /> : "Assign"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {error && <p className="tdm-error" style={{ marginTop: "1rem" }}>{error}</p>}
                <div className="tdm-actions">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>,
        document.body
    );
}

// ─── Main Component ────────────────────────────────────────────
export default function EventDetail() {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const allowApprove = queryParams.get('approve') === 'true';

    const [event, setEvent] = useState<{ name: string; date: string; category: string | null } | null>(null);
    const [teams, setTeams] = useState<ExtendedTeam[]>([]);
    const [allJudges, setAllJudges] = useState<Judge[]>([]);
    const [awards, setAwards] = useState<Award[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingScore, setEditingScore] = useState<any>(null);
    const [viewingHistory, setViewingHistory] = useState<number | null>(null);
    const [assigningJudge, setAssigningJudge] = useState<{ event_team_id: number; team_name: string } | null>(null);
    const [showNominationModal, setShowNominationModal] = useState(false);
    const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

    const loadData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [eventDetails, judgesList, awardsList] = await Promise.all([
                fetchEventDetails(Number(id)),
                fetchJudges(),
                fetch(`/api/awards/event/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }).then(res => res.ok ? res.json() : []),
            ]);
            setEvent(eventDetails.event);
            setTeams(eventDetails.teams as ExtendedTeam[]);
            setAllJudges(judgesList ?? []);
            setAwards(awardsList);
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

    const generateAwards = async () => {
        if (!window.confirm('Generate awards for this event? Existing awards will be replaced.')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/awards/generate/${id}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Generation failed');
            alert('Awards generated successfully!');
            const awardsRes = await fetch(`/api/awards/event/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (awardsRes.ok) setAwards(await awardsRes.json());
        } catch (err: any) {
            alert(err.message);
        }
    };

    const nominateMostImproved = async () => {
        if (!selectedTeamId) {
            alert('Please select a team.');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/awards/nominate-most-improved', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ event_id: Number(id), team_id: selectedTeamId }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Nomination failed');
            }
            alert('Most Improved award nominated successfully!');
            setShowNominationModal(false);
            setSelectedTeamId(null);
            const awardsRes = await fetch(`/api/awards/event/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (awardsRes.ok) setAwards(await awardsRes.json());
        } catch (err: any) {
            alert(err.message);
        }
    };

    const sortedTeams = [...teams].sort((a, b) => b.scores.overall_total - a.scores.overall_total);

    if (loading) return <div className="td-loading"><span className="spinner-lg" /></div>;
    if (error) return <div className="td-error">{error}</div>;
    if (!event) return <div className="td-empty">Event not found.</div>;

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
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {allowApprove && (
                        <button className="btn-primary" onClick={generateAwards}>
                            Generate Awards
                        </button>
                    )}
                    {allowApprove && (
                        <button className="btn-primary" onClick={() => setShowNominationModal(true)}>
                            Nominate Most Improved
                        </button>
                    )}
                    <Link to="/events" className="btn-secondary">← Back to Events</Link>
                </div>
            </div>

            {/* Teams summary (sorted) */}
            <div className="detail-card">
                <h3>Teams</h3>
                <table className="td-table">
                    <thead>
                        <tr>
                            <th>Team</th>
                            <th>Category</th>
                            <th>Total Points</th>
                            <th style={{ textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTeams.map((team) => {
                            const hasJudge = team.judges && team.judges.length > 0;
                            return (
                                <tr key={team.team_id}>
                                    <td className="td-name">{team.team_name}</td>
                                    <td>{team.category}</td>
                                    <td className="td-points"><strong>{team.scores.overall_total}</strong></td>
                                    <td style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <button
                                            className={hasJudge ? "btn-secondary btn-sm" : "btn-primary btn-sm"}
                                            onClick={() => setAssigningJudge({ event_team_id: team.event_team_id, team_name: team.team_name })}
                                            disabled={hasJudge}
                                        >
                                            {hasJudge ? 'Assigned' : 'Assign Judge'}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Score Cards per team */}
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
                                                <td>{roundScore.judge_id ? (allJudges.find(j => j.judge_id === roundScore.judge_id)?.first_name ?? "—") : "—"}</td>
                                                <td>{isApproved ? "✅ Approved" : "⏳ Pending"}</td>
                                                <td className="actions">
                                                    {allowApprove && !isApproved && (
                                                        <button className="btn-icon approve" onClick={() => handleApproveScore(roundScore.score_id)}>Approve</button>
                                                    )}
                                                    <button className="btn-icon edit" onClick={() => setEditingScore({
                                                        event_team_id: team.event_team_id,
                                                        team_name: team.team_name,
                                                        round: roundScore.round,
                                                        score_id: roundScore.score_id,
                                                        technical_score: b.technical,
                                                        innovation_design_score: b.innovation_design,
                                                        theme_score: b.theme,
                                                        real_world_score: b.real_world,
                                                        teamwork_score: b.teamwork,
                                                    })}>Edit</button>
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

            {/* Awards Section – centered */}
            <div className="detail-card">
                <h3>Awards</h3>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    {awards.length === 0 ? (
                        <p>No awards generated for this event yet.</p>
                    ) : (
                        Object.entries(groupedAwards).map(([category, catAwards]) => (
                            <div key={category} style={{ marginBottom: '1.5rem', width: '100%', maxWidth: '900px' }}>
                                <h4 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>{category === 'Overall' ? 'Overall Awards' : category}</h4>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                                    gap: '1rem',
                                    justifyItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {catAwards.map(award => (
                                        <div key={award.award_id} className="award-card" style={{
                                            background: 'var(--bg-card)',
                                            border: '1px solid var(--border-medium)',
                                            borderRadius: '12px',
                                            padding: '1rem',
                                            width: '100%',
                                            maxWidth: '250px',
                                            textAlign: 'center'
                                        }}>
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
            </div>

            {/* Modals (unchanged) */}
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
            {assigningJudge && (
                <AssignJudgeModal
                    teamName={assigningJudge.team_name}
                    eventTeamId={assigningJudge.event_team_id}
                    allJudges={allJudges}
                    onClose={() => setAssigningJudge(null)}
                    onAssigned={() => { setAssigningJudge(null); loadData(); }}
                />
            )}

            {showNominationModal && createPortal(
                <div className="tdm-backdrop" onClick={() => setShowNominationModal(false)}>
                    <div className="tdm-box" onClick={(e) => e.stopPropagation()}>
                        <div className="tdm-head">
                            <h2>Nominate Most Improved Team</h2>
                            <button className="tdm-close" onClick={() => setShowNominationModal(false)}>×</button>
                        </div>
                        <div className="tdm-field">
                            <label>Select Team</label>
                            <select value={selectedTeamId ?? ''} onChange={e => setSelectedTeamId(Number(e.target.value))}>
                                <option value="">-- Select a team --</option>
                                {sortedTeams.map(team => (
                                    <option key={team.team_id} value={team.team_id}>{team.team_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="tdm-actions">
                            <button className="btn-secondary" onClick={() => setShowNominationModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={nominateMostImproved}>Nominate</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}