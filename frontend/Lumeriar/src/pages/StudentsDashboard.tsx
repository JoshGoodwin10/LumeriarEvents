// StudentsDashboard.tsx
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

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

// ─── Types ────────────────────────────────────────────────────
export interface Student {
    student_id: number;
    first_name: string;
    surname: string;
    date_of_birth: string | null;
    team_id: number | null;
    created_at: string;
    grade: number | null;
    role: string | null;
    shirt_size: string | null;
    dietary_requirements: string | null;
    // joined from Team table (not stored in Student)
    team_name?: string;
}

export interface StudentFilters {
    search?: string;
    team_id?: string;
    grade?: string;
    role?: string;
}

export interface StudentFilterOptions {
    teams: { team_id: number; team_name: string }[];
    grades: number[];
    roles: string[];
}

// ─── API functions ────────────────────────────────────────────
async function fetchStudents(filters: StudentFilters = {}): Promise<Student[]> {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.team_id) params.set("team_id", filters.team_id);
    if (filters.grade) params.set("grade", filters.grade);
    if (filters.role) params.set("role", filters.role);

    const res = await fetch(`${API_BASE}/api/students?${params}`, { headers: authHeaders() });
    return handleResponse(res);
}

async function fetchStudentFilterOptions(): Promise<StudentFilterOptions> {
    const res = await fetch(`${API_BASE}/api/students/filter-options`, { headers: authHeaders() });
    return handleResponse(res);
}

