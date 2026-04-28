import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import TeamsDashboard from "./TeamsDashboard";
import SchoolsDashboard from "./SchoolsDashboard";
import StudentsDashboard from "./StudentsDashboard";

// import dashboard css
import "../layout/dashboard.css";
import CoachesDashboard from "./CoachesDashboard";
import EventsDashboard from "./EventsDashboard";
import JudgesDashboard from "./JudgesDashboard";
import RequestsDashboard from "./RequestsDashboard";

// ─── Types ────────────────────────────────────────────────────
type School = { id: string; name: string; district: string; status: string };
type Student = { id: string; firstName: string; lastName: string; grade: string; team: string };
type Coach = { id: string; firstName: string; lastName: string; school: string; email: string };
type Event = { id: string; title: string; date: string; location: string; status: string };
type Judge = { id: string; firstName: string; lastName: string; expertise: string; assignedTo: string };
type Request = { id: string; requestType: string; submittedBy: string; status: string; notes: string };

type SectionKey = "Overview" | "Teams" | "Schools" | "Students" | "Coaches" | "Events" | "Judges" | "Requests";

// ─── Seed data ────────────────────────────────────────────────
const seedSchools: School[] = [
  { id: "s1", name: "Lincoln High", district: "North", status: "Active" },
  { id: "s2", name: "Sunrise Prep", district: "East", status: "Pending" },
];
const seedStudents: Student[] = [
  { id: "st1", firstName: "Ava", lastName: "Morgan", grade: "10", team: "Photon Flyers" },
  { id: "st2", firstName: "Noah", lastName: "Lee", grade: "11", team: "Circuit Breakers" },
];
const seedCoaches: Coach[] = [
  { id: "c1", firstName: "Mia", lastName: "Chen", school: "Lincoln High", email: "mia.chen@example.com" },
  { id: "c2", firstName: "Liam", lastName: "Garcia", school: "Sunrise Prep", email: "liam.garcia@example.com" },
];
const seedEvents: Event[] = [
  { id: "e1", title: "Regional Qualifier", date: "2026-05-15", location: "Convention Center", status: "Scheduled" },
  { id: "e2", title: "Final Championship", date: "2026-06-20", location: "City Arena", status: "Planning" },
];
const seedJudges: Judge[] = [
  { id: "j1", firstName: "Sophia", lastName: "Adams", expertise: "Robotics", assignedTo: "Photon Flyers" },
  { id: "j2", firstName: "Ethan", lastName: "Baker", expertise: "Software", assignedTo: "Circuit Breakers" },
];
const seedRequests: Request[] = [
  { id: "r1", requestType: "Team Registration", submittedBy: "Sunrise Prep", status: "Pending", notes: "Need fast approval" },
  { id: "r2", requestType: "Event Change", submittedBy: "Lincoln High", status: "Reviewed", notes: "Schedule conflict" },
];

// ─── Nav items ────────────────────────────────────────────────
const NAV_SECTIONS: { key: SectionKey; label: string; icon: React.ReactNode }[] = [
  { key: "Overview", label: "Overview", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg> },
  { key: "Teams", label: "Teams", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
  { key: "Schools", label: "Schools", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
  { key: "Students", label: "Students", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg> },
  { key: "Coaches", label: "Coaches", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
  { key: "Events", label: "Events", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> },
  { key: "Judges", label: "Judges", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg> },
  { key: "Requests", label: "Requests", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg> },
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
  const [editId, setEditId] = useState<string | null>(null);
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
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    </button>
                    <button className="btn-icon delete" onClick={cancelEdit} title="Cancel">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn-icon edit" onClick={() => startEdit(row)} title="Edit">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
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

// ─── Overview ─────────────────────────────────────────────────
function OverviewPanel({ onNavigate }: { onNavigate: (s: SectionKey) => void }) {
  const metrics: { label: string; value: number; section: SectionKey; color: string }[] = [
    { label: "Schools", value: seedSchools.length, section: "Schools", color: "#3b82f6" },
    { label: "Teams", value: 0, section: "Teams", color: "#6366f1" },
    { label: "Students", value: seedStudents.length, section: "Students", color: "#8b5cf6" },
    { label: "Coaches", value: seedCoaches.length, section: "Coaches", color: "#06b6d4" },
    { label: "Events", value: seedEvents.length, section: "Events", color: "#10b981" },
    { label: "Judges", value: seedJudges.length, section: "Judges", color: "#f59e0b" },
    { label: "Requests", value: seedRequests.filter(r => r.status === "Pending").length, section: "Requests", color: "#ef4444" },
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
      case "Overview": return <OverviewPanel onNavigate={setActive} />;
      case "Teams": return <TeamsDashboard />;
      case "Schools": return <SchoolsDashboard />;
      case "Students": return <StudentsDashboard />;
      case "Coaches": return <CoachesDashboard />;
      case "Events": return <EventsDashboard />;
      case "Judges": return <JudgesDashboard />;
      //case "Requests": return <RequestsDashboard />;
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
                <path d="M14 2L26 8V20L14 26L2 20V8L14 2Z" stroke="currentColor" strokeWidth="2" />
                <path d="M14 8L20 11V17L14 20L8 17V11L14 8Z" fill="currentColor" opacity="0.5" />
              </svg>
            </div>
            {!collapsed && <span className="brand-name">NEXUS</span>}
          </div>
          <button className="collapse-btn" onClick={() => setCollapsed(c => !c)} title="Toggle sidebar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {collapsed
                ? <polyline points="9 18 15 12 9 6" />
                : <polyline points="15 18 9 12 15 6" />}
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
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="dash-main">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
