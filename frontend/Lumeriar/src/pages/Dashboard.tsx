import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import TeamsDashboard from "./TeamsDashboard";

// ─── Types ────────────────────────────────────────────────────
type School   = { id: string; name: string; district: string; status: string };
type Student  = { id: string; firstName: string; lastName: string; grade: string; team: string };
type Coach    = { id: string; firstName: string; lastName: string; school: string; email: string };
type Event    = { id: string; title: string; date: string; location: string; status: string };
type Judge    = { id: string; firstName: string; lastName: string; expertise: string; assignedTo: string };
type Request  = { id: string; requestType: string; submittedBy: string; status: string; notes: string };

type SectionKey = "Overview" | "Teams" | "Schools" | "Students" | "Coaches" | "Events" | "Judges" | "Requests";

// ─── Seed data ────────────────────────────────────────────────
const seedSchools: School[] = [
  { id: "s1", name: "Lincoln High",  district: "North", status: "Active"  },
  { id: "s2", name: "Sunrise Prep",  district: "East",  status: "Pending" },
];
const seedStudents: Student[] = [
  { id: "st1", firstName: "Ava",  lastName: "Morgan", grade: "10", team: "Photon Flyers"    },
  { id: "st2", firstName: "Noah", lastName: "Lee",    grade: "11", team: "Circuit Breakers" },
];
const seedCoaches: Coach[] = [
  { id: "c1", firstName: "Mia",  lastName: "Chen",   school: "Lincoln High", email: "mia.chen@example.com"   },
  { id: "c2", firstName: "Liam", lastName: "Garcia", school: "Sunrise Prep", email: "liam.garcia@example.com" },
];
const seedEvents: Event[] = [
  { id: "e1", title: "Regional Qualifier",  date: "2026-05-15", location: "Convention Center", status: "Scheduled" },
  { id: "e2", title: "Final Championship",  date: "2026-06-20", location: "City Arena",        status: "Planning"  },
];
const seedJudges: Judge[] = [
  { id: "j1", firstName: "Sophia", lastName: "Adams", expertise: "Robotics",  assignedTo: "Photon Flyers"    },
  { id: "j2", firstName: "Ethan",  lastName: "Baker", expertise: "Software",  assignedTo: "Circuit Breakers" },
];
const seedRequests: Request[] = [
  { id: "r1", requestType: "Team Registration", submittedBy: "Sunrise Prep",  status: "Pending",  notes: "Need fast approval"  },
  { id: "r2", requestType: "Event Change",       submittedBy: "Lincoln High",  status: "Reviewed", notes: "Schedule conflict"   },
];

