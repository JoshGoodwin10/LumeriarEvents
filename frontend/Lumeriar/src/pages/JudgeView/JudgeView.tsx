import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import '../../layout/dashboard.css';

interface Event {
    event_id: number;
    name: string;
    date: string;
    venue: string;
    start_time: string;
    end_time: string;
    category: string;
}

interface TeamAssignment {
    team_id: number;
    team_name: string;
    event_id: number;
    event_name: string;
    event_date: string;
    rounds: { round: number; approved: boolean }[];
    has_approved: boolean;
}

export default function JudgeView() {
    const { userId, token } = useAuth();
    const [eventsHead, setEventsHead] = useState<Event[]>([]);
    const [teams, setTeams] = useState<TeamAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!userId) return;
        const fetchData = async () => {
            try {
                const [eventsRes, teamsRes] = await Promise.all([
                    fetch(`/api/judges/${userId}/events-as-head`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch(`/api/judges/${userId}/teams-to-score`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);
                if (!eventsRes.ok || !teamsRes.ok) throw new Error('Failed to load data');
                setEventsHead(await eventsRes.json());
                setTeams(await teamsRes.json());
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
                                <div className="event-actions">
                                    <Link to={`/events/${event.event_id}`} className="btn-details">View Event</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Teams to score (or already scored) */}
            <div className="detail-card">
                <h2>Teams you are scoring / have scored</h2>
                {teams.length === 0 ? (
                    <p>No team scores recorded yet.</p>
                ) : (
                    <div className="teams-list">
                        {teams.map((assignment) => (
                            <div key={`${assignment.event_id}-${assignment.team_id}`} className="team-card">
                                <div className="team-info">
                                    <h3>{assignment.team_name}</h3>
                                    <p>Event: {assignment.event_name} – {new Date(assignment.event_date).toLocaleDateString()}</p>
                                    <p>Rounds: {assignment.rounds.map(r => `Round ${r.round}${r.approved ? ' (approved)' : ' (pending)'}`).join(', ')}</p>
                                </div>
                                <div className="team-actions">
                                    <Link to={`/events/${assignment.event_id}?team=${assignment.team_id}`} className="btn-details">Enter Scores</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .detail-card { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.08); border-radius: 12px; padding: 20px; margin-bottom: 24px; }
                .detail-card h2 { margin-top: 0; font-size: 1.3rem; }
                .event-card, .team-card { display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid rgba(255,255,255,.1); }
                .event-info, .team-info { flex: 1; }
                .btn-details { background: #60a5fa; color: white; padding: 6px 12px; border-radius: 6px; text-decoration: none; }
                .btn-details:hover { background: #3b82f6; }
            `}</style>
        </div>
    );
}