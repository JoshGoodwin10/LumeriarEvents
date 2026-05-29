// src/pages/Details/RequestDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../layout/details.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function authHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

interface Student {
    student_id: number;
    first_name: string;
    surname: string;
    date_of_birth: string;
    grade: string;
    role: string;
    dietary_requirements: string | null;
    shirt_size: string;
    has_consent: boolean;      // flag
    has_integrity: boolean;    // flag
}

interface Coach {
    coach_id: number;
    first_name: string;
    surname: string;
    email: string;
    phone_no: string;
    date_of_birth: string;
    staff_number: string;
    dietary_requirements: string | null;
    shirt_size: string;
    has_integrity: boolean;    // flag
}

interface Team {
    request_id: number;
    team_name: string;
    category: string;
    school_name: string;
    theme: string;
    province: string;
    event_name: string;
    project_description: string;
    how_heard: string;
    has_material_bill: boolean;
    has_engineering_plan: boolean;
    has_project_report: boolean;
    has_engineering_journal: boolean;
    is_approved: number;
    created_at: string;
}

export default function RequestDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [team, setTeam] = useState<Team | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [coach, setCoach] = useState<Coach | null>(null);
    const [approving, setApproving] = useState(false);
    const [downloading, setDownloading] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await fetch(`/api/register/${id}`);
                if (!res.ok) throw new Error('Failed to load request');
                const data = await res.json();
                setTeam(data.team);
                setStudents(data.students);
                setCoach(data.coach);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const handleApprove = async () => {
        if (!window.confirm('Approve this registration request?')) return;
        setApproving(true);
        try {
            const res = await fetch(`/api/register/${id}/approve`, {
                method: 'PUT',
                headers: authHeaders(),
            });
            if (!res.ok) throw new Error('Approval failed');
            alert('Request approved!');
            navigate('/requests');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setApproving(false);
        }
    };

    const downloadFile = async (url: string, label: string) => {
        setDownloading(label);
        try {
            const response = await fetch(url, { headers: authHeaders() });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Download failed');
            }
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `${label.replace(/\s/g, '_')}_${id}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (err: any) {
            console.error('Download error:', err);
            alert(`Failed to download ${label}: ${err.message}`);
        } finally {
            setDownloading(null);
        }
    };

    if (loading) return <div className="td-loading"><span className="spinner-lg" /></div>;
    if (error) return <div className="td-error">{error}</div>;
    if (!team) return <div>Request not found.</div>;

    const teamFileFields = [
        { key: 'material_bill', label: 'Material Bill', exists: team.has_material_bill },
        { key: 'engineering_plan', label: 'Engineering Plan', exists: team.has_engineering_plan },
        { key: 'project_report', label: 'Project Report', exists: team.has_project_report },
        { key: 'engineering_journal', label: 'Engineering Journal', exists: team.has_engineering_journal },
    ];

    return (
        <div className="td-root">
            <div className="td-header">
                <div>
                    <h1 className="td-title">Registration Request #{team.request_id}</h1>
                    <p className="td-subtitle">{team.team_name}</p>
                </div>
                <button className="btn-secondary" onClick={() => navigate('/requests')}>← Back to Requests</button>
            </div>

            <div className="detail-card">
                <p><strong>Status:</strong> {team.is_approved ? '✅ Approved' : '⏳ Pending'}</p>
                {!team.is_approved && (
                    <button className="btn-primary" onClick={handleApprove} disabled={approving}>
                        {approving ? 'Approving...' : 'Approve Request'}
                    </button>
                )}
                <p><strong>Submitted:</strong> {new Date(team.created_at).toLocaleString()}</p>
            </div>

            <div className="detail-card">
                <h3>Team Information</h3>
                <div className="detail-grid">
                    <div><strong>Team Name</strong><br />{team.team_name}</div>
                    <div><strong>School</strong><br />{team.school_name || '—'}</div>
                    <div><strong>Category</strong><br />{team.category || '—'}</div>
                    <div><strong>Thematic Focus</strong><br />{team.theme || '—'}</div>
                    <div><strong>Province</strong><br />{team.province || '—'}</div>
                    <div><strong>Event</strong><br />{team.event_name || '—'}</div>
                </div>
                <div><strong>Project Description</strong><br />{team.project_description || 'No description'}</div>
                <div><strong>How heard</strong><br />{team.how_heard || '—'}</div>
            </div>

            <div className="detail-card">
                <h3>Team Documents</h3>
                <div className="list">
                    {teamFileFields.map(f => f.exists && (
                        <div key={f.key}>
                            <button
                                onClick={() => downloadFile(`${API_BASE}/api/register/${id}/download/team/${f.key}`, f.label)}
                                className="file-link-button"
                                disabled={downloading === f.label}
                            >
                                {downloading === f.label ? <span className="spinner-sm" /> : '📄'} {f.label}
                            </button>
                        </div>
                    ))}
                </div>
                {!teamFileFields.some(f => f.exists) && <p>No team documents uploaded.</p>}
            </div>

            {students.length > 0 && (
                <div className="detail-card">
                    <h3>Students ({students.length})</h3>
                    {students.map((student, idx) => (
                        <div key={student.student_id} className="student-item">
                            <strong>{student.first_name} {student.surname}</strong> (Grade {student.grade}, {student.role})
                            <div className="file-group">
                                {student.has_consent && (
                                    <button
                                        onClick={() => downloadFile(`${API_BASE}/api/register/${id}/download/student/${idx}/parent_guardian_consent_form`, `Consent_${student.first_name}`)}
                                        className="file-link-button"
                                        disabled={downloading === `Consent_${student.first_name}`}
                                    >
                                        {downloading === `Consent_${student.first_name}` ? <span className="spinner-sm" /> : '📄'} Consent Form
                                    </button>
                                )}
                                {student.has_integrity && (
                                    <button
                                        onClick={() => downloadFile(`${API_BASE}/api/register/${id}/download/student/${idx}/signed_integrity_declaration`, `Integrity_${student.first_name}`)}
                                        className="file-link-button"
                                        disabled={downloading === `Integrity_${student.first_name}`}
                                    >
                                        {downloading === `Integrity_${student.first_name}` ? <span className="spinner-sm" /> : '📄'} Integrity Declaration
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {coach && (
                <div className="detail-card">
                    <h3>Coach</h3>
                    <div><strong>{coach.first_name} {coach.surname}</strong> – {coach.email}, {coach.phone_no}</div>
                    <div>Staff number: {coach.staff_number}</div>
                    <div>Shirt size: {coach.shirt_size}</div>
                    <div>Dietary: {coach.dietary_requirements || 'None'}</div>
                    {coach.has_integrity && (
                        <button
                            onClick={() => downloadFile(`${API_BASE}/api/register/${id}/download/coach/integrity`, 'Coach_Integrity')}
                            className="file-link-button"
                            disabled={downloading === 'Coach_Integrity'}
                        >
                            {downloading === 'Coach_Integrity' ? <span className="spinner-sm" /> : '📄'} Coach Integrity Declaration
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}