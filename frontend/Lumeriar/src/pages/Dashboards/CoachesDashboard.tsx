// CoachesDashboard.tsx
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { fetchTeams } from "../../api/teams";
import {
    fetchCoaches,
    fetchCoachFilterOptions,
    createCoach,
    updateCoach,
    deleteCoach,
    type Coach,
    type CoachFilters,
    type CoachFilterOptions,
} from "../../api/coaches";
import "../../layout/dashboard.css";


// ─── Empty form state ─────────────────────────────────────────
const emptyForm = (): Omit<Coach, "coach_id" | "created_at" | "team_name"> => ({
    first_name: "",
    surname: "",
    email: "",
    phone_no: "",
    date_of_birth: "",
    team_id: 0,
});

// ─── Coach Modal ──────────────────────────────────────────────
function CoachModal({ coach, onClose, onSaved }: {
    coach: Coach | null;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [form, setForm] = useState(coach ? { ...coach } : emptyForm());
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [teams, setTeams] = useState<{ team_id: number; team_name: string }[]>([]);
    const [loadingTeams, setLoadingTeams] = useState(true);
    const isEdit = !!coach;

    useEffect(() => {
        async function loadTeams() {
            try {
                const data = await fetchTeams({});  // fetch all teams, no filters
                setTeams(data.map((t: any) => ({ team_id: t.team_id, team_name: t.team_name })));
            } catch (err: any) {
                console.error("Failed to load teams", err);
                setError("Could not load team list.");
            } finally {
                setLoadingTeams(false);
            }
        }
        loadTeams();
    }, []);

    const set = (field: string, value: any) =>
        setForm(f => ({ ...f, [field]: value === "" ? null : value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.first_name.trim() || !form.surname.trim()) {
            setError("First name and surname are required.");
            return;
        }
        setSaving(true); setError("");
        try {
            const payload = {
                first_name: form.first_name,
                surname: form.surname,
                email: form.email,
                phone_no: form.phone_no,
                date_of_birth: form.date_of_birth,
                team_id: form.team_id ? Number(form.team_id) : 0,
            };
            if (isEdit) await updateCoach(coach.coach_id, payload);
            else await createCoach(payload);
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
                    <h2 className="tdm-title">{isEdit ? "Edit Coach" : "New Coach"}</h2>
                    <button className="tdm-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit} className="tdm-form">
                    <div className="tdm-row">
                        <div className="tdm-field">
                            <label className="tdm-label">First Name *</label>
                            <input className="tdm-input" value={form.first_name ?? ""} onChange={e => set("first_name", e.target.value)} placeholder="Mia" />
                        </div>
                        <div className="tdm-field">
                            <label className="tdm-label">Surname *</label>
                            <input className="tdm-input" value={form.surname ?? ""} onChange={e => set("surname", e.target.value)} placeholder="Chen" />
                        </div>
                    </div>
                    <div className="tdm-row">
                        <div className="tdm-field">
                            <label className="tdm-label">Email</label>
                            <input className="tdm-input" type="email" value={form.email ?? ""} onChange={e => set("email", e.target.value)} placeholder="coach@example.com" />
                        </div>
                        <div className="tdm-field">
                            <label className="tdm-label">Phone Number</label>
                            <input className="tdm-input" value={form.phone_no ?? ""} onChange={e => set("phone_no", e.target.value)} placeholder="+27 12 345 6789" />
                        </div>
                    </div>
                    <div className="tdm-row">
                        <div className="tdm-field">
                            <label className="tdm-label">Date of Birth</label>
                            <input type="date" className="tdm-input" value={form.date_of_birth ?? ""} onChange={e => set("date_of_birth", e.target.value)} />
                        </div>
                        <div className="tdm-field">
                            <label className="tdm-label">Team</label>
                            <select className="tdm-input" value={form.team_id ?? ""} onChange={e => set("team_id", e.target.value ? Number(e.target.value) : null)} disabled={loadingTeams}>
                                <option value="">-- Select Team --</option>
                                {teams.map(team => (
                                    <option key={team.team_id} value={team.team_id}>{team.team_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {error && <p className="tdm-error">{error}</p>}
                    <div className="tdm-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? <span className="spinner-sm" /> : isEdit ? "Save Changes" : "Create Coach"}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}

// ─── Delete Confirm ───────────────────────────────────────────
function DeleteConfirm({ coach, onClose, onDeleted }: {
    coach: Coach;
    onClose: () => void;
    onDeleted: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const confirm = async () => {
        setLoading(true);
        try { await deleteCoach(coach.coach_id); onDeleted(); }
        catch { setLoading(false); }
    };
    return createPortal(
        <div className="tdm-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="tdm-box tdm-box-sm">
                <div className="tdm-head">
                    <h2 className="tdm-title">Delete Coach</h2>
                    <button className="tdm-close" onClick={onClose}>×</button>
                </div>
                <p className="tdm-delete-msg">
                    Delete <strong>{coach.first_name} {coach.surname}</strong>? This action cannot be undone.
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
export default function CoachesDashboard() {
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [filterOptions, setFilterOptions] = useState<CoachFilterOptions>({ teams: [] });
    const [filters, setFilters] = useState<CoachFilters>({});
    const [loading, setLoading] = useState(true);
    const [editCoach, setEditCoach] = useState<Coach | null | "new">(null);
    const [deleteTarget, setDeleteTarget] = useState<Coach | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try { const data = await fetchCoaches(filters); setCoaches(data); }
        finally { setLoading(false); }
    }, [filters]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => { fetchCoachFilterOptions().then(setFilterOptions).catch(() => { }); }, []);

    const setFilter = (key: keyof CoachFilters, value: string) =>
        setFilters(f => ({ ...f, [key]: value || undefined }));
    const clearFilters = () => setFilters({});
    const activeFilterCount = Object.values(filters).filter(Boolean).length;

    return (
        <div className="td-root">
            <div className="td-header">
                <div>
                    <h1 className="td-title">Coaches</h1>
                    <p className="td-subtitle">{coaches.length} coach{coaches.length !== 1 ? "es" : ""} found</p>
                </div>
                <button className="btn-primary" onClick={() => setEditCoach("new")}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    New Coach
                </button>
            </div>

            <div className="td-filters">
                <div className="filter-search">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input type="text" placeholder="Search name, email…" value={filters.search ?? ""} onChange={e => setFilter("search", e.target.value)} />
                </div>
                <select value={filters.team_id ?? ""} onChange={e => setFilter("team_id", e.target.value)}>
                    <option value="">All Teams</option>
                    {filterOptions.teams.map(t => <option key={t.team_id} value={t.team_id}>{t.team_name}</option>)}
                </select>
                {activeFilterCount > 0 && (
                    <button className="btn-clear" onClick={clearFilters}>Clear ({activeFilterCount})</button>
                )}
            </div>

            <div className="td-table-wrap">
                {loading ? (
                    <div className="td-loading"><span className="spinner-lg" /></div>
                ) : coaches.length === 0 ? (
                    <div className="td-empty">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        <p>No coaches found</p>
                        {activeFilterCount > 0 && <button className="btn-clear" onClick={clearFilters}>Clear filters</button>}
                    </div>
                ) : (
                    <table className="td-table">
                        <thead>
                            <tr>
                                <th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Team</th><th>Date of Birth</th><th>Created</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coaches.map(c => (
                                <tr key={c.coach_id}>
                                    <td className="td-id">#{c.coach_id}</td>
                                    <td className="td-name"><strong>{c.first_name} {c.surname}</strong></td>
                                    <td>{c.email ?? <span className="td-null">—</span>}</td>
                                    <td>{c.phone_no ?? <span className="td-null">—</span>}</td>
                                    <td>{c.team_name ?? <span className="td-null">—</span>}</td>
                                    <td>{c.date_of_birth ? new Date(c.date_of_birth).toLocaleDateString() : <span className="td-null">—</span>}</td>
                                    <td className="td-date">{new Date(c.created_at).toLocaleDateString()}</td>
                                    <td className="td-actions">
                                        <button className="btn-icon edit" onClick={() => setEditCoach(c)} title="Edit">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                        </button>
                                        <button className="btn-icon delete" onClick={() => setDeleteTarget(c)} title="Delete">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {editCoach !== null && (
                <CoachModal
                    coach={editCoach === "new" ? null : editCoach}
                    onClose={() => setEditCoach(null)}
                    onSaved={() => { setEditCoach(null); load(); }}
                />
            )}
            {deleteTarget && (
                <DeleteConfirm
                    coach={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onDeleted={() => { setDeleteTarget(null); load(); }}
                />
            )}
        </div>
    );
}