import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../layout/events.css'; // Create this CSS file for styling the Events page

interface Event {
    event_id: number;
    name: string;
    date: string;          // ISO date string (YYYY-MM-DD)
    category: string;
    venue: string;
    start_time: string;    // e.g. "09:00:00"
    end_time: string;
    registration_open: boolean;
    created_at: string;
}

const Events: React.FC = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('/api/events'); // adjust endpoint to your backend
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

    // Helper to format date and time
    const formatDate = (dateStr: string) => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return new Date(dateStr).toLocaleDateString(undefined, options);
    };

    const formatTime = (timeStr: string) => {
        // timeStr comes as "HH:MM:SS" – trim seconds if desired
        return timeStr.slice(0, 5);
    };

    if (loading) return <div className="events-loading">Loading events...</div>;
    if (error) return <div className="events-error">Error: {error}</div>;

    return (
        <div className="events-page">
            <h1>Upcoming & Past Events</h1>

            {/* Navigation Buttons (existing requirement) */}
            <div className="sections">
                <button onClick={() => navigate('/leaderboard')}>Leaderboard</button>
                <button onClick={() => navigate('/register')}>Register for an Event</button>
                <button onClick={() => navigate('/past-winners')}>Past Winners</button>
                <button onClick={() => navigate('/rules-docs')}>Rules & Docs</button>
            </div>

            {/* Events List */}
            <div className="events-list">
                {events.length === 0 ? (
                    <p>No events found.</p>
                ) : (
                    events.map(event => (
                        <div key={event.event_id} className="event-card">
                            <div className="event-card__header">
                                <h2>{event.name}</h2>
                                <span className={`event-registration-status ${event.registration_open ? 'open' : 'closed'}`}>
                                    {event.registration_open ? 'Registration Open' : 'Registration Closed'}
                                </span>
                            </div>
                            <div className="event-card__details">
                                <p><strong>📅 Date:</strong> {formatDate(event.date)}</p>
                                <p><strong>⏰ Time:</strong> {formatTime(event.start_time)} – {formatTime(event.end_time)}</p>
                                <p><strong>📍 Venue:</strong> {event.venue}</p>
                                <p><strong>🏷️ Category:</strong> {event.category}</p>
                            </div>
                            <div className="event-card__actions">
                                {event.registration_open && (
                                    <button
                                        className="btn-register"
                                        onClick={() => navigate(`/register?event=${event.event_id}`)}
                                    >
                                        Register Now
                                    </button>
                                )}
                                <button
                                    className="btn-details"
                                    onClick={() => navigate(`/events/${event.event_id}`)}
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Events;