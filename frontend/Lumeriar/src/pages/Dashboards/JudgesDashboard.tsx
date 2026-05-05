// JudgesDashboard.tsx
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
    fetchJudges,
    fetchJudgeFilterOptions,
    createJudge,
    updateJudge,
    deleteJudge,
    type Judge,
    type JudgeFilters,
    type JudgeFilterOptions,
} from "../../api/judges";
import { fetchSchools, type School } from "../../api/schools";
import "../../layout/dashboard.css";

const emptyForm = (): Omit<Judge, "judge_id" | "created_at" | "school_name"> => ({
    first_name: "",
    surname: "",
    school_id: null,
    email: "",
    phone_no: "",
    date_of_birth: "",
    role: "",
});

// ─── Judge Modal ──────────────────────────────────────────────
function JudgeModal({ judge, onClose, onSaved }: {
    judge: Judge | null;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [form, setForm] = useState(judge ? { ...judge } : emptyForm());
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [schools, setSchools] = useState<School[]>([]);
    const [loadingSchools, setLoadingSchools] = useState(true);
    const isEdit = !!judge;

    useEffect(() => {
        fetchSchools({})
            .then(setSchools)
            .catch(() => setError("Could not load schools"))
            .finally(() => setLoadingSchools(false));
    }, []);

    const set = (field: string, value: any) =>
        setForm(f => ({ ...f, [field]: value === "" ? null : value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.first_name.trim() || !form.surname.trim()) {
            setError("First name and surname are required.");
            return;
        }
        setSaving(true);
        setError("");
        try {
            const payload = {
                first_name: form.first_name,
                surname: form.surname,
                school_id: form.school_id ? Number(form.school_id) : null,
                email: form.email,
                phone_no: form.phone_no,
                date_of_birth: form.date_of_birth,
                role: form.role,
            };
            if (isEdit) await updateJudge(judge.judge_id, payload);
            else await createJudge(payload);
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
                    <h2 className="tdm-title">{isEdit ? "Edit Judge" : "New Judge"}</h2>
                    <button className="tdm-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit} className="tdm-form">
                    <div className="tdm-row">
                        <div className="tdm-field">
                            <label className="tdm-label">First Name *</label>
                            <input className="tdm-input" value={form.first_name} onChange={e => set("first_name", e.target.value)} placeholder="Jane" />
                        </div>
                        <div className="tdm-field">
                            <label className="tdm-label">Surname *</label>
                            <input className="tdm-input" value={form.surname} onChange={e => set("surname", e.target.value)} placeholder="Smith" />
                        </div>
                    </div>
                    <div className="tdm-row">
                        <div className="tdm-field">
                            <label className="tdm-label">Email</label>
                            <input className="tdm-input" type="email" value={form.email ?? ""} onChange={e => set("email", e.target.value)} placeholder="judge@example.com" />
                        </div>
                        <div className="tdm-field">
                            <label className="tdm-label">Phone</label>
                            <input className="tdm-input" value={form.phone_no ?? ""} onChange={e => set("phone_no", e.target.value)} placeholder="+27 12 345 6789" />
                        </div>
                    </div>
                    <div className="tdm-row">
                        <div className="tdm-field">
                            <label className="tdm-label">Date of Birth</label>
                            <input type="date" className="tdm-input" value={form.date_of_birth ?? ""} onChange={e => set("date_of_birth", e.target.value)} />
                        </div>
                        <div className="tdm-field">
                            <label className="tdm-label">Role</label>
                            <select className="tdm-input" value={form.role ?? ""} onChange={e => set("role", e.target.value)}>
                                <option value="">-- Select Role --</option>
                                <option value="Senior Judge">Senior Judge</option>
                                <option value="Junior Judge">Junior Judge</option>
                                <option value="Lead Judge">Lead Judge</option>
                            </select>
                        </div>
                    </div>
                    <div className="tdm-field">
                        <label className="tdm-label">School (optional)</label>
                        <select className="tdm-input" value={form.school_id ?? ""} onChange={e => set("school_id", e.target.value ? Number(e.target.value) : null)} disabled={loadingSchools}>
                            <option value="">-- Select School --</option>
                            {schools.map(school => (
                                <option key={school.school_id} value={school.school_id}>{school.school_name}</option>
                            ))}
                        </select>
                    </div>
                    {error && <p className="tdm-error">{error}</p>}
                    <div className="tdm-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? <span className="spinner-sm" /> : isEdit ? "Save Changes" : "Create Judge"}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}

// ─── Delete Confirm ───────────────────────────────────────────
function DeleteConfirm({ judge, onClose, onDeleted }: {
    judge: Judge;
    onClose: () => void;
    onDeleted: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const confirm = async () => {
        setLoading(true);
        try { await deleteJudge(judge.judge_id); onDeleted(); }
        catch { setLoading(false); }
    };
    return createPortal(
        <div className="tdm-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="tdm-box tdm-box-sm">
                <div className="tdm-head">
                    <h2 className="tdm-title">Delete Judge</h2>
                    <button className="tdm-close" onClick={onClose}>×</button>
                </div>
                <p className="tdm-delete-msg">
                    Delete <strong>{judge.first_name} {judge.surname}</strong>? This action cannot be undone.
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
export default function JudgesDashboard() {
    const [judges, setJudges] = useState<Judge[]>([]);
    const [filterOptions, setFilterOptions] = useState<JudgeFilterOptions>({ schools: [], roles: [] });
    const [filters, setFilters] = useState<JudgeFilters>({});
    const [loading, setLoading] = useState(true);
    const [editJudge, setEditJudge] = useState<Judge | null | "new">(null);
    const [deleteTarget, setDeleteTarget] = useState<Judge | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchJudges(filters);
            setJudges(data);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => {
        fetchJudgeFilterOptions().then(setFilterOptions).catch(() => { });
    }, []);

    const setFilter = (key: keyof JudgeFilters, value: string) =>
        setFilters(f => ({ ...f, [key]: value || undefined }));
    const clearFilters = () => setFilters({});
    const activeFilterCount = Object.values(filters).filter(Boolean).length;

    return (
        <div className="td-root">
            <div className="td-header">
                <div>
                    <h1 className="td-title">Judges</h1>
                    <p className="td-subtitle">{judges.length} judge{judges.length !== 1 ? "s" : ""} found</p>
                </div>
                <button className="btn-primary" onClick={() => setEditJudge("new")}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    New Judge
                </button>
            </div>

            <div className="td-filters">
                <div className="filter-search">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input type="text" placeholder="Search name, email…" value={filters.search ?? ""} onChange={e => setFilter("search", e.target.value)} />
                </div>
                <select value={filters.school_id ?? ""} onChange={e => setFilter("school_id", e.target.value)}>
                    <option value="">All Schools</option>
                    {filterOptions.schools.map(s => <option key={s.school_id} value={s.school_id}>{s.school_name}</option>)}
                </select>
                <select value={filters.role ?? ""} onChange={e => setFilter("role", e.target.value)}>
                    <option value="">All Roles</option>
                    {filterOptions.roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                {activeFilterCount > 0 && (
                    <button className="btn-clear" onClick={clearFilters}>Clear ({activeFilterCount})</button>
                )}
            </div>

            <div className="td-table-wrap">
                {loading ? (
                    <div className="td-loading"><span className="spinner-lg" /></div>
                ) : judges.length === 0 ? (
                    <div className="td-empty">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <p>No judges found</p>
                        {activeFilterCount > 0 && <button className="btn-clear" onClick={clearFilters}>Clear filters</button>}
                    </div>
                ) : (
                    <table className="td-table">
                        <thead>
                            <tr>
                                <th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>School</th><th>Role</th><th>Created</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {judges.map(judge => (
                                <tr key={judge.judge_id}>
                                    <td className="td-id">#{judge.judge_id}</td>
                                    <td className="td-name"><strong>{judge.first_name} {judge.surname}</strong><br />{judge.date_of_birth ? new Date(judge.date_of_birth).toLocaleDateString() : ""}</td>
                                    <td>{judge.email ?? <span className="td-null">—</span>}</td>
                                    <td>{judge.phone_no ?? <span className="td-null">—</span>}</td>
                                    <td>{judge.school_name ?? <span className="td-null">—</span>}</td>
                                    <td>{judge.role ?? <span className="td-null">—</span>}</td>
                                    <td className="td-date">{new Date(judge.created_at).toLocaleDateString()}</td>
                                    <td className="td-actions">
                                        <button className="btn-icon edit" onClick={() => setEditJudge(judge)} title="Edit">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                        </button>
                                        <button className="btn-icon delete" onClick={() => setDeleteTarget(judge)} title="Delete">
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

            {editJudge !== null && (
                <JudgeModal
                    judge={editJudge === "new" ? null : editJudge}
                    onClose={() => setEditJudge(null)}
                    onSaved={() => { setEditJudge(null); load(); }}
                />
            )}
            {deleteTarget && (
                <DeleteConfirm
                    judge={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onDeleted={() => { setDeleteTarget(null); load(); }}
                />
            )}
        </div>
    );
}