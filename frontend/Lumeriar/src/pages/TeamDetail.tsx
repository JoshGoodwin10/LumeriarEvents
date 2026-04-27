// src/pages/TeamDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchTeamWithDetails, type TeamWithDetails } from '../api/teams';

export default function TeamDetail() {
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<TeamWithDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;
        fetchTeamWithDetails(Number(id))
            .then(setData)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="td-loading"><span className="spinner-lg" /></div>;
    if (error) return <div className="td-error">{error}</div>;
    if (!data) return <div className="td-empty">Team not found.</div>;

    const { team, school, coaches, students, documents, eventTeams } = data;

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
                    <div><strong>Year</strong><br />{team.year || '—'}</div>
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
            {coaches.length > 0 && (
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
            {students.length > 0 && (
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
            {eventTeams.length > 0 && (
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

            {/* Documents */}
            {documents.length > 0 && (
                <div className="detail-card">
                    <h3>Documents</h3>
                    <ul>
                        {documents.map(d => (
                            <li key={d.document_id}>{d.name} ({d.type})</li>
                        ))}
                    </ul>
                </div>
            )}

            <style>{`
        .detail-card {
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        }
        .detail-card h3 {
          margin-top: 0;
          margin-bottom: 16px;
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #f1f5f9;
        }
        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px,1fr));
          gap: 16px;
          margin-bottom: 16px;
        }
        .list > div, .list > li {
          padding: 8px 0;
          border-bottom: 1px solid rgba(255,255,255,.05);
        }
        .td-error {
          text-align: center;
          padding: 40px;
          color: #f87171;
        }
      `}</style>
        </div>
    );
}