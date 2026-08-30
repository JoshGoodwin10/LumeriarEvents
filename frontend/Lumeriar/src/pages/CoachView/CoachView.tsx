// src/pages/CoachView/CoachView.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import '../../layout/dashboard.css';
import EditProfileModal from '../../components/EditProfileModal';
import ChangePasswordModal from '../../components/ChangePasswordModal';

interface ScoreWithAppeal {
    score_id: number;
    round: number;
    technical_score: number;
    innovation_design_score: number;
    theme_score: number;
    real_world_score: number;
    teamwork_score: number;
    is_approved: number;
    appeal_status: 'none' | 'pending' | 'approved' | 'rejected';
    appeal_id?: number;
    appeal_status_detail?: 'pending' | 'approved' | 'rejected';
    grounds?: string;
    evidence_filename?: string;
    head_judge_comment?: string;
}

interface TeamScores {
    team_id: number;
    team_name: string;
    event_id: number;
    event_name: string;
    scores: ScoreWithAppeal[];
    overall_total: number;
}

// ─── Appeal Modal ─────────────────────────────────────────────
function AppealModal({
    scoreId,
    teamName,
    round,
    onClose,
    onAppealSubmitted,
}: {
    scoreId: number;
    teamName: string;
    round: number;
    onClose: () => void;
    onAppealSubmitted: () => void;
}) {
    const { token } = useAuth();
    const [grounds, setGrounds] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!grounds.trim()) {
            setError('Please provide grounds for the appeal.');
            return;
        }
        setSubmitting(true);
        setError('');
        const formData = new FormData();
        formData.append('score_id', String(scoreId));
        formData.append('grounds', grounds);
        if (file) formData.append('evidence', file);

        try {
            const res = await fetch('/api/appeals', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Appeal submission failed');
            }
            alert('Appeal submitted successfully!');
            onAppealSubmitted();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return createPortal(
        <div className="tdm-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="tdm-box">
                <div className="tdm-head">
                    <h2 className="tdm-title">Appeal Score</h2>
                    <button className="tdm-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit} className="tdm-form">
                    <p><strong>Team:</strong> {teamName} | <strong>Round:</strong> {round}</p>
                    <div className="tdm-field">
                        <label className="tdm-label">Grounds for Appeal *</label>
                        <textarea
                            className="tdm-input"
                            rows={4}
                            value={grounds}
                            onChange={e => setGrounds(e.target.value)}
                            placeholder="Explain why you believe the score should be reviewed..."
                        />
                    </div>
                    <div className="tdm-field">
                        <label className="tdm-label">Supporting Evidence (optional)</label>
                        <input
                            type="file"
                            className="tdm-input"
                            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt"
                            onChange={e => setFile(e.target.files?.[0] || null)}
                        />
                    </div>
                    {error && <p className="tdm-error">{error}</p>}
                    <div className="tdm-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit Appeal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}

export default function CoachView() {
    const { userId, token, logout } = useAuth();
    const navigate = useNavigate();
    const [teams, setTeams] = useState<TeamScores[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [appealTarget, setAppealTarget] = useState<{ scoreId: number; teamName: string; round: number } | null>(null);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);

    useEffect(() => {
        if (!userId) return;
        const fetchTeams = async () => {
            try {
                const res = await fetch(`/api/appeals/coach/teams`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error('Failed to load team scores');
                const data = await res.json();
                setTeams(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchTeams();
    }, [userId, token]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const reload = () => {
        setLoading(true);
        fetch(`/api/appeals/coach/teams`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(setTeams)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    if (loading) return <div className="td-loading"><span className="spinner-lg" /></div>;
    if (error) return <div className="td-error">{error}</div>;

    return (
        <div className="judge-view-root">
            {/* ─── Header – same styling as Judge View ─── */}
            <div className="judge-header">
                <h1 className="td-title">Coach Dashboard</h1>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button className="btn-secondary" onClick={() => setShowEditProfile(true)}>
                        Edit Profile
                    </button>
                    <button className="btn-secondary" onClick={() => setShowChangePassword(true)}>
                        Change Password
                    </button>
                    <button className="btn-secondary" onClick={handleLogout}>Sign out</button>
                </div>
            </div>

            {teams.length === 0 ? (
                <p>You are not assigned to any team yet.</p>
            ) : (
                teams.map(team => (
                    <div key={team.team_id} className="detail-card">
                        <h2>{team.team_name} – {team.event_name}</h2>
                        <table className="td-table">
                            <thead>
                                <tr>
                                    <th>Round</th>
                                    <th>Technical</th>
                                    <th>Innovation</th>
                                    <th>Theme</th>
                                    <th>Real World</th>
                                    <th>Teamwork</th>
                                    <th>Total</th>
                                    <th>Judge Approval</th>
                                    <th>Appeal Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {team.scores.map(score => {
                                    const total = (score.technical_score || 0) + (score.innovation_design_score || 0) + (score.theme_score || 0) + (score.real_world_score || 0) + (score.teamwork_score || 0);
                                    const isApproved = score.is_approved === 1;
                                    const canAppeal = !isApproved && (!score.appeal_status || score.appeal_status === 'none');

                                    return (
                                        <tr key={score.score_id}>
                                            <td>{score.round}</td>
                                            <td>{score.technical_score ?? '—'}</td>
                                            <td>{score.innovation_design_score ?? '—'}</td>
                                            <td>{score.theme_score ?? '—'}</td>
                                            <td>{score.real_world_score ?? '—'}</td>
                                            <td>{score.teamwork_score ?? '—'}</td>
                                            <td><strong>{total}</strong></td>
                                            <td>{isApproved ? '✅ Approved' : '⏳ Pending'}</td>
                                            <td>
                                                {canAppeal && (
                                                    <button
                                                        className="btn-appeal"
                                                        onClick={() => setAppealTarget({
                                                            scoreId: score.score_id,
                                                            teamName: team.team_name,
                                                            round: score.round,
                                                        })}
                                                    >
                                                        Appeal
                                                    </button>
                                                )}
                                                {score.appeal_status === 'pending' && <span>⏳ Under review</span>}
                                                {score.appeal_status === 'approved' && <span>✅ Appeal approved</span>}
                                                {score.appeal_status === 'rejected' && <span>❌ Appeal rejected</span>}
                                                {!canAppeal && !score.appeal_status && <span>—</span>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ))
            )}

            {appealTarget && (
                <AppealModal
                    scoreId={appealTarget.scoreId}
                    teamName={appealTarget.teamName}
                    round={appealTarget.round}
                    onClose={() => setAppealTarget(null)}
                    onAppealSubmitted={() => { setAppealTarget(null); reload(); }}
                />
            )}

            {showEditProfile && (
                <EditProfileModal
                    onClose={() => setShowEditProfile(false)}
                    onSaved={() => setShowEditProfile(false)}
                />
            )}
            {showChangePassword && (
                <ChangePasswordModal
                    onClose={() => setShowChangePassword(false)}
                    onSaved={() => setShowChangePassword(false)}
                />
            )}

            {/* ─── CSS ─── */}
            <style>{`
                .judge-view-root {
                    padding: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .judge-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .detail-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-medium);
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 24px;
                }
                .detail-card h2 {
                    margin-top: 0;
                    margin-bottom: 1rem;
                    font-size: 1.3rem;
                }
                .btn-appeal {
                    padding: 4px 12px;
                    background: #f59e0b;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                }
                .btn-appeal:hover {
                    background: #d97706;
                }
                .btn-appeal:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .td-loading, .td-error {
                    text-align: center;
                    padding: 40px;
                }
                .spinner-lg {
                    display: inline-block;
                    width: 32px;
                    height: 32px;
                    border: 3px solid rgba(99,102,241,0.2);
                    border-top-color: #6366f1;
                    border-radius: 50%;
                    animation: spin 0.7s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}