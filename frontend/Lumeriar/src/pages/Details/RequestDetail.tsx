// src/pages/Details/RequestDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import '../../layout/details.css';
import { API_BASE } from '../../api/client';  // adjust path

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
    has_consent: boolean;
    has_integrity: boolean;
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
    has_integrity: boolean;
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
    const [rejecting, setRejecting] = useState(false);
    const [showRejectConfirm, setShowRejectConfirm] = useState(false);
    const [downloading, setDownloading] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/register/${id}`, {
                    headers: authHeaders(),
                });
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
            const res = await fetch(`${API_BASE}/api/register/${id}/approve`, {
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

    const handleReject = async () => {
        setRejecting(true);
        try {
            const res = await fetch(`${API_BASE}/api/register/${id}/reject`, {
                method: 'PUT',
                headers: authHeaders(),
            });
            if (!res.ok) throw new Error('Rejection failed');
            alert('Request rejected.');
            navigate('/requests');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setRejecting(false);
            setShowRejectConfirm(false);
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

    const statusText = team.is_approved === 1 ? 'Approved' : team.is_approved === -1 ? 'Rejected' : 'Pending';
    const isProcessed = team.is_approved !== 0;

    return (
        <div className="td-root">
            <div className="td-header">
                <div>
                    <h1 className="td-title">Registration Request #{team.request_id}</h1>
                    <p className="td-subtitle">{team.team_name}</p>
                </div>
                <button className="btn-secondary" onClick={() => navigate('/requests')}>← Back to Requests</button>
            </div>

            <div className="detail-card" style={{ textAlign: 'center' }}>
                <p><strong>Status:</strong> {statusText}</p>
                {!isProcessed && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                        <button className="btn-primary" onClick={handleApprove} disabled={approving || rejecting}>
                            {approving ? 'Approving...' : 'Approve Request'}
                        </button>
                        <button className="btn-danger" onClick={() => setShowRejectConfirm(true)} disabled={approving || rejecting}>
                            Reject Request
                        </button>
                    </div>
                )}
                <p style={{ marginTop: '1rem' }}><strong>Submitted:</strong> {new Date(team.created_at).toLocaleString()}</p>
            </div>

            {/* Reject Confirmation Modal */}
            {showRejectConfirm && createPortal(
                <div className="tdm-backdrop" onClick={() => setShowRejectConfirm(false)}>
                    <div className="tdm-box" onClick={(e) => e.stopPropagation()}>
                        <div className="tdm-head">
                            <h2 className="tdm-title">Reject Request</h2>
                            <button className="tdm-close" onClick={() => setShowRejectConfirm(false)}>×</button>
                        </div>
                        <p className="tdm-delete-msg">
                            Are you sure you want to reject this registration request from <strong>{team.team_name}</strong>? This action cannot be undone.
                        </p>
                        <div className="tdm-actions">
                            <button className="btn-secondary" onClick={() => setShowRejectConfirm(false)}>Cancel</button>
                            <button className="btn-danger" onClick={handleReject} disabled={rejecting}>
                                {rejecting ? 'Rejecting...' : 'Reject'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Team Information – 2 rows × 4 columns */}
            <div className="detail-card">
                <h3>Team Information</h3>
                <div className="detail-grid detail-grid-2x4">
                    <div><strong>Team Name</strong><br />{team.team_name}</div>
                    <div><strong>School</strong><br />{team.school_name || '—'}</div>
                    <div><strong>Category</strong><br />{team.category || '—'}</div>
                    <div><strong>Thematic Focus</strong><br />{team.theme || '—'}</div>
                    <div><strong>Province</strong><br />{team.province || '—'}</div>
                    <div><strong>Event</strong><br />{team.event_name || '—'}</div>
                    <div><strong>Project Description</strong><br />{team.project_description || 'No description'}</div>
                    <div><strong>How heard</strong><br />{team.how_heard || '—'}</div>
                </div>
            </div>

            {/* Team Documents */}
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

            {/* Students */}
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

            {/* Coach */}
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

            <style>{`
                .detail-grid-2x4 {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    margin-bottom: 16px;
                }
                @media (max-width: 768px) {
                    .detail-grid-2x4 {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                @media (max-width: 480px) {
                    .detail-grid-2x4 {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}