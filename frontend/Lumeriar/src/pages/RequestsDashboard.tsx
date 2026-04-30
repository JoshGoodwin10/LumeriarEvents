// src/pages/RequestsDashboard.tsx
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { fetchTeamRequests, type TeamRequest } from "../api/requests";
import "../layout/dashboard.css";

export default function RequestsDashboard() {
    const [requests, setRequests] = useState<TeamRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showApproved, setShowApproved] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchTeamRequests({ search: search || undefined, is_approved: showApproved });
            setRequests(data);
        } finally {
            setLoading(false);
        }
    }, [search, showApproved]);

    useEffect(() => { load(); }, [load]);

    return (
        <div className="td-root">
            <div className="td-header">
                <div>
                    <h1 className="td-title">Team Registration Requests</h1>
                    <p className="td-subtitle">{requests.length} pending request{requests.length !== 1 ? "s" : ""}</p>
                </div>
            </div>

            <div className="td-filters">
                <div className="filter-search">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input type="text" placeholder="Search team name or province…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <label className="filter-checkbox">
                    <input type="checkbox" checked={showApproved} onChange={e => setShowApproved(e.target.checked)} />
                    Show approved requests
                </label>
            </div>

            <div className="td-table-wrap">
                {loading ? (
                    <div className="td-loading"><span className="spinner-lg" /></div>
                ) : requests.length === 0 ? (
                    <div className="td-empty">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        <p>No requests found</p>
                    </div>
                ) : (
                    <table className="td-table">
                        <thead>
                            <tr>
                                <th>ID</th><th>Team Name</th><th>Province</th><th>Theme</th>
                                <th>Created</th><th>Status</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(req => (
                                <tr key={req.request_id}>
                                    <td className="td-id">#{req.request_id}</td>
                                    <td className="td-name">
                                        <Link to={`/requests/${req.request_id}`} className="request-link">
                                            {req.team_name}
                                        </Link>
                                    </td>
                                    <td>{req.province ?? <span className="td-null">—</span>}</td>
                                    <td>{req.theme ?? <span className="td-null">—</span>}</td>
                                    <td className="td-date">{new Date(req.created_at).toLocaleDateString()}</td>
                                    <td>{req.is_approved ? <span className="status-approved">Approved</span> : <span className="status-pending">Pending</span>}</td>
                                    <td className="td-actions">
                                        <Link to={`/requests/${req.request_id}`} className="btn-icon view" title="View Details">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <style>{`
        .status-approved { color: #10b981; }
        .status-pending { color: #f59e0b; }
        .request-link { color: #60a5fa; text-decoration: none; font-weight: 500; }
        .request-link:hover { text-decoration: underline; }
        .filter-checkbox { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,.05); padding: 0 12px; border-radius: 8px; }
      `}</style>
        </div>
    );
}