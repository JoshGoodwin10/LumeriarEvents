// src/pages/JudgeView/AppealsList.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createPortal } from 'react-dom';
import '../../layout/dashboard.css';
import { API_BASE } from '../../api/client';  // adjust path

interface Appeal {
    appeal_id: number;
    score_id: number;
    coach_id: number;
    grounds: string;
    evidence_filename: string | null;
    status: 'pending' | 'approved' | 'rejected';
    head_judge_comment: string | null;
    created_at: string;
    round: number;
    technical_score: number | null;
    innovation_design_score: number | null;
    theme_score: number | null;
    real_world_score: number | null;
    teamwork_score: number | null;
    team_name: string;
    coach_first: string;
    coach_surname: string;
}

// ─── Decision Modal ────────────────────────────────────────────
function DecisionModal({
    appeal,
    onClose,
    onDecision,
}: {
    appeal: Appeal;
    onClose: () => void;
    onDecision: (status: 'approved' | 'rejected', scoreUpdates: any, comment: string) => void;
}) {
    const { token } = useAuth();
    const [status, setStatus] = useState<'approved' | 'rejected'>('approved');
    const [comment, setComment] = useState('');
    const [scoreUpdates, setScoreUpdates] = useState({
        technical: appeal.technical_score ?? '',
        innovation: appeal.innovation_design_score ?? '',
        theme: appeal.theme_score ?? '',
        realWorld: appeal.real_world_score ?? '',
        teamwork: appeal.teamwork_score ?? '',
    });
    const [downloading, setDownloading] = useState(false);

    const downloadEvidence = async () => {
        if (!appeal.evidence_filename) return;
        setDownloading(true);
        try {
            const res = await fetch(`${API_BASE}/api/appeals/${appeal.appeal_id}/download`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Download failed');
            }
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = appeal.evidence_filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            alert('Failed to download evidence: ' + err.message);
        } finally {
            setDownloading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            new_technical_score: status === 'approved' ? Number(scoreUpdates.technical) : undefined,
            new_innovation_design_score: status === 'approved' ? Number(scoreUpdates.innovation) : undefined,
            new_theme_score: status === 'approved' ? Number(scoreUpdates.theme) : undefined,
            new_real_world_score: status === 'approved' ? Number(scoreUpdates.realWorld) : undefined,
            new_teamwork_score: status === 'approved' ? Number(scoreUpdates.teamwork) : undefined,
        };
        onDecision(status, payload, comment);
    };

    return createPortal(
        <div className="tdm-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="tdm-box">
                <div className="tdm-head">
                    <h2 className="tdm-title">Review Appeal</h2>
                    <button className="tdm-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit} className="tdm-form">
                    <div className="tdm-field">
                        <label className="tdm-label">Team</label>
                        <p><strong>{appeal.team_name}</strong> – Round {appeal.round}</p>
                    </div>
                    <div className="tdm-field">
                        <label className="tdm-label">Grounds for Appeal</label>
                        <p className="tdm-input" style={{ background: '#f3f4f6', padding: '8px' }}>{appeal.grounds}</p>
                    </div>
                    {appeal.evidence_filename && (
                        <div className="tdm-field">
                            <label className="tdm-label">Evidence</label>
                            <button type="button" className="btn-secondary" onClick={downloadEvidence} disabled={downloading}>
                                {downloading ? 'Downloading...' : 'Download Evidence'}
                            </button>
                        </div>
                    )}
                    <div className="tdm-field">
                        <label className="tdm-label">Current Scores</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                            <div>T: {appeal.technical_score ?? '—'}</div>
                            <div>I: {appeal.innovation_design_score ?? '—'}</div>
                            <div>Th: {appeal.theme_score ?? '—'}</div>
                            <div>R: {appeal.real_world_score ?? '—'}</div>
                            <div>Tw: {appeal.teamwork_score ?? '—'}</div>
                        </div>
                    </div>
                    <div className="tdm-field">
                        <label className="tdm-label">Decision</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value as 'approved' | 'rejected')}>
                            <option value="approved">Approve</option>
                            <option value="rejected">Reject</option>
                        </select>
                    </div>
                    {status === 'approved' && (
                        <>
                            <div className="tdm-row">
                                <div className="tdm-field">
                                    <label>Technical</label>
                                    <input type="number" step="0.01" value={scoreUpdates.technical} onChange={e => setScoreUpdates({ ...scoreUpdates, technical: e.target.value })} />
                                </div>
                                <div className="tdm-field">
                                    <label>Innovation</label>
                                    <input type="number" step="0.01" value={scoreUpdates.innovation} onChange={e => setScoreUpdates({ ...scoreUpdates, innovation: e.target.value })} />
                                </div>
                            </div>
                            <div className="tdm-row">
                                <div className="tdm-field">
                                    <label>Theme</label>
                                    <input type="number" step="0.01" value={scoreUpdates.theme} onChange={e => setScoreUpdates({ ...scoreUpdates, theme: e.target.value })} />
                                </div>
                                <div className="tdm-field">
                                    <label>Real World</label>
                                    <input type="number" step="0.01" value={scoreUpdates.realWorld} onChange={e => setScoreUpdates({ ...scoreUpdates, realWorld: e.target.value })} />
                                </div>
                            </div>
                            <div className="tdm-field">
                                <label>Teamwork</label>
                                <input type="number" step="0.01" value={scoreUpdates.teamwork} onChange={e => setScoreUpdates({ ...scoreUpdates, teamwork: e.target.value })} />
                            </div>
                        </>
                    )}
                    <div className="tdm-field">
                        <label className="tdm-label">Head Judge Comment</label>
                        <textarea rows={2} value={comment} onChange={e => setComment(e.target.value)} placeholder="Optional comment..." />
                    </div>
                    <div className="tdm-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary">Submit Decision</button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}

