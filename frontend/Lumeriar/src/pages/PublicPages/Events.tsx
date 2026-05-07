import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../layout/events.css';

interface Event {
    event_id: number;
    name: string;
    date: string;          // YYYY-MM-DD
    category: string;
    venue: string;
    start_time: string;
    end_time: string;
    registration_open: boolean;
    created_at: string;
}

const Events: React.FC = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('/api/events');
                if (!response.ok) throw new Error('Failed to fetch events');
                const data = await response.json();
                setEvents(data);
            } catch (err: any) {
                setError(err.message || 'Something went wrong');
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    // Helper: get today's date in YYYY-MM-DD without time
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    // Categorise events
    const today = getTodayDate();
    const ongoingEvents = events.filter(e => e.date === today);
    const upcomingEvents = events.filter(e => e.date > today);
    const pastEvents = events.filter(e => e.date < today);

    const renderEventCard = (event: Event, showScoreboard: boolean) => (
        <div key={event.event_id} className="event-card">
            {/* Date box */}
            <div className="event-date-box">
                <div className="event-date-month">
                    {new Date(event.date).toLocaleString('default', { month: 'short' }).toUpperCase()}
                </div>
                <div className="event-date-day">
                    {new Date(event.date).getDate()}
                </div>
                <div className="event-date-year">
                    {new Date(event.date).getFullYear()}
                </div>
            </div>

            {/* Event info */}
            <div className="event-info">
                <h3>{event.name}</h3>
                <p>{event.venue || 'Venue TBA'}</p>
                <div className="event-meta">
                    <span>⏰ {event.start_time?.slice(0, 5)} – {event.end_time?.slice(0, 5)}</span>
                    <span>🏷️ {event.category || 'General'}</span>
                    <span className={`reg-badge ${event.registration_open ? 'open' : 'closed'}`}>
                        {event.registration_open ? 'Registration Open' : 'Closed'}
                    </span>
                </div>
            </div>

            {/* Action buttons */}
            <div className="event-card__actions">
                {event.registration_open && (
                    <button
                        className="btn-register"
                        onClick={() => navigate(`/register?event=${event.event_id}`)}
                    >
                        Register
                    </button>
                )}
                {showScoreboard && (
                    <button
                        className="btn-scoreboard"
                        onClick={() => navigate(`/leaderboard/${event.event_id}`)}
                    >
                        Scoreboard
                    </button>
                )}
                <button
                    className="btn-details"
                    onClick={() => setSelectedEvent(event)}
                >
                    Details
                </button>
            </div>
        </div>
    );

    if (loading) return <div className="events-loading">Loading events...</div>;
    if (error) return <div className="events-error">Error: {error}</div>;

    return (
        <div className="events-page">
            <h1>Events</h1>

            {/* Ongoing Events – shows Scoreboard */}
            {ongoingEvents.length > 0 && (
                <section className="events-section">
                    <h2>Ongoing Events</h2>
                    <div className="events-list">
                        {ongoingEvents.map(event => renderEventCard(event, true))}
                    </div>
                </section>
            )}

            {/* Upcoming Events – NO Scoreboard */}
            {upcomingEvents.length > 0 && (
                <section className="events-section">
                    <h2>Upcoming Events</h2>
                    <div className="events-list">
                        {upcomingEvents.map(event => renderEventCard(event, false))}
                    </div>
                </section>
            )}

            {/* Past Events – shows Scoreboard */}
            {pastEvents.length > 0 && (
                <section className="events-section">
                    <h2>Past Events</h2>
                    <div className="events-list">
                        {pastEvents.map(event => renderEventCard(event, true))}
                    </div>
                </section>
            )}

            {/* Modal placeholder for event details */}
            {selectedEvent && (
                <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{selectedEvent.name}</h2>
                        <p><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()}</p>
                        <p><strong>Venue:</strong> {selectedEvent.venue || 'TBA'}</p>
                        <p><strong>Time:</strong> {selectedEvent.start_time?.slice(0, 5)} – {selectedEvent.end_time?.slice(0, 5)}</p>
                        <p><strong>Category:</strong> {selectedEvent.category || 'General'}</p>
                        <p><strong>Registration:</strong> {selectedEvent.registration_open ? 'Open' : 'Closed'}</p>
                        <button className="btn-close-modal" onClick={() => setSelectedEvent(null)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Events;