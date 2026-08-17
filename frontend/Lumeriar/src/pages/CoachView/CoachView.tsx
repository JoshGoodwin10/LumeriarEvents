// src/pages/CoachView/CoachView.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import '../../layout/dashboard.css';

interface Score {
    score_id: number;
    round: number;
    technical_score: number;
    innovation_design_score: number;
    theme_score: number;
    real_world_score: number;
    teamwork_score: number;
    total: number;
    is_approved: number;
    appeal_status: string; // 'none', 'pending', 'approved', 'rejected'
}

interface TeamScores {
    team_id: number;
    team_name: string;
    event_id: number;
    event_name: string;
    scores: Score[];
    overall_total: number;
}

export default function CoachView() {
    const { userId, token, logout } = useAuth();
    const navigate = useNavigate();
    const [teams, setTeams] = useState<TeamScores[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [appealing, setAppealing] = useState<number | null>(null);

    useEffect(() => {
        if (!userId) return;
        const fetchTeams = async () => {
            try {
                const res = await fetch(`/api/coaches/${userId}/teams-scores`, {
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

    const handleAppeal = async (scoreId: number) => {
        setAppealing(scoreId);
        try {
            const res = await fetch(`/api/scores/${scoreId}/appeal`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Appeal failed');
            }
            // Refresh data after appeal
            setTeams(prev => prev.map(team => ({
                ...team,
                scores: team.scores.map(s =>
                    s.score_id === scoreId ? { ...s, appeal_status: 'pending' } : s
                ),
            })));
            alert('Appeal submitted successfully!');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setAppealing(null);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) return <div className="td-loading"><span className="spinner-lg" /></div>;
    if (error) return <div className="td-error">{error}</div>;

    return (
        <div className="judge-view-root">
            <div className="judge-header">
                <h1 className="td-title">Coach Dashboard</h1>
                <button className="btn-secondary" onClick={handleLogout}>Sign out</button>
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
                                    <th>Status</th>
                                    <th>Appeal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {team.scores.map(score => {
                                    const total = score.technical_score + score.innovation_design_score + score.theme_score + score.real_world_score + score.teamwork_score;
                                    const isApproved = score.is_approved === 1;
                                    return (
                                        <tr key={score.score_id}>
                                            <td>{score.round}</td>
                                            <td>{score.technical_score}</td>
                                            <td>{score.innovation_design_score}</td>
                                            <td>{score.theme_score}</td>
                                            <td>{score.real_world_score}</td>
                                            <td>{score.teamwork_score}</td>
                                            <td><strong>{total}</strong></td>
                                            <td>{isApproved ? '✅ Approved' : '⏳ Pending'}</td>
                                            <td>
                                                {isApproved && score.appeal_status === 'none' && (
                                                    <button
                                                        className="btn-appeal"
                                                        onClick={() => handleAppeal(score.score_id)}
                                                        disabled={appealing === score.score_id}
                                                    >
                                                        {appealing === score.score_id ? 'Appealing...' : 'Appeal'}
                                                    </button>
                                                )}
                                                {score.appeal_status === 'pending' && <span>⏳ Under review</span>}
                                                {score.appeal_status === 'approved' && <span>✅ Appeal approved</span>}
                                                {score.appeal_status === 'rejected' && <span>❌ Appeal rejected</span>}
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
    );
}