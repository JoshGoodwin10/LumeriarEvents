import { useState, useEffect } from 'react';
import { fetchEvents, type Event } from '../../api/events';
import '../../layout/dashboard.css';
import { API_BASE } from '../../api/client';  // adjust path

export default function AwardsDashboard() {
    const [allEvents, setAllEvents] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [awards, setAwards] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingEvents, setLoadingEvents] = useState(true);

    // Filter states
    const [eventSearch, setEventSearch] = useState('');
    const [eventCategory, setEventCategory] = useState('');
    const [eventDateFrom, setEventDateFrom] = useState('');
    const [eventDateTo, setEventDateTo] = useState('');
    const [categories, setCategories] = useState<string[]>([]);

    // Fetch all events and categories
    useEffect(() => {
        const loadEvents = async () => {
            setLoadingEvents(true);
            try {
                const eventsData = await fetchEvents({});
                setAllEvents(eventsData);
                // Extract unique categories
                const cats = [...new Set(eventsData.map(e => e.category).filter(Boolean))] as string[];
                setCategories(cats);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingEvents(false);
            }
        };
        loadEvents();
    }, []);

    // Filter events locally
    useEffect(() => {
        let filtered = [...allEvents];
        if (eventSearch) {
            const searchLower = eventSearch.toLowerCase();
            filtered = filtered.filter(e =>
                e.name.toLowerCase().includes(searchLower) ||
                (e.venue && e.venue.toLowerCase().includes(searchLower))
            );
        }
        if (eventCategory) {
            filtered = filtered.filter(e => e.category === eventCategory);
        }
        if (eventDateFrom) {
            filtered = filtered.filter(e => new Date(e.date) >= new Date(eventDateFrom));
        }
        if (eventDateTo) {
            filtered = filtered.filter(e => new Date(e.date) <= new Date(eventDateTo));
        }
        setFilteredEvents(filtered);
        // If selected event is no longer in filtered list, reset selection
        if (selectedEventId && !filtered.some(e => e.event_id.toString() === selectedEventId)) {
            setSelectedEventId('');
            setAwards([]);
        }
    }, [allEvents, eventSearch, eventCategory, eventDateFrom, eventDateTo, selectedEventId]);

    const clearFilters = () => {
        setEventSearch('');
        setEventCategory('');
        setEventDateFrom('');
        setEventDateTo('');
    };

    const activeFilterCount = [eventSearch, eventCategory, eventDateFrom, eventDateTo].filter(Boolean).length;

    useEffect(() => {
        if (!selectedEventId) return;
        setLoading(true);
        fetch(`${API_BASE}/api/awards/event/${selectedEventId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
            .then(res => res.json())
            .then(setAwards)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [selectedEventId]);

    const getOrdinal = (n: number) => {
        if (n === 1) return 'st';
        if (n === 2) return 'nd';
        if (n === 3) return 'rd';
        return 'th';
    };

    return (
        <div className="td-root">
            <div className="td-header">
                <div>
                    <h1 className="td-title">Awards</h1>
                    <p className="td-subtitle">View awards generated for each event</p>
                </div>
            </div>

            {/* Event filters */}
            <div className="td-filters">
                <div className="filter-search">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search events by name or venue..."
                        value={eventSearch}
                        onChange={e => setEventSearch(e.target.value)}
                    />
                </div>
                <select value={eventCategory} onChange={e => setEventCategory(e.target.value)}>
                    <option value="">All Categories</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <input
                    type="date"
                    value={eventDateFrom}
                    onChange={e => setEventDateFrom(e.target.value)}
                    placeholder="From date"
                />
                <input
                    type="date"
                    value={eventDateTo}
                    onChange={e => setEventDateTo(e.target.value)}
                    placeholder="To date"
                />
                {activeFilterCount > 0 && (
                    <button className="btn-clear" onClick={clearFilters}>Clear ({activeFilterCount})</button>
                )}
            </div>

            {/* Event selector */}
            <div className="td-filters" style={{ marginTop: '0.5rem' }}>
                <select
                    value={selectedEventId}
                    onChange={e => setSelectedEventId(e.target.value)}
                    style={{ minWidth: '250px' }}
                >
                    <option value="">Select an event</option>
                    {filteredEvents.map(ev => (
                        <option key={ev.event_id} value={ev.event_id}>
                            {ev.name} ({new Date(ev.date).toLocaleDateString()})
                        </option>
                    ))}
                </select>
                {loadingEvents && <span className="spinner-sm" style={{ marginLeft: '10px' }} />}
            </div>

            <div className="td-table-wrap">
                {loading ? (
                    <div className="td-loading"><span className="spinner-lg" /></div>
                ) : !selectedEventId ? (
                    <div className="td-empty">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <p>Please select an event to view awards.</p>
                    </div>
                ) : awards.length === 0 ? (
                    <div className="td-empty">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <polygon points="12 2 15.5 9.5 23 9.5 17 14.5 19.5 22 12 17.5 4.5 22 7 14.5 1 9.5 8.5 9.5 12 2" />
                        </svg>
                        <p>No awards generated for this event yet.</p>
                        <p className="td-muted">Use the "Generate Awards" button on the event page to create them.</p>
                    </div>
                ) : (
                    <table className="td-table">
                        <thead>
                            <tr>
                                <th>Award Type</th>
                                <th>Team</th>
                                <th>Category</th>
                                <th>Rank</th>
                            </tr>
                        </thead>
                        <tbody>
                            {awards.map(award => (
                                <tr key={award.award_id}>
                                    <td className="td-name">{award.award_type}</td>
                                    <td>{award.team_name}</td>
                                    <td>{award.category_name || '—'}</td>
                                    <td>{award.rank_position ? `${award.rank_position}${getOrdinal(award.rank_position)}` : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}