// ─── Nav items ────────────────────────────────────────────────
const NAV_SECTIONS: { key: SectionKey; label: string; icon: React.ReactNode }[] = [
  { key: "Overview",  label: "Overview",  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { key: "Teams",     label: "Teams",     icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { key: "Schools",   label: "Schools",   icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { key: "Students",  label: "Students",  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> },
  { key: "Coaches",   label: "Coaches",   icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { key: "Events",    label: "Events",    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { key: "Judges",    label: "Judges",    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
  { key: "Requests",  label: "Requests",  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
];

// ─── Reusable generic table ───────────────────────────────────
function GenericTable<T extends Record<string, any>>({
  rows, columns, onSave, renderExtra,
}: {
  rows: T[];
  columns: { key: string; label: string }[];
  onSave: (updated: T[]) => void;
  renderExtra?: (row: T) => React.ReactNode;
}) {
  const [editId, setEditId]     = useState<string | null>(null);
  const [editVals, setEditVals] = useState<Record<string, string>>({});

  const startEdit = (row: T) => { setEditId(row.id); setEditVals({ ...row }); };
  const cancelEdit = () => { setEditId(null); setEditVals({}); };
  const saveEdit = () => {
    onSave(rows.map(r => r.id === editId ? { ...r, ...editVals } : r));
    cancelEdit();
  };

  return (
    <div className="gt-wrap">
      <table className="gt-table">
        <thead>
          <tr>
            {columns.map(c => <th key={c.key}>{c.label}</th>)}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id}>
              {columns.map(c => (
                <td key={c.key}>
                  {editId === row.id
                    ? <input value={editVals[c.key] ?? ""} onChange={e => setEditVals(v => ({ ...v, [c.key]: e.target.value }))} />
                    : row[c.key] ?? <span className="td-null">—</span>}
                </td>
              ))}
              <td className="td-actions">
                {editId === row.id ? (
                  <>
                    <button className="btn-icon edit" onClick={saveEdit} title="Save">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    </button>
                    <button className="btn-icon delete" onClick={cancelEdit} title="Cancel">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn-icon edit" onClick={() => startEdit(row)} title="Edit">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    {renderExtra?.(row)}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Section panels ───────────────────────────────────────────
function SchoolsPanel() {
  const [rows, setRows] = useState<School[]>(seedSchools);
  return (
    <SectionShell title="Schools" count={rows.length}>
      <GenericTable
        rows={rows} onSave={setRows}
        columns={[{ key: "name", label: "School Name" }, { key: "district", label: "District" }, { key: "status", label: "Status" }]}
        renderExtra={row => <StatusBadge status={row.status} />}
      />
    </SectionShell>
  );
}

function StudentsPanel() {
  const [rows, setRows] = useState<Student[]>(seedStudents);
  return (
    <SectionShell title="Students" count={rows.length}>
      <GenericTable rows={rows} onSave={setRows} columns={[
        { key: "firstName", label: "First Name" }, { key: "lastName", label: "Last Name" },
        { key: "grade", label: "Grade" },           { key: "team", label: "Team" },
      ]} />
    </SectionShell>
  );
}

function CoachesPanel() {
  const [rows, setRows] = useState<Coach[]>(seedCoaches);
  return (
    <SectionShell title="Coaches" count={rows.length}>
      <GenericTable rows={rows} onSave={setRows} columns={[
        { key: "firstName", label: "First Name" }, { key: "lastName", label: "Last Name" },
        { key: "school", label: "School" },         { key: "email", label: "Email" },
      ]} />
    </SectionShell>
  );
}

function EventsPanel() {
  const [rows, setRows] = useState<Event[]>(seedEvents);
  return (
    <SectionShell title="Events" count={rows.length}>
      <GenericTable rows={rows} onSave={setRows} columns={[
        { key: "title", label: "Title" }, { key: "date", label: "Date" },
        { key: "location", label: "Location" }, { key: "status", label: "Status" },
      ]} />
    </SectionShell>
  );
}

function JudgesPanel() {
  const [rows, setRows] = useState<Judge[]>(seedJudges);
  return (
    <SectionShell title="Judges" count={rows.length}>
      <GenericTable rows={rows} onSave={setRows} columns={[
        { key: "firstName", label: "First Name" }, { key: "lastName", label: "Last Name" },
        { key: "expertise", label: "Expertise" },   { key: "assignedTo", label: "Assigned To" },
      ]} />
    </SectionShell>
  );
}

function RequestsPanel() {
  const [rows, setRows] = useState<Request[]>(seedRequests);
  const setStatus = (id: string, status: string) =>
    setRows(r => r.map(x => x.id === id ? { ...x, status } : x));

  return (
    <SectionShell title="Registration Requests" count={rows.length}>
      <div className="gt-wrap">
        <table className="gt-table">
          <thead>
            <tr>
              <th>Type</th><th>Submitted By</th><th>Status</th><th>Notes</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.requestType}</td>
                <td>{r.submittedBy}</td>
                <td><StatusBadge status={r.status} /></td>
                <td className="td-muted">{r.notes}</td>
                <td className="td-actions">
                  <button className="btn-approve" onClick={() => setStatus(r.id, "Approved")}>Approve</button>
                  <button className="btn-deny"    onClick={() => setStatus(r.id, "Denied")}>Deny</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionShell>
  );
}

// ─── Overview ─────────────────────────────────────────────────
function OverviewPanel({ onNavigate }: { onNavigate: (s: SectionKey) => void }) {
  const metrics: { label: string; value: number; section: SectionKey; color: string }[] = [
    { label: "Schools",   value: seedSchools.length,   section: "Schools",   color: "#3b82f6" },
    { label: "Teams",     value: 0,                    section: "Teams",     color: "#6366f1" },
    { label: "Students",  value: seedStudents.length,  section: "Students",  color: "#8b5cf6" },
    { label: "Coaches",   value: seedCoaches.length,   section: "Coaches",   color: "#06b6d4" },
    { label: "Events",    value: seedEvents.length,    section: "Events",    color: "#10b981" },
    { label: "Judges",    value: seedJudges.length,    section: "Judges",    color: "#f59e0b" },
    { label: "Requests",  value: seedRequests.filter(r => r.status === "Pending").length, section: "Requests", color: "#ef4444" },
  ];

  return (
    <div className="overview-root">
      <div className="overview-header">
        <h1 className="section-title">Overview</h1>
        <p className="section-sub">Welcome back. Here's a snapshot of your system.</p>
      </div>
      <div className="metrics-grid">
        {metrics.map(m => (
          <button key={m.label} className="metric-card" onClick={() => onNavigate(m.section)}
            style={{ "--accent": m.color } as React.CSSProperties}>
            <span className="metric-dot" />
            <span className="metric-value">{m.value}</span>
            <span className="metric-label">{m.label}</span>
            <span className="metric-arrow">→</span>
          </button>
        ))}
      </div>

      <div className="overview-recent">
        <h2 className="recent-title">Recent Requests</h2>
        <div className="recent-list">
          {seedRequests.map(r => (
            <div key={r.id} className="recent-row">
              <div>
                <p className="recent-type">{r.requestType}</p>
                <p className="recent-by">{r.submittedBy}</p>
              </div>
              <StatusBadge status={r.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────
function SectionShell({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div className="section-shell">
      <div className="section-shell-header">
        <div>
          <h1 className="section-title">{title}</h1>
          <p className="section-sub">{count} record{count !== 1 ? "s" : ""}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Active: "#10b981", Pending: "#f59e0b", Reviewed: "#3b82f6",
    Approved: "#10b981", Denied: "#ef4444", Scheduled: "#6366f1", Planning: "#8b5cf6",
  };
  const color = colors[status] ?? "#64748b";
  return (
    <span className="status-badge" style={{ "--c": color } as React.CSSProperties}>
      {status}
    </span>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────
const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [active, setActive] = useState<SectionKey>("Overview");
  const [collapsed, setCollapsed] = useState(false);

  const renderContent = () => {
    switch (active) {
      case "Overview":  return <OverviewPanel onNavigate={setActive} />;
      case "Teams":     return <TeamsDashboard />;
      case "Schools":   return <SchoolsPanel />;
      case "Students":  return <StudentsPanel />;
      case "Coaches":   return <CoachesPanel />;
      case "Events":    return <EventsPanel />;
      case "Judges":    return <JudgesPanel />;
      case "Requests":  return <RequestsPanel />;
    }
  };

  return (
    <div className="dash-root">
      {/* ── Sidebar ── */}
      <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <div className="brand-icon">
              <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
                <path d="M14 2L26 8V20L14 26L2 20V8L14 2Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M14 8L20 11V17L14 20L8 17V11L14 8Z" fill="currentColor" opacity="0.5"/>
              </svg>
            </div>
            {!collapsed && <span className="brand-name">NEXUS</span>}
          </div>
          <button className="collapse-btn" onClick={() => setCollapsed(c => !c)} title="Toggle sidebar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {collapsed
                ? <polyline points="9 18 15 12 9 6"/>
                : <polyline points="15 18 9 12 15 6"/>}
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-group-label">{!collapsed && "MAIN MENU"}</p>
          {NAV_SECTIONS.map(({ key, label, icon }) => (
            <button
              key={key}
              className={`nav-item ${active === key ? "active" : ""}`}
              onClick={() => setActive(key)}
              title={collapsed ? label : undefined}
            >
              <span className="nav-icon">{icon}</span>
              {!collapsed && <span className="nav-label">{label}</span>}
              {!collapsed && active === key && <span className="nav-dot" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          {!collapsed && (
            <div className="user-info">
              <div className="user-avatar">{user?.email_address?.[0]?.toUpperCase() ?? "A"}</div>
              <div className="user-details">
                <p className="user-email">{user?.email_address ?? "Admin"}</p>
                <p className="user-role">Administrator</p>
              </div>
            </div>
          )}
          <button className="logout-btn" onClick={logout} title="Sign out">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="dash-main">
        {renderContent()}
      </main>

      {/* ── Styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .dash-root {
          display: flex;
          min-height: 100vh;
          background: #0d1117;
          font-family: 'DM Sans', sans-serif;
          color: #e2e8f0;
        }

        /* ── Sidebar ── */
        .sidebar {
          width: 240px; flex-shrink: 0;
          background: #0a0e14;
          border-right: 1px solid rgba(255,255,255,.07);
          display: flex; flex-direction: column;
          transition: width .25s cubic-bezier(.4,0,.2,1);
          position: sticky; top: 0; height: 100vh;
          overflow: hidden;
        }
        .sidebar.collapsed { width: 64px; }

        .sidebar-top {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 16px 16px;
          border-bottom: 1px solid rgba(255,255,255,.06);
          min-height: 64px;
        }
        .sidebar-brand { display: flex; align-items: center; gap: 10px; overflow: hidden; }
        .brand-icon {
          width: 34px; height: 34px; flex-shrink: 0;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center; color: #fff;
        }
        .brand-name {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: 15px; letter-spacing: .12em; color: #f1f5f9;
          white-space: nowrap;
        }
        .collapse-btn {
          background: none; border: none; cursor: pointer;
          color: #475569; padding: 4px; border-radius: 5px;
          transition: color .15s, background .15s; flex-shrink: 0;
        }
        .collapse-btn:hover { color: #94a3b8; background: rgba(255,255,255,.05); }

        /* nav */
        .sidebar-nav { flex: 1; padding: 12px 10px; overflow-y: auto; overflow-x: hidden; }
        .nav-group-label {
          font-size: 10px; font-weight: 600; letter-spacing: .1em;
          color: #2d3748; text-transform: uppercase;
          padding: 8px 8px 6px; white-space: nowrap;
        }
        .nav-item {
          width: 100%; display: flex; align-items: center; gap: 10px;
          padding: 9px 10px; border-radius: 8px;
          background: none; border: none; cursor: pointer;
          color: #475569; font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          text-align: left; white-space: nowrap;
          transition: color .15s, background .15s;
          position: relative; margin-bottom: 2px;
        }
        .nav-item:hover { color: #94a3b8; background: rgba(255,255,255,.04); }
        .nav-item.active {
          color: #e2e8f0;
          background: rgba(99,102,241,.12);
        }
        .nav-item.active .nav-icon { color: #818cf8; }
        .nav-icon { flex-shrink: 0; display: flex; }
        .nav-label { flex: 1; }
        .nav-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #6366f1; flex-shrink: 0;
        }

        /* footer */
        .sidebar-footer {
          padding: 12px 10px;
          border-top: 1px solid rgba(255,255,255,.06);
        }
        .user-info {
          display: flex; align-items: center; gap: 10px;
          padding: 8px; margin-bottom: 6px;
          border-radius: 8px;
          background: rgba(255,255,255,.03);
          overflow: hidden;
        }
        .user-avatar {
          width: 30px; height: 30px; flex-shrink: 0;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: #fff;
        }
        .user-details { overflow: hidden; }
        .user-email {
          font-size: 12px; color: #94a3b8;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .user-role { font-size: 10px; color: #334155; margin-top: 1px; }
        .logout-btn {
          width: 100%; display: flex; align-items: center; gap: 8px;
          padding: 8px 10px; border-radius: 7px;
          background: none; border: none; cursor: pointer;
          color: #475569; font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          transition: color .15s, background .15s;
        }
        .logout-btn:hover { color: #f87171; background: rgba(239,68,68,.08); }

        /* ── Main ── */
        .dash-main {
          flex: 1; overflow-y: auto; min-width: 0;
        }

        /* ── Overview ── */
        .overview-root { padding: 36px 32px; }
        .overview-header { margin-bottom: 28px; }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 12px; margin-bottom: 36px;
        }
        .metric-card {
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 14px; padding: 20px 18px;
          cursor: pointer; text-align: left;
          display: flex; flex-direction: column; gap: 6px;
          transition: background .2s, border-color .2s, transform .15s;
          position: relative; overflow: hidden;
        }
        .metric-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: var(--accent);
          opacity: 0; transition: opacity .2s;
        }
        .metric-card:hover { background: rgba(255,255,255,.05); border-color: rgba(255,255,255,.12); transform: translateY(-1px); }
        .metric-card:hover::before { opacity: 1; }
        .metric-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--accent); margin-bottom: 6px;
        }
        .metric-value {
          font-family: 'Syne', sans-serif; font-size: 32px;
          font-weight: 800; color: #f1f5f9; line-height: 1;
        }
        .metric-label { font-size: 12px; color: #475569; }
        .metric-arrow { font-size: 14px; color: var(--accent); opacity: 0; transition: opacity .2s; }
        .metric-card:hover .metric-arrow { opacity: 1; }

        .overview-recent { max-width: 520px; }
        .recent-title {
          font-family: 'Syne', sans-serif; font-size: 15px;
          font-weight: 700; color: #94a3b8;
          margin-bottom: 12px; letter-spacing: .04em;
        }
        .recent-list {
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 12px; overflow: hidden;
        }
        .recent-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255,255,255,.05);
        }
        .recent-row:last-child { border-bottom: none; }
        .recent-type { font-size: 13px; color: #e2e8f0; margin-bottom: 2px; }
        .recent-by { font-size: 11px; color: #475569; }

        /* ── Section shell ── */
        .section-shell { padding: 36px 32px; }
        .section-shell-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: 24px;
        }
        .section-title {
          font-family: 'Syne', sans-serif; font-size: 26px;
          font-weight: 800; color: #f1f5f9; margin-bottom: 4px;
        }
        .section-sub { font-size: 13px; color: #475569; }

        /* ── Generic Table ── */
        .gt-wrap {
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 12px; overflow: hidden;
        }
        .gt-table { width: 100%; border-collapse: collapse; }
        .gt-table th {
          padding: 12px 16px; text-align: left;
          font-size: 11px; font-weight: 500; color: #475569;
          letter-spacing: .07em; text-transform: uppercase;
          background: rgba(255,255,255,.02);
          border-bottom: 1px solid rgba(255,255,255,.07);
        }
        .gt-table td {
          padding: 12px 16px; font-size: 13px; color: #cbd5e1;
          border-bottom: 1px solid rgba(255,255,255,.05);
        }
        .gt-table tr:last-child td { border-bottom: none; }
        .gt-table tr:hover td { background: rgba(255,255,255,.02); }
        .gt-table input {
          width: 100%;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(99,102,241,.4);
          border-radius: 6px; padding: 6px 10px;
          font-size: 13px; color: #e2e8f0;
          font-family: 'DM Sans', sans-serif; outline: none;
        }
        .td-null { color: #2d3748; }
        .td-muted { color: #64748b !important; font-size: 12px !important; }
        .td-actions { display: flex; gap: 4px; align-items: center; }

        /* ── Status badge ── */
        .status-badge {
          display: inline-block; padding: 3px 10px;
          border-radius: 20px; font-size: 11px; font-weight: 500;
          background: color-mix(in srgb, var(--c) 15%, transparent);
          border: 1px solid color-mix(in srgb, var(--c) 35%, transparent);
          color: var(--c);
        }

        /* ── Buttons ── */
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

        .btn-approve {
          padding: 5px 12px; border-radius: 6px; font-size: 12px; font-weight: 500;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          background: rgba(16,185,129,.12); border: 1px solid rgba(16,185,129,.3);
          color: #34d399; transition: background .15s; margin-right: 6px;
        }
        .btn-approve:hover { background: rgba(16,185,129,.22); }
        .btn-deny {
          padding: 5px 12px; border-radius: 6px; font-size: 12px; font-weight: 500;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.25);
          color: #f87171; transition: background .15s;
        }
        .btn-deny:hover { background: rgba(239,68,68,.2); }

        /* ── Scrollbar ── */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.08); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,.14); }
      `}</style>
    </div>
  );
};

export default Dashboard;