// ─── Main Component ────────────────────────────────────────────
export default function AppealsList() {
    const { id: eventId } = useParams<{ id: string }>();
    const { token } = useAuth();
    const [appeals, setAppeals] = useState<Appeal[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<number | null>(null);
    const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);

    useEffect(() => {
        if (!eventId) return;
        const fetchAppeals = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/appeals/event/${eventId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error('Failed to fetch appeals');
                const data = await res.json();
                setAppeals(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAppeals();
    }, [eventId, token]);

    const handleDecision = async (status: 'approved' | 'rejected', scoreUpdates: any, comment: string) => {
        if (!selectedAppeal) return;
        setProcessing(selectedAppeal.appeal_id);
        try {
            const res = await fetch(`${API_BASE}/api/appeals/${selectedAppeal.appeal_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status, head_judge_comment: comment, ...scoreUpdates }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Failed to process appeal');
            }
            // Refresh appeals list
            const updated = await fetch(`${API_BASE}/api/appeals/event/${eventId}`, {
                headers: { Authorization: `Bearer ${token}` },
            }).then(r => r.json());
            setAppeals(updated);
            setSelectedAppeal(null);
            alert(`Appeal ${status}!`);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setProcessing(null);
        }
    };

    if (loading) return <div className="td-loading"><span className="spinner-lg" /></div>;

    return (
        <div className="td-root">
            <div className="td-header">
                <h1 className="td-title">Appeals Management</h1>
                <Link to={`/head-judge/${eventId}`} className="btn-secondary">← Back to Event</Link>
            </div>

            {appeals.length === 0 ? (
                <div className="td-empty">No appeals for this event.</div>
            ) : (
                <div className="td-table-wrap">
                    <table className="td-table">
                        <thead>
                            <tr>
                                <th>Team</th>
                                <th>Round</th>
                                <th>Coach</th>
                                <th>Grounds</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appeals.map(appeal => (
                                <tr key={appeal.appeal_id}>
                                    <td>{appeal.team_name}</td>
                                    <td>{appeal.round}</td>
                                    <td>{appeal.coach_first} {appeal.coach_surname}</td>
                                    <td style={{ maxWidth: '200px' }}>{appeal.grounds}</td>
                                    <td>
                                        {appeal.status === 'pending' && <span className="status-pending">⏳ Pending</span>}
                                        {appeal.status === 'approved' && <span className="status-approved">✅ Approved</span>}
                                        {appeal.status === 'rejected' && <span className="status-rejected">❌ Rejected</span>}
                                    </td>
                                    <td style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        {appeal.status === 'pending' && (
                                            <button
                                                className="btn-primary btn-sm"
                                                onClick={() => setSelectedAppeal(appeal)}
                                                disabled={processing === appeal.appeal_id}
                                            >
                                                Review
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedAppeal && (
                <DecisionModal
                    appeal={selectedAppeal}
                    onClose={() => setSelectedAppeal(null)}
                    onDecision={handleDecision}
                />
            )}
        </div>
    );
}