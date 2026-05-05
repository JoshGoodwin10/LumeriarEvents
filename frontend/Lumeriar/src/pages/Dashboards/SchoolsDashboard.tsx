// SchoolsDashboard.tsx
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

import {
    fetchSchools,
    fetchSchoolFilterOptions,
    createSchool,
    updateSchool,
    deleteSchool,
    type School,
    type SchoolFilters,
    type SchoolFilterOptions,
} from "../../api/schools";

// import dashboard css
import "../../layout/dashboard.css";

// ─── Empty form state ─────────────────────────────────────────
const emptyForm = (): Omit<School, "school_id" | "created_at"> => ({
    school_name: "",
    best_score: null,
    avg_score: null,
    province: "",
    no_teams: 0,
});

// ─── School Modal (Create/Edit) ───────────────────────────────
function SchoolModal({ school, onClose, onSaved }: {
    school: School | null;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [form, setForm] = useState(school ? { ...school } : emptyForm());
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const isEdit = !!school;

    const set = (field: string, value: any) =>
        setForm(f => ({ ...f, [field]: value === "" ? null : value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.school_name.trim()) { setError("School name is required."); return; }
        setSaving(true); setError("");
        try {
            const payload = {
                school_name: form.school_name,
                best_score: form.best_score ? Number(form.best_score) : null,
                avg_score: form.avg_score ? Number(form.avg_score) : null,
                province: form.province,
                no_teams: form.no_teams ? Number(form.no_teams) : 0,
            };
            if (isEdit) await updateSchool(school.school_id, payload);
            else await createSchool(payload);
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
                    <h2 className="tdm-title">{isEdit ? "Edit School" : "New School"}</h2>
                    <button className="tdm-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit} className="tdm-form">
                    <div className="tdm-field">
                        <label className="tdm-label">School Name *</label>
                        <input className="tdm-input" value={form.school_name ?? ""} onChange={e => set("school_name", e.target.value)} placeholder="Lincoln High" />
                    </div>
                    <div className="tdm-row">
                        <div className="tdm-field">
                            <label className="tdm-label">Province</label>
                            <input className="tdm-input" value={form.province ?? ""} onChange={e => set("province", e.target.value)} placeholder="Western Cape" />
                        </div>
                        <div className="tdm-field">
                            <label className="tdm-label">Best Score</label>
                            <input className="tdm-input" type="number" step="0.01" value={form.best_score ?? ""} onChange={e => set("best_score", e.target.value)} placeholder="95.5" />
                        </div>
                    </div>
                    <div className="tdm-row">
                        <div className="tdm-field">
                            <label className="tdm-label">Average Score</label>
                            <input className="tdm-input" type="number" step="0.01" value={form.avg_score ?? ""} onChange={e => set("avg_score", e.target.value)} placeholder="78.2" />
                        </div>
                        <div className="tdm-field">
                            <label className="tdm-label">Number of Teams</label>
                            <input className="tdm-input" type="number" value={form.no_teams ?? 0} onChange={e => set("no_teams", e.target.value)} placeholder="0" />
                        </div>
                    </div>
                    {error && <p className="tdm-error">{error}</p>}
                    <div className="tdm-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? <span className="spinner-sm" /> : isEdit ? "Save Changes" : "Create School"}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}

// ─── Delete Confirm ───────────────────────────────────────────
function DeleteConfirm({ school, onClose, onDeleted }: {
    school: School;
    onClose: () => void;
    onDeleted: () => void;
}) {
    const [loading, setLoading] = useState(false);

    const confirm = async () => {
        setLoading(true);
        try { await deleteSchool(school.school_id); onDeleted(); }
        catch { setLoading(false); }
    };

    return createPortal(
        <div className="tdm-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="tdm-box tdm-box-sm">
                <div className="tdm-head">
                    <h2 className="tdm-title">Delete School</h2>
                    <button className="tdm-close" onClick={onClose}>×</button>
                </div>
                <p className="tdm-delete-msg">
                    Are you sure you want to delete <strong>{school.school_name}</strong>? This cannot be undone.
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

// ─── Main Page ────────────────────────────────────────────────
export default function SchoolsDashboard() {
    const [schools, setSchools] = useState<School[]>([]);
    const [filterOptions, setFilterOptions] = useState<SchoolFilterOptions>({ provinces: [] });
    const [filters, setFilters] = useState<SchoolFilters>({});
    const [loading, setLoading] = useState(true);
    const [editSchool, setEditSchool] = useState<School | null | "new">(null);
    const [deleteTarget, setDeleteTarget] = useState<School | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try { const data = await fetchSchools(filters); setSchools(data); }
        finally { setLoading(false); }
    }, [filters]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => { fetchSchoolFilterOptions().then(setFilterOptions).catch(() => { }); }, []);

    const setFilter = (key: keyof SchoolFilters, value: string) =>
        setFilters(f => ({ ...f, [key]: value || undefined }));
    const clearFilters = () => setFilters({});
    const activeFilterCount = Object.values(filters).filter(Boolean).length;

    return (
        <div className="td-root">
            <div className="td-header">
                <div>
                    <h1 className="td-title">Schools</h1>
                    <p className="td-subtitle">{schools.length} school{schools.length !== 1 ? "s" : ""} found</p>
                </div>
                <button className="btn-primary" onClick={() => setEditSchool("new")}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    New School
                </button>
            </div>

            <div className="td-filters">
                <div className="filter-search">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input type="text" placeholder="Search school name, province…" value={filters.search ?? ""} onChange={e => setFilter("search", e.target.value)} />
                </div>
                <select value={filters.province ?? ""} onChange={e => setFilter("province", e.target.value)}>
                    <option value="">All Provinces</option>
                    {filterOptions.provinces.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {activeFilterCount > 0 && (
                    <button className="btn-clear" onClick={clearFilters}>Clear ({activeFilterCount})</button>
                )}
            </div>

            <div className="td-table-wrap">
                {loading ? (
                    <div className="td-loading"><span className="spinner-lg" /></div>
                ) : schools.length === 0 ? (
                    <div className="td-empty">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                        <p>No schools found</p>
                        {activeFilterCount > 0 && <button className="btn-clear" onClick={clearFilters}>Clear filters</button>}
                    </div>
                ) : (
                    <table className="td-table">
                        <thead>
                            <tr>
                                <th>ID</th><th>School Name</th><th>Province</th>
                                <th>Best Score</th><th>Avg Score</th><th># Teams</th>
                                <th>Created</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schools.map(school => (
                                <tr key={school.school_id}>
                                    <td className="td-id">#{school.school_id}</td>
                                    <td className="td-name">{school.school_name}</td>
                                    <td>{school.province ?? <span className="td-null">—</span>}</td>
                                    <td>{school.best_score ?? <span className="td-null">—</span>}</td>
                                    <td>{school.avg_score ?? <span className="td-null">—</span>}</td>
                                    <td>{school.no_teams ?? <span className="td-null">—</span>}</td>
                                    <td className="td-date">{new Date(school.created_at).toLocaleDateString()}</td>
                                    <td className="td-actions">
                                        <button className="btn-icon edit" onClick={() => setEditSchool(school)} title="Edit">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                        </button>
                                        <button className="btn-icon delete" onClick={() => setDeleteTarget(school)} title="Delete">
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

            {editSchool !== null && (
                <SchoolModal
                    school={editSchool === "new" ? null : editSchool}
                    onClose={() => setEditSchool(null)}
                    onSaved={() => { setEditSchool(null); load(); }}
                />
            )}
            {deleteTarget && (
                <DeleteConfirm
                    school={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onDeleted={() => { setDeleteTarget(null); load(); }}
                />
            )}
        </div>
    );
}