import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
    fetchEvents,
    fetchEventFilterOptions,
    createEvent,
    updateEvent,
    deleteEvent,
    type Event,
    type EventFilters,
    type EventFilterOptions,
} from "../../api/events";
import "../../layout/dashboard.css";
import { Link } from "react-router-dom";

// Empty form for new event – matches the new schema
const emptyForm = (): Omit<Event, "event_id" | "created_at"> => ({
    name: "",
    date: "",
    rounds: 1,               // default 1 round
    venue: "",
    start_time: "09:00:00",
    end_time: "17:00:00",
    registration_open: true,
    category: "",
    team_count: 0,
    head_judge: null,
});

// ─── Event Modal ──────────────────────────────────────────────
function EventModal({ event, onClose, onSaved }: {
    event: Event | null;
    onClose: () => void;
    onSaved: () => void;
}) {
    // Helper: format any date string (ISO or 'YYYY-MM-DD') to YYYY-MM-DD for input[type="date"]
    const formatDateForInput = (dateStr: string | null): string => {
        if (!dateStr) return '';
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr; // already correct
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '';
        return d.toISOString().split('T')[0];
    };

    // Initialise form state – if editing, format the date correctly
    const getInitialForm = () => {
        if (event) {
            return {
                ...event,
                date: formatDateForInput(event.date),
            };
        }
        return emptyForm();
    };

    const [form, setForm] = useState(getInitialForm());
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const isEdit = !!event;

    const set = (field: string, value: any) =>
        setForm(f => ({ ...f, [field]: value === "" ? null : value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim() || !form.date) {
            setError("Event name and date are required.");
            return;
        }
        setSaving(true);
        setError("");
        try {
            const payload = {
                name: form.name,
                date: form.date,               // now in YYYY-MM-DD
                venue: form.venue,
                start_time: form.start_time,
                end_time: form.end_time,
                registration_open: form.registration_open,
                category: form.category,
                team_count: form.team_count,
                rounds: form.rounds,
                head_judge: form.head_judge,
            };
            if (isEdit) {
                await updateEvent(event.event_id, payload);
            } else {
                await createEvent(payload);
            }
            onSaved();
        } catch (err: any) {
            setError(err.message || "Save failed.");
        } finally {
            setSaving(false);
        }
    };

    return createPortal(
        <div className="tdm-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="tdm-box">
                <div className="tdm-head">
                    <h2 className="tdm-title">{isEdit ? "Edit Event" : "New Event"}</h2>
                    <button className="tdm-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit} className="tdm-form">
                    <div className="tdm-field">
                        <label className="tdm-label">Event Name *</label>
                        <input className="tdm-input" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Regional Qualifier" />
                    </div>
                    <div className="tdm-row">
                        <div className="tdm-field">
                            <label className="tdm-label">Date *</label>
                            <input type="date" className="tdm-input" value={form.date} onChange={e => set("date", e.target.value)} />
                        </div>
                        <div className="tdm-field">
                            <label className="tdm-label">Venue</label>
                            <input className="tdm-input" value={form.venue ?? ""} onChange={e => set("venue", e.target.value)} placeholder="Convention Center" />
                        </div>
                    </div>
                    <div className="tdm-row">
                        <div className="tdm-field">
                            <label className="tdm-label">Start Time</label>
                            <input type="time" className="tdm-input" value={form.start_time?.slice(0, 5) ?? "09:00"} onChange={e => set("start_time", e.target.value)} />
                        </div>
                        <div className="tdm-field">
                            <label className="tdm-label">End Time</label>
                            <input type="time" className="tdm-input" value={form.end_time?.slice(0, 5) ?? "17:00"} onChange={e => set("end_time", e.target.value)} />
                        </div>
                    </div>
                    <div className="tdm-row">
                        <div className="tdm-field">
                            <label className="tdm-label">Category</label>
                            <input className="tdm-input" value={form.category ?? ""} onChange={e => set("category", e.target.value)} placeholder="Robotics" />
                        </div>
                        <div className="tdm-field">
                            <label className="tdm-label">Number of Rounds *</label>
                            <input type="number" min="1" max="20" className="tdm-input"
                                value={form.rounds} onChange={e => set("rounds", parseInt(e.target.value) || 1)} />
                        </div>
                    </div>
                    <div className="tdm-row">
                        <div className="tdm-field">
                            <label className="tdm-label" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <input type="checkbox" checked={form.registration_open} onChange={e => set("registration_open", e.target.checked)} />
                                Registration Open
                            </label>
                        </div>
                    </div>
                    {error && <p className="tdm-error">{error}</p>}
                    <div className="tdm-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? <span className="spinner-sm" /> : isEdit ? "Save Changes" : "Create Event"}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}

// ─── Delete Confirm (unchanged) ───────────────────────────────
function DeleteConfirm({ event, onClose, onDeleted }: {
    event: Event;
    onClose: () => void;
    onDeleted: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const confirm = async () => {
        setLoading(true);
        try { await deleteEvent(event.event_id); onDeleted(); }
        catch { setLoading(false); }
    };
    return createPortal(
        <div className="tdm-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="tdm-box tdm-box-sm">
                <div className="tdm-head">
                    <h2 className="tdm-title">Delete Event</h2>
                    <button className="tdm-close" onClick={onClose}>×</button>
                </div>
                <p className="tdm-delete-msg">
                    Are you sure you want to delete <strong>{event.name}</strong>? This action cannot be undone.
                </p>
                <div className="tdm-actions">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn-danger" onClick={confirm} disabled={loading}>
                        {loading ? <span className="spinner-sm" /> : "Delete"}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

// ─── Main Component ───────────────────────────────────────────
export default function EventsDashboard() {
    const [events, setEvents] = useState<Event[]>([]);
    const [filterOptions, setFilterOptions] = useState<EventFilterOptions>({ categories: [] });
    const [filters, setFilters] = useState<EventFilters>({});
    const [loading, setLoading] = useState(true);
    const [editEvent, setEditEvent] = useState<Event | null | "new">(null);
    const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchEvents(filters);
            setEvents(data);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => {
        fetchEventFilterOptions().then(setFilterOptions).catch(() => { });
    }, []);

    const setFilter = (key: keyof EventFilters, value: string) =>
        setFilters(f => ({ ...f, [key]: value || undefined }));
    const clearFilters = () => setFilters({});
    const activeFilterCount = Object.values(filters).filter(Boolean).length;

    return (
        <div className="td-root">
            <div className="td-header">
                <div>
                    <h1 className="td-title">Events</h1>
                    <p className="td-subtitle">{events.length} event{events.length !== 1 ? "s" : ""} found</p>
                </div>
                <button className="btn-primary" onClick={() => setEditEvent("new")}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    New Event
                </button>
            </div>

            <div className="td-filters">
                <div className="filter-search">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input type="text" placeholder="Search event name or category…" value={filters.search ?? ""} onChange={e => setFilter("search", e.target.value)} />
                </div>
                <select value={filters.category ?? ""} onChange={e => setFilter("category", e.target.value)}>
                    <option value="">All Categories</option>
                    {filterOptions.categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {activeFilterCount > 0 && (
                    <button className="btn-clear" onClick={clearFilters}>Clear ({activeFilterCount})</button>
                )}
            </div>

            <div className="td-table-wrap">
                {loading ? (
                    <div className="td-loading"><span className="spinner-lg" /></div>
                ) : events.length === 0 ? (
                    <div className="td-empty">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <p>No events found</p>
                        {activeFilterCount > 0 && <button className="btn-clear" onClick={clearFilters}>Clear filters</button>}
                    </div>
                ) : (
                    <table className="td-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Event Name</th>
                                <th>Date</th>
                                <th>Venue</th>
                                <th>Rounds</th>
                                <th>Time</th>
                                <th>Category</th>
                                <th>Registration</th>
                                <th>Teams</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map(event => (
                                <tr key={event.event_id}>
                                    <td className="td-id">#{event.event_id}</td>
                                    <td className="td-name">
                                        <Link to={`/events/${event.event_id}`} className="event-link">
                                            {event.name}
                                        </Link>
                                    </td>
                                    <td>{new Date(event.date).toLocaleDateString()}</td>
                                    <td>{event.venue ?? <span className="td-null">—</span>}</td>
                                    <td>{event.rounds}</td>
                                    <td className="td-time">
                                        {event.start_time?.slice(0, 5)} – {event.end_time?.slice(0, 5)}
                                    </td>
                                    <td>{event.category ?? <span className="td-null">—</span>}</td>
                                    <td>
                                        <span className={`reg-badge ${event.registration_open ? "open" : "closed"}`}>
                                            {event.registration_open ? "Open" : "Closed"}
                                        </span>
                                    </td>
                                    <td>{event.team_count ?? 0}</td>
                                    <td className="td-actions">
                                        <button className="btn-icon" onClick={() => setEditEvent(event)} title="Edit">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M17 3l4 4-7 7H10v-4l7-7z" /><path d="M4 20h16" />
                                            </svg>
                                        </button>
                                        <button className="btn-icon" onClick={() => setDeleteTarget(event)} title="Delete">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13" />
                                                <line x1="9" y1="3" x2="15" y2="3" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {editEvent !== null && (
                <EventModal
                    event={editEvent === "new" ? null : editEvent}
                    onClose={() => setEditEvent(null)}
                    onSaved={() => { setEditEvent(null); load(); }}
                />
            )}
            {deleteTarget && (
                <DeleteConfirm
                    event={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onDeleted={() => { setDeleteTarget(null); load(); }}
                />
            )}
        </div>
    );
}