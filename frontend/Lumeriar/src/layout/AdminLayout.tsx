// src/layout/AdminLayout.tsx
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../layout/dashboard.css";

type SectionKey = "Overview" | "Teams" | "Schools" | "Students" | "Coaches" | "Events" | "Judges" | "Requests" | "Awards" | "Documents";

const NAV_SECTIONS: { key: SectionKey; label: string; path: string; icon: React.ReactNode }[] = [
    { key: "Overview", label: "Overview", path: "/dashboard", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg> },
    { key: "Teams", label: "Teams", path: "/teams", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
    { key: "Schools", label: "Schools", path: "/school", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
    { key: "Students", label: "Students", path: "/students", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg> },
    { key: "Coaches", label: "Coaches", path: "/coaches", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
    { key: "Events", label: "Events", path: "/eventsdash", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> },
    { key: "Judges", label: "Judges", path: "/judges", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg> },
    { key: "Requests", label: "Requests", path: "/requests", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg> },
    { key: "Awards", label: "Awards", path: "/awards", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.5 9.5 23 9.5 17 14.5 19.5 22 12 17.5 4.5 22 7 14.5 1 9.5 8.5 9.5 12 2" /></svg> },
    { key: "Documents", label: "Documents", path: "/documents", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg> },
];

export default function AdminLayout() {
    const { logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const currentPath = window.location.pathname;

    const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + "/");

    return (
        <div className="dash-root">
            <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
                <div className="sidebar-top">
                    <button className="collapse-btn" onClick={() => setCollapsed(c => !c)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {collapsed ? <polyline points="9 18 15 12 9 6" /> : <polyline points="15 18 9 12 15 6" />}
                        </svg>
                    </button>
                    {!collapsed && <span className="nav-group-label">MENU</span>}
                </div>
                <nav className="sidebar-nav">
                    {NAV_SECTIONS.map(({ key, label, path, icon }) => (
                        <button
                            key={key}
                            className={`nav-item ${isActive(path) ? "active" : ""}`}
                            onClick={() => navigate(path)}
                            title={collapsed ? label : undefined}
                        >
                            <span className="nav-icon">{icon}</span>
                            {!collapsed && <span className="nav-label">{label}</span>}
                            {!collapsed && isActive(path) && <span className="nav-dot" />}
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
                    <button className="logout-btn" onClick={logout}>
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
                <Outlet />
            </main>
        </div>
    );
}