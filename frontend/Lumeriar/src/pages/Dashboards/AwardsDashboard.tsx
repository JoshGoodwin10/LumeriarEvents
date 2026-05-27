import { useState, useEffect } from 'react';
import { fetchEvents, type Event } from '../../api/events';

export default function AwardsDashboard() {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [awards, setAwards] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchEvents().then(setEvents).catch(console.error);
    }, []);

    useEffect(() => {
        if (!selectedEventId) return;
        setLoading(true);
        fetch(`/api/awards/event/${selectedEventId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
            .then(res => res.json())
            .then(setAwards)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [selectedEventId]);

    return (
        <div className="td-root">
            <div className="td-header">
                <h1>Awards</h1>
            </div>
            <div className="td-filters">
                <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)}>
                    <option value="">Select an event</option>
                    {events.map(ev => (
                        <option key={ev.event_id} value={ev.event_id}>{ev.name}</option>
                    ))}
                </select>
            </div>
            {loading && <div>Loading...</div>}
            {awards.length === 0 && !loading && selectedEventId && <p>No awards generated yet.</p>}
            <div className="awards-list">
                {awards.map(award => (
                    <div key={award.award_id} className="award-card">
                        <strong>{award.award_type}</strong> – {award.team_name}
                        {award.category_name && <span> ({award.category_name})</span>}
                    </div>
                ))}
            </div>
            <style>{`
                .awards-list { display: grid; gap: 1rem; margin-top: 1rem; }
                .award-card { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.08); border-radius: 12px; padding: 1rem; }
            `}</style>
        </div>
    );
}