async function createStudent(data: Omit<Student, "student_id" | "created_at" | "team_name">) {
    const res = await fetch(`${API_BASE}/api/students`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
}

async function updateStudent(id: number, data: Partial<Omit<Student, "student_id" | "created_at" | "team_name">>) {
    const res = await fetch(`${API_BASE}/api/students/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
}

async function deleteStudent(id: number) {
    const res = await fetch(`${API_BASE}/api/students/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
    return handleResponse(res);
}

// ─── Empty form state ─────────────────────────────────────────
const emptyForm = (): Omit<Student, "student_id" | "created_at" | "team_name"> => ({
    first_name: "",
    surname: "",
    date_of_birth: null,
    team_id: null,
    grade: null,
    role: null,
    shirt_size: null,
    dietary_requirements: null,
});

// ─── Student Modal ────────────────────────────────────────────
function StudentModal({ student, onClose, onSaved }: {
    student: Student | null;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [form, setForm] = useState(student ? { ...student } : emptyForm());
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [teams, setTeams] = useState<{ team_id: number; team_name: string }[]>([]);
    const [loadingTeams, setLoadingTeams] = useState(true);
    const isEdit = !!student;

    useEffect(() => {
        async function loadTeams() {
            try {
                const res = await fetch(`${API_BASE}/api/teams`, { headers: authHeaders() });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message);
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
                date_of_birth: form.date_of_birth || null,
                team_id: form.team_id ? Number(form.team_id) : null,
                grade: form.grade ? Number(form.grade) : null,
                role: form.role || null,
                shirt_size: form.shirt_size || null,
                dietary_requirements: form.dietary_requirements || null,
            };
            if (isEdit) await updateStudent(student.student_id, payload);
            else await createStudent(payload);
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
                    <h2 className="tdm-title">{isEdit ? "Edit Student" : "New Student"}</h2>
                    <button className="tdm-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit} className="tdm-form">
                    <div className="tdm-row">
                        <div className="tdm-field">
                            <label className="tdm-label">First Name *</label>
                            <input className="tdm-input" value={form.first_name ?? ""} onChange={e => set("first_name", e.target.value)} placeholder="John" />
                        </div>
                        <div className="tdm-field">
                            <label className="tdm-label">Surname *</label>
                            <input className="tdm-input" value={form.surname ?? ""} onChange={e => set("surname", e.target.value)} placeholder="Doe" />
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
                    <div className="tdm-row">
                        <div className="tdm-field">
                            <label className="tdm-label">Grade</label>
                            <input className="tdm-input" type="number" value={form.grade ?? ""} onChange={e => set("grade", e.target.value)} placeholder="10" />
                        </div>
                        <div className="tdm-field">
                            <label className="tdm-label">Role</label>
                            <input className="tdm-input" value={form.role ?? ""} onChange={e => set("role", e.target.value)} placeholder="Captain" />
                        </div>
                    </div>
                    <div className="tdm-row">
                        <div className="tdm-field">
                            <label className="tdm-label">Shirt Size</label>
                            <input className="tdm-input" value={form.shirt_size ?? ""} onChange={e => set("shirt_size", e.target.value)} placeholder="M" />
                        </div>
                        <div className="tdm-field">
                            <label className="tdm-label">Dietary Requirements</label>
                            <input className="tdm-input" value={form.dietary_requirements ?? ""} onChange={e => set("dietary_requirements", e.target.value)} placeholder="Vegetarian" />
                        </div>
                    </div>
                    {error && <p className="tdm-error">{error}</p>}
                    <div className="tdm-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? <span className="spinner-sm" /> : isEdit ? "Save Changes" : "Create Student"}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}

// ─── Delete Confirm ───────────────────────────────────────────
function DeleteConfirm({ student, onClose, onDeleted }: {
    student: Student;
    onClose: () => void;
    onDeleted: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const confirm = async () => {
        setLoading(true);
        try { await deleteStudent(student.student_id); onDeleted(); }
        catch { setLoading(false); }
    };
    return createPortal(
        <div className="tdm-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="tdm-box tdm-box-sm">
                <div className="tdm-head">
                    <h2 className="tdm-title">Delete Student</h2>
                    <button className="tdm-close" onClick={onClose}>×</button>
                </div>
                <p className="tdm-delete-msg">
                    Delete <strong>{student.first_name} {student.surname}</strong>? This action cannot be undone.
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
export default function StudentsDashboard() {
    const [students, setStudents] = useState<Student[]>([]);
    const [filterOptions, setFilterOptions] = useState<StudentFilterOptions>({ teams: [], grades: [], roles: [] });
    const [filters, setFilters] = useState<StudentFilters>({});
    const [loading, setLoading] = useState(true);
    const [editStudent, setEditStudent] = useState<Student | null | "new">(null);
    const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try { const data = await fetchStudents(filters); setStudents(data); }
        finally { setLoading(false); }
    }, [filters]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => { fetchStudentFilterOptions().then(setFilterOptions).catch(() => { }); }, []);

    const setFilter = (key: keyof StudentFilters, value: string) =>
        setFilters(f => ({ ...f, [key]: value || undefined }));
    const clearFilters = () => setFilters({});
    const activeFilterCount = Object.values(filters).filter(Boolean).length;

    return (
        <div className="td-root">
            <div className="td-header">
                <div>
                    <h1 className="td-title">Students</h1>
                    <p className="td-subtitle">{students.length} student{students.length !== 1 ? "s" : ""} found</p>
                </div>
                <button className="btn-primary" onClick={() => setEditStudent("new")}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    New Student
                </button>
            </div>

            <div className="td-filters">
                <div className="filter-search">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input type="text" placeholder="Search name, role…" value={filters.search ?? ""} onChange={e => setFilter("search", e.target.value)} />
                </div>
                <select value={filters.team_id ?? ""} onChange={e => setFilter("team_id", e.target.value)}>
                    <option value="">All Teams</option>
                    {filterOptions.teams.map(t => <option key={t.team_id} value={t.team_id}>{t.team_name}</option>)}
                </select>
                <select value={filters.grade ?? ""} onChange={e => setFilter("grade", e.target.value)}>
                    <option value="">All Grades</option>
                    {filterOptions.grades.map(g => <option key={g} value={g}>{g}</option>)}
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
                ) : students.length === 0 ? (
                    <div className="td-empty">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                        </svg>
                        <p>No students found</p>
                        {activeFilterCount > 0 && <button className="btn-clear" onClick={clearFilters}>Clear filters</button>}
                    </div>
                ) : (
                    <table className="td-table">
                        <thead>
                            <tr>
                                <th>ID</th><th>Name</th><th>Team</th><th>Grade</th><th>Role</th>
                                <th>Shirt</th><th>Dietary</th><th>Created</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(s => (
                                <tr key={s.student_id}>
                                    <td className="td-id">#{s.student_id}</td>
                                    <td className="td-name"><strong>{s.first_name} {s.surname}</strong><br /><span className="td-sub">{s.date_of_birth ? new Date(s.date_of_birth).toLocaleDateString() : "—"}</span></td>
                                    <td>{s.team_name ?? <span className="td-null">—</span>}</td>
                                    <td>{s.grade ?? <span className="td-null">—</span>}</td>
                                    <td>{s.role ?? <span className="td-null">—</span>}</td>
                                    <td>{s.shirt_size ?? <span className="td-null">—</span>}</td>
                                    <td className="td-dietary">{s.dietary_requirements ?? <span className="td-null">—</span>}</td>
                                    <td className="td-date">{new Date(s.created_at).toLocaleDateString()}</td>
                                    <td className="td-actions">
                                        <button className="btn-icon edit" onClick={() => setEditStudent(s)} title="Edit">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                        </button>
                                        <button className="btn-icon delete" onClick={() => setDeleteTarget(s)} title="Delete">
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

            {editStudent !== null && (
                <StudentModal
                    student={editStudent === "new" ? null : editStudent}
                    onClose={() => setEditStudent(null)}
                    onSaved={() => { setEditStudent(null); load(); }}
                />
            )}
            {deleteTarget && (
                <DeleteConfirm
                    student={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onDeleted={() => { setDeleteTarget(null); load(); }}
                />
            )}

            {/* The styles are already provided by the global Dashboard.css or TeamsDashboard styles.
           If missing, copy the <style> block from TeamsDashboard – it uses the same classes */}
        </div>
    );
}