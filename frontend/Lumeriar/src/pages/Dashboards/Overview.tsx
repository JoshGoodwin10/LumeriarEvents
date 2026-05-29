// src/pages/Dashboards/Dashboard.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSchools } from "../../api/schools";
import { fetchTeams } from "../../api/teams";
import { fetchStudents } from "../../api/students";
import { fetchCoaches } from "../../api/coaches";
import { fetchEvents } from "../../api/events";
import { fetchJudges } from "../../api/judges";
import { fetchTeamRequests } from "../../api/requests";
import "../../layout/dashboard.css";


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

export default function Overview() {
  const navigate = useNavigate();
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
    { label: "Schools", value: counts.schools, path: "/school", color: "#3b82f6" },
    { label: "Teams", value: counts.teams, path: "/teams", color: "#6366f1" },
    { label: "Students", value: counts.students, path: "/students", color: "#8b5cf6" },
    { label: "Coaches", value: counts.coaches, path: "/coaches", color: "#06b6d4" },
    { label: "Events", value: counts.events, path: "/events", color: "#10b981" },
    { label: "Judges", value: counts.judges, path: "/judges", color: "#f59e0b" },
    { label: "Requests", value: counts.pendingRequests, path: "/requests", color: "#ef4444" },
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
            onClick={() => navigate(m.path)}
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