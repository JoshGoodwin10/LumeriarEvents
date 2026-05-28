import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import TeamsDashboard from "./TeamsDashboard";
import SchoolsDashboard from "./SchoolsDashboard";
import StudentsDashboard from "./StudentsDashboard";
import CoachesDashboard from "./CoachesDashboard";
import EventsDashboard from "./EventsDashboard";
import JudgesDashboard from "./JudgesDashboard";
import RequestsDashboard from "./RequestsDashboard";
import { fetchSchools } from "../../api/schools";
import { fetchTeams } from "../../api/teams";
import { fetchStudents } from "../../api/students";
import { fetchCoaches } from "../../api/coaches";
import { fetchEvents } from "../../api/events";
import { fetchJudges } from "../../api/judges";
import { fetchTeamRequests } from "../../api/requests";
import "../../layout/dashboard.css";
import AwardsDashboard from "./AwardsDashboard";
import DocumentsDashboard from "./DocumentsDashboard";

type SectionKey = "Overview" | "Teams" | "Schools" | "Students" | "Coaches" | "Events" | "Judges" | "Requests" | "Awards" | "Documents";

const NAV_SECTIONS: { key: SectionKey; label: string; icon: React.ReactNode }[] = [
  { key: "Overview", label: "Overview", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg> },
  { key: "Teams", label: "Teams", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
  { key: "Schools", label: "Schools", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
  { key: "Students", label: "Students", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg> },
  { key: "Coaches", label: "Coaches", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
  { key: "Events", label: "Events", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> },
  { key: "Judges", label: "Judges", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg> },
  { key: "Requests", label: "Requests", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg> },
  { key: "Awards", label: "Awards", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.5 9.5 23 9.5 17 14.5 19.5 22 12 17.5 4.5 22 7 14.5 1 9.5 8.5 9.5 12 2" /></svg> },
  { key: "Documents", label: "Documents", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg> },
];

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

function OverviewPanel({ onNavigate }: { onNavigate: (s: SectionKey) => void }) {
  const [counts, setCounts] = useState({
    schools: 0,
    teams: 0,
    students: 0,
    coaches: 0,
    events: 0,
    judges: 0,
    pendingRequests: 0,
  });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      setLoading(true);
      try {
        // Fetch all data in parallel with individual error handling
        const schoolsPromise = fetchSchools({}).then(res => res.length).catch(e => { console.error("Schools error:", e); return 0; });
        const teamsPromise = fetchTeams({}).then(res => res.length).catch(e => { console.error("Teams error:", e); return 0; });
        const studentsPromise = fetchStudents({}).then(res => res.length).catch(e => { console.error("Students error:", e); return 0; });
        const coachesPromise = fetchCoaches({}).then(res => res.length).catch(e => { console.error("Coaches error:", e); return 0; });
        const eventsPromise = fetchEvents({}).then(res => res.length).catch(e => { console.error("Events error:", e); return 0; });
        const judgesPromise = fetchJudges({}).then(res => res.length).catch(e => { console.error("Judges error:", e); return 0; });
        const requestsPromise = fetchTeamRequests({ is_approved: false }).then(res => {
          const pending = res.filter(r => !r.is_approved).length;
          setRecentRequests(res.slice(0, 5));
          return pending;
        }).catch(e => { console.error("Requests error:", e); return 0; });

        const [schoolsCount, teamsCount, studentsCount, coachesCount, eventsCount, judgesCount, pendingCount] = await Promise.all([
          schoolsPromise, teamsPromise, studentsPromise, coachesPromise, eventsPromise, judgesPromise, requestsPromise
        ]);

        setCounts({
          schools: schoolsCount,
          teams: teamsCount,
          students: studentsCount,
          coaches: coachesCount,
          events: eventsCount,
          judges: judgesCount,
          pendingRequests: pendingCount,
        });
      } catch (err) {
        console.error("Failed to fetch overview data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCounts();
  }, []);

  const metrics = [
    { label: "Schools", value: counts.schools, section: "Schools" as SectionKey, color: "#3b82f6" },
    { label: "Teams", value: counts.teams, section: "Teams" as SectionKey, color: "#6366f1" },
    { label: "Students", value: counts.students, section: "Students" as SectionKey, color: "#8b5cf6" },
    { label: "Coaches", value: counts.coaches, section: "Coaches" as SectionKey, color: "#06b6d4" },
    { label: "Events", value: counts.events, section: "Events" as SectionKey, color: "#10b981" },
    { label: "Judges", value: counts.judges, section: "Judges" as SectionKey, color: "#f59e0b" },
    { label: "Requests", value: counts.pendingRequests, section: "Requests" as SectionKey, color: "#ef4444" },
  ];

  if (loading) {
    return <div className="td-loading"><span className="spinner-lg" /></div>;
  }

  return (
    <div className="overview-root">
      <div className="overview-header">
        <h1 className="section-title">Overview</h1>
        <p className="section-sub">Welcome back. Here's a snapshot of your system.</p>
      </div>
      <div className="metrics-grid">
        {metrics.map(m => (
          <button
            key={m.label}
            className="metric-card"
            onClick={() => onNavigate(m.section)}
            style={{ "--accent": m.color } as React.CSSProperties}
          >
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
          {recentRequests.length === 0 ? (
            <div className="recent-row">No recent requests</div>
          ) : (
            recentRequests.map(req => (
              <div key={req.request_id} className="recent-row">
                <div>
                  <p className="recent-type">{req.team_name}</p>
                  <p className="recent-by">{req.province || "No province"}</p>
                </div>
                <StatusBadge status={req.is_approved ? "Approved" : "Pending"} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const Dashboard: React.FC = () => {
  const { logout } = useAuth();
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
      case "Requests": return <RequestsDashboard />;
      case "Awards": return <AwardsDashboard />;
      case "Documents": return <DocumentsDashboard />;
    }
  };

  return (
    <div className="dash-root">
      <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-top">


        </div>
        <nav className="sidebar-nav">
          <button className="collapse-btn" onClick={() => setCollapsed(c => !c)} title="Toggle sidebar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {collapsed ? <polyline points="9 18 15 12 9 6" /> : <polyline points="15 18 9 12 15 6" />}
            </svg>
          </button>
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
              <div className="user-avatar">A</div>
              <div className="user-details">
                <p className="user-email">Admin</p>
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
      <main className="dash-main">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;