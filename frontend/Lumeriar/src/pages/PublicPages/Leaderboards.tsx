import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../layout/events.css';

interface Event {
    event_id: number;
    name: string;
    date: string;
    venue: string;
}

interface RoundScore {
    round: number;
    total: number;
}

interface TeamLeaderboard {
    team_id: number;
    team_name: string;
    rounds: RoundScore[];
    overall_total: number;
}

interface LeaderboardData {
    event: Event;
    teams: TeamLeaderboard[];
}

interface Award {
    award_id: number;
    team_id: number;
    team_name: string;
    award_type: string;
    category_name: string | null;
    rank_position: number | null;
}

const Leaderboards: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);
    const [awards, setAwards] = useState<Award[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingAwards, setLoadingAwards] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (eventId) {
            setSelectedEventId(eventId);
            fetchLeaderboard(eventId);
            fetchAwards(eventId);
        } else {
            fetchEvents();
        }
    }, [eventId]);

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/events');
            if (!res.ok) throw new Error('Failed to fetch events');
            const data = await res.json();
            setEvents(data);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const fetchLeaderboard = async (id: string) => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/events/${id}/leaderboard`);
            if (!res.ok) throw new Error('Failed to load leaderboard');
            const data = await res.json();
            setLeaderboard(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchAwards = async (id: string) => {
        setLoadingAwards(true);
        try {
            const res = await fetch(`/api/awards/event/${id}`);
            if (!res.ok) {
                setAwards([]);
                return;
            }
            const data = await res.json();
            setAwards(data);
        } catch (err: any) {
            console.error('Awards fetch error:', err);
            setAwards([]);
        } finally {
            setLoadingAwards(false);
        }
    };

    const handleEventSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedEventId(id);
        if (id) {
            fetchLeaderboard(id);
            fetchAwards(id);
            navigate(`/leaderboard/${id}`, { replace: true });
        } else {
            setLeaderboard(null);
            setAwards([]);
        }
    };

    const getAllRounds = (teams: TeamLeaderboard[]): number[] => {
        const roundsSet = new Set<number>();
        teams.forEach(team => {
            team.rounds.forEach(r => roundsSet.add(r.round));
        });
        return Array.from(roundsSet).sort((a, b) => a - b);
    };

    const groupedAwards = awards.reduce((acc, award) => {
        const key = award.category_name || 'Overall';
        if (!acc[key]) acc[key] = [];
        acc[key].push(award);
        return acc;
    }, {} as Record<string, Award[]>);

    return (
        <div className="events-page">
            <h1>Leaderboard & Awards</h1>

            <div className="event-selector" style={{ marginBottom: '2rem' }}>
                <label htmlFor="eventSelect">Select Event: </label>
                <select
                    id="eventSelect"
                    value={selectedEventId}
                    onChange={handleEventSelect}
                    style={{ padding: '0.5rem', minWidth: '250px' }}
                >
                    <option value="">-- Choose an event --</option>
                    {events.map(ev => (
                        <option key={ev.event_id} value={ev.event_id}>
                            {ev.name} ({new Date(ev.date).toLocaleDateString()})
                        </option>
                    ))}
                </select>
            </div>

            {loading && <div>Loading leaderboard...</div>}
            {error && <div className="events-error">Error: {error}</div>}

            {leaderboard && (
                <>
                    <div>
                        <h2>
                            {leaderboard.event.name}
                            <span style={{ fontSize: '0.9rem', marginLeft: '1rem' }}>
                                {new Date(leaderboard.event.date).toLocaleDateString()} | {leaderboard.event.venue || 'Venue TBA'}
                            </span>
                        </h2>

                        {leaderboard.teams.length === 0 ? (
                            <p>No scores have been recorded for this event yet.</p>
                        ) : (
                            <div className="leaderboard-table-wrapper" style={{ overflowX: 'auto' }}>
                                <table className="leaderboard-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ padding: '8px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Team Name</th>
                                            {getAllRounds(leaderboard.teams).map(round => (
                                                <th key={round} style={{ padding: '8px', borderBottom: '2px solid #ddd', textAlign: 'center' }}>
                                                    Round {round}
                                                </th>
                                            ))}
                                            <th style={{ padding: '8px', borderBottom: '2px solid #ddd', textAlign: 'center' }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaderboard.teams
                                            .sort((a, b) => b.overall_total - a.overall_total)
                                            .map(team => {
                                                const roundMap = new Map(team.rounds.map(r => [r.round, r.total]));
                                                const allRounds = getAllRounds(leaderboard.teams);
                                                return (
                                                    <tr key={team.team_id}>
                                                        <td style={{ padding: '8px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>
                                                            {team.team_name}
                                                        </td>
                                                        {allRounds.map(round => (
                                                            <td key={round} style={{ padding: '8px', borderBottom: '1px solid #eee', textAlign: 'center' }}>
                                                                {roundMap.has(round) ? roundMap.get(round) : '—'}
                                                            </td>
                                                        ))}
                                                        <td style={{ padding: '8px', borderBottom: '1px solid #eee', textAlign: 'center', fontWeight: 'bold' }}>
                                                            {team.overall_total}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Awards Section - Public view */}
                    <div style={{ marginTop: '3rem' }}>
                        <h2>Awards</h2>
                        {loadingAwards ? (
                            <div>Loading awards...</div>
                        ) : awards.length === 0 ? (
                            <div className="placeholder-card" style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                                <p>🏆 Awards for this event will be announced soon.</p>
                            </div>
                        ) : (
                            Object.entries(groupedAwards).map(([category, catAwards]) => (
                                <div key={category} style={{ marginBottom: '1.5rem' }}>
                                    <h3>{category === 'Overall' ? 'Overall Awards' : category}</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                                        {catAwards.map(award => (
                                            <div key={award.award_id} className="award-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1rem' }}>
                                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f39c12' }}>{award.award_type}</div>
                                                <div style={{ marginTop: '0.5rem' }}>
                                                    <span style={{ fontWeight: 'bold' }}>{award.team_name}</span>
                                                    {award.rank_position && <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>(#{award.rank_position})</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Leaderboards;