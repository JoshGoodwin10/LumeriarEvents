import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../layout/events.css'; // reuse events.css for styling

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

const Leaderboards: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>(); // if URL is /leaderboard/5
    const navigate = useNavigate();
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // If eventId is in URL (from Events.tsx), auto-load that event
    useEffect(() => {
        if (eventId) {
            setSelectedEventId(eventId);
            fetchLeaderboard(eventId);
        } else {
            // Load event dropdown list
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

    const handleEventSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedEventId(id);
        if (id) {
            fetchLeaderboard(id);
            // Update URL without reload (optional)
            navigate(`/leaderboard/${id}`, { replace: true });
        } else {
            setLeaderboard(null);
        }
    };

    // Helper: determine all rounds present across teams
    const getAllRounds = (teams: TeamLeaderboard[]): number[] => {
        const roundsSet = new Set<number>();
        teams.forEach(team => {
            team.rounds.forEach(r => roundsSet.add(r.round));
        });
        return Array.from(roundsSet).sort((a, b) => a - b);
    };

    return (
        <div className="events-page">
            <h1>Leaderboard</h1>

            {/* Event selector (always shown, but pre-filled if eventId in URL) */}
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
                        <>
                            {/* Table: Team Name | Round1 | Round2 | ... | Total */}
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
                                            <th style={{ padding: '8px', borderBottom: '2px solid #ddd', textAlign: 'center' }}>Total (All Rounds)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaderboard.teams
                                            .sort((a, b) => b.overall_total - a.overall_total) // sort by total descending
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

                            {/* Optional: Detailed round breakdown per team (accordion) – can be added later */}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default Leaderboards;