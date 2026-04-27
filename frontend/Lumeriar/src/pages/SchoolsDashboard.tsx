// SchoolsDashboard.tsx
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

// ─── API functions (inline for now, but move to api/schools.ts if preferred) ───
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function authHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function handleResponse(res: Response) {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
}

export interface School {
    school_id: number;
    school_name: string;
    best_score: number | null;
    avg_score: number | null;
    province: string;
    created_at: string;
    no_teams: number;
}

export interface SchoolFilters {
    search?: string;
    province?: string;
}

export interface SchoolFilterOptions {
    provinces: string[];
}

async function fetchSchools(filters: SchoolFilters = {}): Promise<School[]> {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.province) params.set("province", filters.province);
    const res = await fetch(`${API_BASE}/api/schools?${params}`, { headers: authHeaders() });
    return handleResponse(res);
}

async function fetchSchoolFilterOptions(): Promise<SchoolFilterOptions> {
    const res = await fetch(`${API_BASE}/api/schools/filter-options`, { headers: authHeaders() });
    return handleResponse(res);
}

async function createSchool(data: Omit<School, "school_id" | "created_at">) {
    const res = await fetch(`${API_BASE}/api/schools`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
}

async function updateSchool(id: number, data: Partial<School>) {
    const res = await fetch(`${API_BASE}/api/schools/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
}

async function deleteSchool(id: number) {
    const res = await fetch(`${API_BASE}/api/schools/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
    return handleResponse(res);
}

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

            {/* Reuse the same styles as TeamsDashboard – they already work */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .td-root { padding: 32px; min-height: 100vh; background: #0d1117; font-family: 'DM Sans', sans-serif; color: #e2e8f0; }
        .td-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; }
        .td-title { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: #f1f5f9; margin: 0 0 4px; }
        .td-subtitle { font-size: 13px; color: #475569; margin: 0; }

        .btn-primary { display: flex; align-items: center; gap: 6px; background: linear-gradient(135deg, #3b82f6, #6366f1); border: none; border-radius: 8px; padding: 10px 18px; font-size: 14px; font-weight: 500; font-family: 'DM Sans', sans-serif; color: #fff; cursor: pointer; transition: opacity .2s, transform .15s; box-shadow: 0 4px 14px rgba(99,102,241,.3); }
        .btn-primary:hover { opacity: .9; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: .6; cursor: not-allowed; transform: none; }
        .btn-secondary { background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1); border-radius: 8px; padding: 10px 18px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #94a3b8; cursor: pointer; transition: background .2s; }
        .btn-secondary:hover { background: rgba(255,255,255,.1); }
        .btn-danger { background: rgba(239,68,68,.15); border: 1px solid rgba(239,68,68,.3); border-radius: 8px; padding: 10px 18px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #f87171; cursor: pointer; transition: background .2s; }
        .btn-danger:hover { background: rgba(239,68,68,.25); }
        .btn-clear { background: none; border: 1px solid rgba(255,255,255,.12); border-radius: 6px; padding: 8px 14px; font-size: 13px; color: #64748b; cursor: pointer; transition: color .2s, border-color .2s; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
        .btn-clear:hover { color: #94a3b8; border-color: rgba(255,255,255,.2); }
        .btn-icon { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; transition: background .15s, color .15s; display: flex; align-items: center; }
        .btn-icon.edit { color: #60a5fa; }
        .btn-icon.edit:hover { background: rgba(96,165,250,.12); }
        .btn-icon.delete { color: #f87171; }
        .btn-icon.delete:hover { background: rgba(248,113,113,.12); }

        .td-filters { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }
        .filter-search { position: relative; flex: 1; min-width: 200px; }
        .filter-search svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #475569; pointer-events: none; }
        .filter-search input { width: 100%; padding: 9px 12px 9px 36px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1); border-radius: 8px; font-size: 13px; color: #e2e8f0; font-family: 'DM Sans', sans-serif; outline: none; transition: border-color .2s; }
        .filter-search input:focus { border-color: #3b82f6; }
        .filter-search input::placeholder { color: #334155; }
        .td-filters select { padding: 9px 12px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1); border-radius: 8px; font-size: 13px; color: #94a3b8; font-family: 'DM Sans', sans-serif; outline: none; cursor: pointer; }

        .td-table-wrap { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.08); border-radius: 12px; overflow: hidden; }
        .td-table { width: 100%; border-collapse: collapse; }
        .td-table th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 500; color: #475569; letter-spacing: .07em; text-transform: uppercase; background: rgba(255,255,255,.02); border-bottom: 1px solid rgba(255,255,255,.07); }
        .td-table td { padding: 13px 16px; font-size: 13px; color: #cbd5e1; border-bottom: 1px solid rgba(255,255,255,.05); }
        .td-table tr:last-child td { border-bottom: none; }
        .td-table tr:hover td { background: rgba(255,255,255,.025); }
        .td-id { color: #475569 !important; font-size: 12px !important; }
        .td-name { color: #f1f5f9 !important; font-weight: 500; }
        .td-theme { max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .td-date { color: #64748b !important; font-size: 12px !important; }
        .td-null { color: #334155 !important; }
        .td-actions { display: flex; gap: 4px; }
        .badge { display: inline-block; padding: 3px 10px; background: rgba(99,102,241,.15); border: 1px solid rgba(99,102,241,.3); border-radius: 20px; font-size: 11px; color: #a5b4fc; font-weight: 500; }

        .td-loading, .td-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 64px; color: #475569; }
        .td-empty p { font-size: 14px; margin: 0; }

        /* ── Modals — prefixed tdm- to avoid Bootstrap class collisions ── */
        .tdm-backdrop {
          position: fixed !important;
          inset: 0 !important;
          z-index: 9999 !important;
          background: rgba(0,0,0,.75) !important;
          backdrop-filter: blur(4px);
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 24px 16px !important;
          margin: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
        }
        .tdm-box {
          background: #131920 !important;
          border: 1px solid rgba(255,255,255,.1) !important;
          border-radius: 16px !important;
          padding: 28px !important;
          width: 100% !important;
          max-width: 540px !important;
          max-height: 85vh !important;
          overflow-y: auto !important;
          box-shadow: 0 24px 64px rgba(0,0,0,.6) !important;
          font-family: 'DM Sans', sans-serif;
          color: #e2e8f0;
          /* hard-reset anything Bootstrap might try to apply */
          position: relative !important;
          display: block !important;
          height: auto !important;
          min-height: unset !important;
          transform: none !important;
          transition: none;
        }
        .tdm-box-sm { max-width: 400px !important; }
        .tdm-head { display: flex !important; align-items: center !important; justify-content: space-between !important; margin-bottom: 24px !important; padding: 0 !important; border: none !important; border-radius: 0 !important; }
        .tdm-title { font-family: 'Syne', sans-serif !important; font-size: 18px !important; font-weight: 700 !important; color: #f1f5f9 !important; margin: 0 !important; padding: 0 !important; border: none !important; }
        .tdm-close { background: none !important; border: none !important; color: #475569 !important; font-size: 22px !important; cursor: pointer !important; line-height: 1 !important; padding: 2px 6px !important; border-radius: 4px !important; box-shadow: none !important; }
        .tdm-close:hover { color: #94a3b8 !important; }
        .tdm-form { display: flex !important; flex-direction: column !important; gap: 16px !important; }
        .tdm-row { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 14px !important; }
        .tdm-field { display: flex !important; flex-direction: column !important; gap: 6px !important; margin: 0 !important; }
        .tdm-label { font-size: 11px !important; font-weight: 500 !important; color: #64748b !important; letter-spacing: .06em !important; text-transform: uppercase !important; margin: 0 !important; padding: 0 !important; }
        .tdm-input { background: rgba(255,255,255,.05) !important; border: 1px solid rgba(255,255,255,.1) !important; border-radius: 8px !important; padding: 10px 12px !important; font-size: 13px !important; color: #e2e8f0 !important; font-family: 'DM Sans', sans-serif !important; outline: none !important; resize: vertical; width: 100% !important; box-shadow: none !important; }
        .tdm-input:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,.12) !important; }
        .tdm-input::placeholder { color: #334155 !important; }
        .tdm-error { font-size: 13px; color: #f87171; background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.2); border-radius: 6px; padding: 8px 12px; margin: 0; }
        .tdm-actions { display: flex !important; justify-content: flex-end !important; gap: 10px !important; margin-top: 8px !important; padding: 0 !important; border: none !important; }
        .tdm-delete-msg { font-size: 14px; color: #94a3b8; margin: 0 0 24px; line-height: 1.6; }
        .tdm-delete-msg strong { color: #f1f5f9; }

        .team-link {
  color: #60a5fa;
  text-decoration: none;
  font-weight: 500;
}
.team-link:hover {
  text-decoration: underline;
}

        .spinner-sm { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: tdspin .6s linear infinite; }
        .spinner-lg { display: inline-block; width: 32px; height: 32px; border: 3px solid rgba(99,102,241,.2); border-top-color: #6366f1; border-radius: 50%; animation: tdspin .7s linear infinite; }
        @keyframes tdspin { to { transform: rotate(360deg); } }

        @media (max-width: 640px) {
          .td-root { padding: 16px; }
          .tdm-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
        </div>
    );
}