// src/pages/TeamDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchTeamWithDetails, type TeamWithDetails } from '../../api/teams';
import '../../layout/details.css';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function authHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

export default function TeamDetail() {
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<TeamWithDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [downloading, setDownloading] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        fetchTeamWithDetails(Number(id))
            .then(setData)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    const downloadFile = async (field: string, label: string) => {
        if (!id) return;
        setDownloading(field);
        try {
            const response = await fetch(`${API_BASE}/api/teams/${id}/download/${field}`, {
                headers: authHeaders(),
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Download failed');
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${label.replace(/\s/g, '_')}_${id}.pdf`;  // adjust extension if needed
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error('Download error:', err);
            alert(`Failed to download ${label}: ${err.message}`);
        } finally {
            setDownloading(null);
        }
    };

    if (loading) return <div className="td-loading"><span className="spinner-lg" /></div>;
    if (error) return <div className="td-error">{error}</div>;
    if (!data) return <div className="td-empty">Team not found.</div>;

    const { team, school, coaches, students, eventTeams } = data;

    const blobFields = [
        { key: 'material_bill', label: 'Material Bill' },
        { key: 'engineering_plan', label: 'Engineering Plan' },
        { key: 'project_report', label: 'Project Report' },
        { key: 'engineering_journal', label: 'Engineering Journal' }
    ];

    const hasBlobFiles = blobFields.some(f => team[f.key as keyof typeof team]);

    return (
        <div className="td-root">
            <div className="td-header">
                <div>
                    <h1 className="td-title">{team.team_name}</h1>
                    <p className="td-subtitle">Team #{team.team_id}</p>
                </div>
                <Link to="/teams" className="btn-secondary">← Back to Teams</Link>
            </div>

            {/* Team info card */}
            <div className="detail-card">
                <h3>General Information</h3>
                <div className="detail-grid">
                    <div><strong>Category</strong><br />{team.category || '—'}</div>
                    <div><strong>Theme</strong><br />{team.theme || '—'}</div>
                    <div><strong>Created</strong><br />{new Date(team.created_at).toLocaleDateString()}</div>
                </div>
                <div><strong>Project Description</strong><br />{team.project_description || 'No description'}</div>
            </div>

            {/* School */}
            {school && (
                <div className="detail-card">
                    <h3>School</h3>
                    <p><strong>{school.school_name}</strong> – {school.province}</p>
                    <p>Best score: {school.best_score} | Avg: {school.avg_score} | Teams: {school.no_teams}</p>
                </div>
            )}

            {/* Coaches */}
            {coaches && coaches.length > 0 && (
                <div className="detail-card">
                    <h3>Coaches</h3>
                    <div className="list">
                        {coaches.map(c => (
                            <div key={c.coach_id}>
                                {c.first_name} {c.surname} – {c.email} | {c.phone_no}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Students */}
            {students && students.length > 0 && (
                <div className="detail-card">
                    <h3>Students</h3>
                    <div className="list">
                        {students.map(s => (
                            <div key={s.student_id}>
                                <strong>{s.first_name} {s.surname}</strong> – Grade {s.grade}, Role: {s.role}
                                {s.shirt_size && `, Shirt: ${s.shirt_size}`}
                                {s.dietary && `, Diet: ${s.dietary}`}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Event Teams */}
            {eventTeams && eventTeams.length > 0 && (
                <div className="detail-card">
                    <h3>Event Participation</h3>
                    <div className="list">
                        {eventTeams.map(et => (
                            <div key={et.event_team_id}>
                                Event #{et.event_id} – Total points: {et.total_points_created_at || 'pending'}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Team Files (blob fields) */}
            <div className="detail-card">
                <h3>Team Files</h3>
                {hasBlobFiles ? (
                    <div className="list">
                        {blobFields.map(field => {
                            const hasFile = team[field.key as keyof typeof team];
                            if (!hasFile) return null;
                            return (
                                <div key={field.key}>
                                    <button
                                        onClick={() => downloadFile(field.key, field.label)}
                                        className="file-link-button"
                                        disabled={downloading === field.key}
                                    >
                                        {downloading === field.key ? (
                                            <span className="spinner-sm" />
                                        ) : (
                                            '📄'
                                        )}{' '}
                                        {field.label}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p>No files uploaded.</p>
                )}
            </div>
        </div>
    );
}