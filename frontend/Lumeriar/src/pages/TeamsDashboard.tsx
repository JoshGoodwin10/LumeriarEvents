import { useState, useEffect, useCallback } from "react";
import {
  fetchTeams, fetchFilterOptions, createTeam, updateTeam, deleteTeam,
  type Team, type TeamFilters, type FilterOptions,
} from "../api/teams";

// ─── Empty form state ─────────────────────────────────────────
const emptyForm = (): Omit<Team, "team_id" | "created_at"> => ({
  team_name: "", category: "", school_id: null, year: null,
  theme: "", project_description: "",
});

// ─── Modal ────────────────────────────────────────────────────
function TeamModal({
  team, onClose, onSaved,
}: {
  team: Team | null;           // null = create mode
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(team ? { ...team } : emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEdit = !!team;

  const set = (field: string, value: any) =>
    setForm(f => ({ ...f, [field]: value === "" ? null : value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.team_name.trim()) { setError("Team name is required."); return; }
    setSaving(true); setError("");
    try {
      const payload = {
        team_name: form.team_name,
        category: form.category || null,
        school_id: form.school_id ? Number(form.school_id) : null,
        year: form.year ? Number(form.year) : null,
        theme: form.theme || null,
        project_description: form.project_description || null,
      };
      if (isEdit) await updateTeam(team.team_id, payload);
      else await createTeam(payload);
      onSaved();
    } catch (err: any) {
      setError(err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2>{isEdit ? "Edit Team" : "New Team"}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-field">
              <label>Team Name *</label>
              <input value={form.team_name ?? ""} onChange={e => set("team_name", e.target.value)} placeholder="Team Alpha" />
            </div>
            <div className="form-field">
              <label>Category</label>
              <input value={form.category ?? ""} onChange={e => set("category", e.target.value)} placeholder="Advanced" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>School ID</label>
              <input type="number" value={form.school_id ?? ""} onChange={e => set("school_id", e.target.value)} placeholder="1" />
            </div>
            <div className="form-field">
              <label>Year</label>
              <input type="number" value={form.year ?? ""} onChange={e => set("year", e.target.value)} placeholder="2025" />
            </div>
          </div>

          <div className="form-field">
            <label>Theme</label>
            <input value={form.theme ?? ""} onChange={e => set("theme", e.target.value)} placeholder="Sustainable Energy" />
          </div>

          <div className="form-field">
            <label>Project Description</label>
            <textarea
              value={form.project_description ?? ""}
              onChange={e => set("project_description", e.target.value)}
              rows={4}
              placeholder="Describe the team's project..."
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <span className="spinner-sm" /> : isEdit ? "Save Changes" : "Create Team"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────
function DeleteConfirm({ team, onClose, onDeleted }: { team: Team; onClose: () => void; onDeleted: () => void; }) {
  const [loading, setLoading] = useState(false);

  const confirm = async () => {
    setLoading(true);
    try { await deleteTeam(team.team_id); onDeleted(); }
    catch { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-sm">
        <div className="modal-header">
          <h2>Delete Team</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <p className="delete-msg">
          Are you sure you want to delete <strong>{team.team_name}</strong>? This cannot be undone.
        </p>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-danger" onClick={confirm} disabled={loading}>
            {loading ? <span className="spinner-sm" /> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function TeamsDashboard() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ categories: [], years: [], school_ids: [] });
  const [filters, setFilters] = useState<TeamFilters>({});
  const [loading, setLoading] = useState(true);
  const [editTeam, setEditTeam] = useState<Team | null | "new">(null);
  const [deleteTarget, setDeleteTarget] = useState<Team | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTeams(filters);
      setTeams(data);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    fetchFilterOptions().then(setFilterOptions).catch(() => { });
  }, []);

  const setFilter = (key: keyof TeamFilters, value: string) =>
    setFilters(f => ({ ...f, [key]: value || undefined }));

  const clearFilters = () => setFilters({});

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="td-root">
      {/* ── Header ── */}
      <div className="td-header">
        <div>
          <h1 className="td-title">Teams</h1>
          <p className="td-subtitle">{teams.length} team{teams.length !== 1 ? "s" : ""} found</p>
        </div>
        <button className="btn-primary" onClick={() => setEditTeam("new")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Team
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="td-filters">
        <div className="filter-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search name, theme, description…"
            value={filters.search ?? ""}
            onChange={e => setFilter("search", e.target.value)}
          />
        </div>

        <select value={filters.category ?? ""} onChange={e => setFilter("category", e.target.value)}>
          <option value="">All Categories</option>
          {filterOptions.categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select value={filters.school_id ?? ""} onChange={e => setFilter("school_id", e.target.value)}>
          <option value="">All Schools</option>
          {filterOptions.school_ids.map(id => <option key={id} value={id}>School {id}</option>)}
        </select>

        <select value={filters.year ?? ""} onChange={e => setFilter("year", e.target.value)}>
          <option value="">All Years</option>
          {filterOptions.years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        {activeFilterCount > 0 && (
          <button className="btn-clear" onClick={clearFilters}>
            Clear ({activeFilterCount})
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="td-table-wrap">
        {loading ? (
          <div className="td-loading"><span className="spinner-lg" /></div>
        ) : teams.length === 0 ? (
          <div className="td-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <p>No teams found</p>
            {activeFilterCount > 0 && <button className="btn-clear" onClick={clearFilters}>Clear filters</button>}
          </div>
        ) : (
          <table className="td-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Team Name</th>
                <th>Category</th>
                <th>School ID</th>
                <th>Year</th>
                <th>Theme</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teams.map(team => (
                <tr key={team.team_id}>
                  <td className="td-id">#{team.team_id}</td>
                  <td className="td-name">{team.team_name}</td>
                  <td>{team.category
                    ? <span className="badge">{team.category}</span>
                    : <span className="td-null">—</span>}
                  </td>
                  <td>{team.school_id ?? <span className="td-null">—</span>}</td>
                  <td>{team.year ?? <span className="td-null">—</span>}</td>
                  <td className="td-theme">{team.theme ?? <span className="td-null">—</span>}</td>
                  <td className="td-date">{new Date(team.created_at).toLocaleDateString()}</td>
                  <td className="td-actions">
                    <button className="btn-icon edit" onClick={() => setEditTeam(team)} title="Edit">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button className="btn-icon delete" onClick={() => setDeleteTarget(team)} title="Delete">
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

      {/* ── Modals ── */}
      {editTeam !== null && (
        <TeamModal
          team={editTeam === "new" ? null : editTeam}
          onClose={() => setEditTeam(null)}
          onSaved={() => { setEditTeam(null); load(); }}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          team={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => { setDeleteTarget(null); load(); }}
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .td-root {
          padding: 32px;
          min-height: 100vh;
          background: #0d1117;
          font-family: 'DM Sans', sans-serif;
          color: #e2e8f0;
        }

        /* ── Header ── */
        .td-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: 28px;
        }
        .td-title {
          font-family: 'Syne', sans-serif;
          font-size: 28px; font-weight: 800;
          color: #f1f5f9; margin: 0 0 4px;
        }
        .td-subtitle { font-size: 13px; color: #475569; margin: 0; }

        /* ── Buttons ── */
        .btn-primary {
          display: flex; align-items: center; gap: 6px;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          border: none; border-radius: 8px;
          padding: 10px 18px; font-size: 14px; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          color: #fff; cursor: pointer;
          transition: opacity .2s, transform .15s;
          box-shadow: 0 4px 14px rgba(99,102,241,.3);
        }
        .btn-primary:hover { opacity: .9; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: .6; cursor: not-allowed; transform: none; }

        .btn-secondary {
          background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
          border-radius: 8px; padding: 10px 18px;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: #94a3b8; cursor: pointer;
          transition: background .2s;
        }
        .btn-secondary:hover { background: rgba(255,255,255,.1); }

        .btn-danger {
          background: rgba(239,68,68,.15); border: 1px solid rgba(239,68,68,.3);
          border-radius: 8px; padding: 10px 18px;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: #f87171; cursor: pointer;
          transition: background .2s;
        }
        .btn-danger:hover { background: rgba(239,68,68,.25); }

        .btn-clear {
          background: none; border: 1px solid rgba(255,255,255,.12);
          border-radius: 6px; padding: 8px 14px;
          font-size: 13px; color: #64748b; cursor: pointer;
          transition: color .2s, border-color .2s;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
        }
        .btn-clear:hover { color: #94a3b8; border-color: rgba(255,255,255,.2); }

        .btn-icon {
          background: none; border: none; cursor: pointer;
          padding: 6px; border-radius: 6px;
          transition: background .15s, color .15s;
          display: flex; align-items: center;
        }
        .btn-icon.edit  { color: #60a5fa; }
        .btn-icon.edit:hover  { background: rgba(96,165,250,.12); }
        .btn-icon.delete { color: #f87171; }
        .btn-icon.delete:hover { background: rgba(248,113,113,.12); }

        /* ── Filters ── */
        .td-filters {
          display: flex; flex-wrap: wrap; gap: 10px;
          margin-bottom: 20px;
        }
        .filter-search {
          position: relative; flex: 1; min-width: 200px;
        }
        .filter-search svg {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          color: #475569; pointer-events: none;
        }
        .filter-search input {
          width: 100%; padding: 9px 12px 9px 36px;
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 8px; font-size: 13px;
          color: #e2e8f0; font-family: 'DM Sans', sans-serif;
          outline: none; transition: border-color .2s;
        }
        .filter-search input:focus { border-color: #3b82f6; }
        .filter-search input::placeholder { color: #334155; }

        .td-filters select {
          padding: 9px 12px;
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 8px; font-size: 13px;
          color: #94a3b8; font-family: 'DM Sans', sans-serif;
          outline: none; cursor: pointer;
          transition: border-color .2s;
        }
        .td-filters select:focus { border-color: #3b82f6; }

        /* ── Table ── */
        .td-table-wrap {
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 12px; overflow: hidden;
        }
        .td-table { width: 100%; border-collapse: collapse; }
        .td-table th {
          padding: 12px 16px; text-align: left;
          font-size: 11px; font-weight: 500;
          color: #475569; letter-spacing: .07em; text-transform: uppercase;
          background: rgba(255,255,255,.02);
          border-bottom: 1px solid rgba(255,255,255,.07);
        }
        .td-table td {
          padding: 13px 16px; font-size: 13px; color: #cbd5e1;
          border-bottom: 1px solid rgba(255,255,255,.05);
        }
        .td-table tr:last-child td { border-bottom: none; }
        .td-table tr:hover td { background: rgba(255,255,255,.025); }

        .td-id   { color: #475569 !important; font-size: 12px !important; }
        .td-name { color: #f1f5f9 !important; font-weight: 500; }
        .td-theme { max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .td-date { color: #64748b !important; font-size: 12px !important; }
        .td-null { color: #334155 !important; }
        .td-actions { display: flex; gap: 4px; }

        .badge {
          display: inline-block; padding: 3px 10px;
          background: rgba(99,102,241,.15);
          border: 1px solid rgba(99,102,241,.3);
          border-radius: 20px; font-size: 11px;
          color: #a5b4fc; font-weight: 500;
        }

        /* ── Empty / Loading ── */
        .td-loading, .td-empty {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 12px; padding: 64px;
          color: #475569;
        }
        .td-empty p { font-size: 14px; margin: 0; }

        /* ── Modal ── */
        .modal-backdrop {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(0,0,0,.7); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
          animation: fadeIn .15s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .modal-box {
          background: #131920;
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 16px; padding: 28px;
          width: 100%; max-width: 540px;
          max-height: 50vh;
          overflow-y: auto;
          box-shadow: 0 24px 64px rgba(0,0,0,.6);
          animation: slideUp .2s cubic-bezier(.22,1,.36,1);
          display: block;          /* override any flex */
          height: auto;           /* no fixed height */
          min-height: 0;          /* prevent unintended stretching */
          justify-content: normal; 
        }

        .modal-sm { max-width: 400px; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .modal-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 24px;
        }
        .modal-header h2 {
          font-family: 'Syne', sans-serif;
          font-size: 18px; font-weight: 700; color: #f1f5f9; margin: 0;
        }
        .modal-close {
          background: none; border: none; color: #475569;
          font-size: 22px; cursor: pointer; line-height: 1;
          padding: 2px 6px; border-radius: 4px;
          transition: color .15s;
        }
        .modal-close:hover { color: #94a3b8; }

        /* ── Form ── */
        .modal-form { display: flex; flex-direction: column; gap: 16px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .form-field { display: flex; flex-direction: column; gap: 6px; }
        .form-field label {
          font-size: 11px; font-weight: 500;
          color: #64748b; letter-spacing: .06em; text-transform: uppercase;
        }
        .form-field input, .form-field textarea {
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 8px; padding: 10px 12px;
          font-size: 13px; color: #e2e8f0;
          font-family: 'DM Sans', sans-serif;
          outline: none; transition: border-color .2s, box-shadow .2s;
          resize: vertical;
        }
        .form-field input:focus, .form-field textarea:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,.12);
        }
        .form-field input::placeholder,
        .form-field textarea::placeholder { color: #334155; }

        .form-error {
          font-size: 13px; color: #f87171;
          background: rgba(239,68,68,.1);
          border: 1px solid rgba(239,68,68,.2);
          border-radius: 6px; padding: 8px 12px; margin: 0;
        }

        .modal-actions {
          display: flex; justify-content: flex-end; gap: 10px;
          margin-top: 4px;
        }

        .delete-msg {
          font-size: 14px; color: #94a3b8; margin: 0 0 24px;
          line-height: 1.6;
        }
        .delete-msg strong { color: #f1f5f9; }

        /* ── Spinners ── */
        .spinner-sm {
          display: inline-block; width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,.3);
          border-top-color: #fff; border-radius: 50%;
          animation: spin .6s linear infinite;
        }
        .spinner-lg {
          display: inline-block; width: 32px; height: 32px;
          border: 3px solid rgba(99,102,241,.2);
          border-top-color: #6366f1; border-radius: 50%;
          animation: spin .7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 640px) {
          .td-root { padding: 16px; }
          .form-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
