// src/pages/JudgeView.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import '../../layout/dashboard.css';
import EditProfileModal from '../../components/EditProfileModal';
import ChangePasswordModal from '../../components/ChangePasswordModal';
import { API_BASE } from '../../api/client';  // adjust path

export default function JudgeView() {
    const { userId, token, logout } = useAuth();
    const navigate = useNavigate();
    const [eventsHead, setEventsHead] = useState<any[]>([]);
    const [scoringEvents, setScoringEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);

    useEffect(() => {
        if (!userId) return;
        const fetchData = async () => {
            try {
                // Events where judge is head
                const eventsRes = await fetch(`${API_BASE}/api/judges/${userId}/events-as-head`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const eventsData = await eventsRes.json();
                setEventsHead(eventsData);

                // Teams‑to‑score – we only need distinct events
                const teamsRes = await fetch(`${API_BASE}/api/judges/${userId}/teams-to-score`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const teamsData = await teamsRes.json();

                // Extract unique event info from the assignments
                const uniqueEvents = new Map();
                teamsData.forEach((assignment: any) => {
                    if (!uniqueEvents.has(assignment.event_id)) {
                        uniqueEvents.set(assignment.event_id, {
                            event_id: assignment.event_id,
                            event_name: assignment.event_name,
                            event_date: assignment.event_date,
                        });
                    }
                });
                setScoringEvents(Array.from(uniqueEvents.values()));
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userId, token]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) return <div className="td-loading"><span className="spinner-lg" /></div>;
    if (error) return <div className="td-error">{error}</div>;

    return (
        <div className="judge-view-root">
            <div className="judge-header">
                <h1 className="td-title">Judge Dashboard</h1>
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
                                <Link to={`/head-judge/${event.event_id}`} className="btn-details">
                                    Review Scores & Approve
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Events where judge is scoring (any team) */}
            <div className="detail-card">
                <h2>Events you are scoring</h2>
                {scoringEvents.length === 0 ? (
                    <p>You are not assigned to score any teams yet.</p>
                ) : (
                    <div className="events-list">
                        {scoringEvents.map((event) => (
                            <div key={event.event_id} className="event-card">
                                <div className="event-info">
                                    <h3>{event.event_name}</h3>
                                    <p>{new Date(event.event_date).toLocaleDateString()}</p>
                                </div>
                                <Link to={`/scoring/${event.event_id}`} className="btn-details">
                                    Enter Scores
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>

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
                .event-card {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    border-bottom: 1px solid var(--border-light);
                }
                .btn-details {
                    background: #60a5fa;
                    color: white;
                    padding: 6px 12px;
                    border-radius: 6px;
                    text-decoration: none;
                }
            `}</style>
        </div>
    );
}