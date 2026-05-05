import { Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  fetchTeams, fetchFilterOptions, createTeam, updateTeam, deleteTeam,
  type Team, type TeamFilters, type FilterOptions,
} from "../../api/teams";
import "../../layout/dashboard.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── Empty form state (all fields except team_id and created_at) ───
const emptyForm = (): Omit<Team, "team_id" | "created_at"> => ({
  team_name: "",
  category: "",
  school_id: null,
  theme: "",
  project_description: "",
  province: "",
  event: "",
  how_heard: "",
  material_bill: null,
  engineering_plan: null,
  project_report: null,
  engineering_journal: null,
});

// ─── Team Modal (Create / Edit) with file uploads ────────────────
function TeamModal({ team, onClose, onSaved }: {
  team: Team | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(team ? { ...team } : emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [schools, setSchools] = useState<{ school_id: number; school_name: string }[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const isEdit = !!team;

  // File states (store the actual File objects)
  const [materialBillFile, setMaterialBillFile] = useState<File | null>(null);
  const [engineeringPlanFile, setEngineeringPlanFile] = useState<File | null>(null);
  const [projectReportFile, setProjectReportFile] = useState<File | null>(null);
  const [engineeringJournalFile, setEngineeringJournalFile] = useState<File | null>(null);

  // Load schools list when modal opens
  useEffect(() => {
    async function loadSchools() {
      try {
        const res = await fetch(`${API_BASE}/api/schools`, { headers: authHeaders() });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setSchools(data.map((s: any) => ({ school_id: s.school_id, school_name: s.school_name })));
      } catch (err: any) {
        console.error("Failed to load schools", err);
        setError("Could not load school list.");
      } finally {
        setLoadingSchools(false);
      }
    }
    loadSchools();
  }, []);

  const setField = (field: string, value: any) =>
    setForm(f => ({ ...f, [field]: value === "" ? null : value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.team_name.trim()) { setError("Team name is required."); return; }
    setSaving(true);
    setError("");

    const formData = new FormData();
    // Append all text fields
    formData.append("team_name", form.team_name);
    if (form.category) formData.append("category", form.category);
    if (form.school_id) formData.append("school_id", String(form.school_id));
    if (form.theme) formData.append("theme", form.theme);
    if (form.project_description) formData.append("project_description", form.project_description);
    if (form.province) formData.append("province", form.province);
    if (form.event) formData.append("event", form.event);
    if (form.how_heard) formData.append("how_heard", form.how_heard);

    // Append files (only if selected)
    if (materialBillFile) formData.append("material_bill", materialBillFile);
    if (engineeringPlanFile) formData.append("engineering_plan", engineeringPlanFile);
    if (projectReportFile) formData.append("project_report", projectReportFile);
    if (engineeringJournalFile) formData.append("engineering_journal", engineeringJournalFile);

    try {
      if (isEdit) {
        await updateTeam(team.team_id, formData);
      } else {
        await createTeam(formData);
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
      <div className="tdm-box tdm-box-lg">
        <div className="tdm-head">
          <h2 className="tdm-title">{isEdit ? "Edit Team" : "New Team"}</h2>
          <button className="tdm-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="tdm-form">
          {/* Row 1 */}
          <div className="tdm-row">
            <div className="tdm-field">
              <label className="tdm-label">Team Name *</label>
              <input className="tdm-input" value={form.team_name ?? ""} onChange={e => setField("team_name", e.target.value)} />
            </div>
            <div className="tdm-field">
              <label className="tdm-label">Category</label>
              <input className="tdm-input" value={form.category ?? ""} onChange={e => setField("category", e.target.value)} />
            </div>
          </div>
          {/* Row 2 */}
          <div className="tdm-row">
            <div className="tdm-field">
              <label className="tdm-label">School</label>
              <select className="tdm-input" value={form.school_id ?? ""} onChange={e => setField("school_id", e.target.value ? Number(e.target.value) : null)} disabled={loadingSchools}>
                <option value="">Select School</option>
                {schools.map(s => <option key={s.school_id} value={s.school_id}>{s.school_name}</option>)}
              </select>
            </div>
            <div className="tdm-field">
              <label className="tdm-label">Province</label>
              <input className="tdm-input" value={form.province ?? ""} onChange={e => setField("province", e.target.value)} />
            </div>
          </div>
          {/* Row 3 */}
          <div className="tdm-row">
            <div className="tdm-field">
              <label className="tdm-label">Event</label>
              <input className="tdm-input" value={form.event ?? ""} onChange={e => setField("event", e.target.value)} />
            </div>
            <div className="tdm-field">
              <label className="tdm-label">How Heard</label>
              <input className="tdm-input" value={form.how_heard ?? ""} onChange={e => setField("how_heard", e.target.value)} />
            </div>
          </div>
          {/* Theme */}
          <div className="tdm-field">
            <label className="tdm-label">Theme</label>
            <input className="tdm-input" value={form.theme ?? ""} onChange={e => setField("theme", e.target.value)} />
          </div>
          {/* Project Description */}
          <div className="tdm-field">
            <label className="tdm-label">Project Description</label>
            <textarea className="tdm-input" value={form.project_description ?? ""} onChange={e => setField("project_description", e.target.value)} rows={3} />
          </div>

          {/* File upload fields */}
          <div className="tdm-field">
            <label className="tdm-label">Material Bill (PDF, DOC, etc.)</label>
            <input type="file" className="tdm-input" onChange={e => setMaterialBillFile(e.target.files?.[0] || null)} />
            {isEdit && form.material_bill && <p className="tdm-file-hint">Current file exists (upload to replace)</p>}
          </div>
          <div className="tdm-field">
            <label className="tdm-label">Engineering Plan</label>
            <input type="file" className="tdm-input" onChange={e => setEngineeringPlanFile(e.target.files?.[0] || null)} />
            {isEdit && form.engineering_plan && <p className="tdm-file-hint">Current file exists (upload to replace)</p>}
          </div>
          <div className="tdm-field">
            <label className="tdm-label">Project Report</label>
            <input type="file" className="tdm-input" onChange={e => setProjectReportFile(e.target.files?.[0] || null)} />
            {isEdit && form.project_report && <p className="tdm-file-hint">Current file exists (upload to replace)</p>}
          </div>
          <div className="tdm-field">
            <label className="tdm-label">Engineering Journal</label>
            <input type="file" className="tdm-input" onChange={e => setEngineeringJournalFile(e.target.files?.[0] || null)} />
            {isEdit && form.engineering_journal && <p className="tdm-file-hint">Current file exists (upload to replace)</p>}
          </div>

          {error && <p className="tdm-error">{error}</p>}
          <div className="tdm-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <span className="spinner-sm" /> : isEdit ? "Save Changes" : "Create Team"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

// ─── Delete Confirm (unchanged) ────────────────────────────────
function DeleteConfirm({ team, onClose, onDeleted }: {
  team: Team;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const confirm = async () => {
    setLoading(true);
    try { await deleteTeam(team.team_id); onDeleted(); }
    catch { setLoading(false); }
  };
  return createPortal(
    <div className="tdm-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="tdm-box tdm-box-sm">
        <div className="tdm-head">
          <h2 className="tdm-title">Delete Team</h2>
          <button className="tdm-close" onClick={onClose}>×</button>
        </div>
        <p className="tdm-delete-msg">Are you sure you want to delete <strong>{team.team_name}</strong>? This cannot be undone.</p>
        <div className="tdm-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-danger" onClick={confirm} disabled={loading}>{loading ? <span className="spinner-sm" /> : "Delete"}</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Main TeamsDashboard Component ─────────────────────────────
export default function TeamsDashboard() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ categories: [], school_ids: [] });
  const [filters, setFilters] = useState<TeamFilters>({});
  const [loading, setLoading] = useState(true);
  const [editTeam, setEditTeam] = useState<Team | null | "new">(null);
  const [deleteTarget, setDeleteTarget] = useState<Team | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const data = await fetchTeams(filters); setTeams(data); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { fetchFilterOptions().then(setFilterOptions).catch(() => { }); }, []);

  const setFilter = (key: keyof TeamFilters, value: string) =>
    setFilters(f => ({ ...f, [key]: value || undefined }));
  const clearFilters = () => setFilters({});
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="td-root">
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

      <div className="td-filters">
        <div className="filter-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input type="text" placeholder="Search name, theme, description…" value={filters.search ?? ""} onChange={e => setFilter("search", e.target.value)} />
        </div>
        <select value={filters.category ?? ""} onChange={e => setFilter("category", e.target.value)}>
          <option value="">All Categories</option>
          {filterOptions.categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filters.school_id ?? ""} onChange={e => setFilter("school_id", e.target.value)}>
          <option value="">All Schools</option>
          {filterOptions.school_ids.map(id => <option key={id} value={id}>School {id}</option>)}
        </select>
        {activeFilterCount > 0 && (
          <button className="btn-clear" onClick={clearFilters}>Clear ({activeFilterCount})</button>
        )}
      </div>

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
                <th>ID</th><th>Team Name</th><th>Category</th>
                <th>School</th><th>Theme</th>
                <th>Created</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teams.map(team => (
                <tr key={team.team_id}>
                  <td className="td-id">#{team.team_id}</td>
                  <td className="td-name">
                    <Link to={`/teams/${team.team_id}`} className="team-link">{team.team_name}</Link>
                  </td>
                  <td>{team.category ? <span className="badge">{team.category}</span> : <span className="td-null">—</span>}</td>
                  <td>{team.school_name ?? <span className="td-null">—</span>}</td>
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
    </div>
  );
}