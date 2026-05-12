import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../layout/dashboard.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Student {
    student_id: number;
    first_name: string;
    surname: string;
    date_of_birth: string;
    grade: string;
    role: string;
    dietary_requirements: string | null;
    shirt_size: string;
    parent_guardian_consent_form: string | null;
    signed_integrity_declaration: string | null;
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
    signed_integrity_declaration: string | null;
    school_id: number;
}

interface Team {
    request_id: number;
    team_name: string;
    category: string;
    school_id: number;
    school_name: string;
    theme: string;
    province: string;
    event: number;
    event_name: string;
    project_description: string;
    how_heard: string;
    material_bill: string | null;
    engineering_plan: string | null;
    project_report: string | null;
    engineering_journal: string | null;
    is_approved: number;
    created_at: string;
}

function authHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

const RequestDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
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
            const res = await fetch(`/api/register/${id}/approve`, { method: 'PUT', headers: authHeaders() });
            if (!res.ok) throw new Error('Approval failed');
            alert('Request approved successfully!');
            navigate('/requests');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setApproving(false);
        }
    };

    const downloadFile = async (field: string, label: string, studentIndex?: number) => {
        setDownloading(field);
        try {
            let url = `${API_BASE}/api/register/${id}/download/${field}`;
            if (studentIndex !== undefined) {
                url = `${API_BASE}/api/register/${id}/download/${field}_${studentIndex}`;
            }
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

    if (loading) return <div className="td-loading">Loading...</div>;
    if (error) return <div className="td-error">Error: {error}</div>;
    if (!team) return <div>Request not found.</div>;

    return (
        <div className="td-root" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
            <div className="td-header" style={{ marginBottom: '2rem' }}>
                <h1>Registration Request #{team.request_id}</h1>
                <p>Submitted: {new Date(team.created_at).toLocaleString()}</p>
                <p>Status: {team.is_approved ? '✅ Approved' : '⏳ Pending'}</p>
                {!team.is_approved && (
                    <button className="btn-primary" onClick={handleApprove} disabled={approving}>
                        {approving ? 'Approving...' : 'Approve Request'}
                    </button>
                )}
            </div>

            {/* Team Details */}
            <section className="detail-section">
                <h2>Team Information</h2>
                <div className="detail-grid">
                    <div><strong>Team Name:</strong> {team.team_name}</div>
                    <div><strong>School:</strong> {team.school_name || team.school_id}</div>
                    <div><strong>Category:</strong> {team.category}</div>
                    <div><strong>Thematic Focus:</strong> {team.theme}</div>
                    <div><strong>Province:</strong> {team.province}</div>
                    <div><strong>Event:</strong> {team.event_name || team.event}</div>
                    <div><strong>Project Description:</strong> {team.project_description}</div>
                    <div><strong>How heard:</strong> {team.how_heard}</div>
                </div>
            </section>

            {/* Team Documents */}
            <section className="detail-section">
                <h2>Team Documents</h2>
                <div className="file-list">
                    {team.material_bill && (
                        <button className="file-download-btn" onClick={() => downloadFile('material_bill', 'Bill of Materials')} disabled={downloading === 'material_bill'}>
                            {downloading === 'material_bill' ? <span className="spinner-sm" /> : '📄'} Material Bill
                        </button>
                    )}
                    {team.engineering_plan && (
                        <button className="file-download-btn" onClick={() => downloadFile('engineering_plan', 'Engineering Plan')} disabled={downloading === 'engineering_plan'}>
                            {downloading === 'engineering_plan' ? <span className="spinner-sm" /> : '📄'} Engineering Plan
                        </button>
                    )}
                    {team.project_report && (
                        <button className="file-download-btn" onClick={() => downloadFile('project_report', 'Project Report')} disabled={downloading === 'project_report'}>
                            {downloading === 'project_report' ? <span className="spinner-sm" /> : '📄'} Project Report
                        </button>
                    )}
                    {team.engineering_journal && (
                        <button className="file-download-btn" onClick={() => downloadFile('engineering_journal', 'Engineering Journal')} disabled={downloading === 'engineering_journal'}>
                            {downloading === 'engineering_journal' ? <span className="spinner-sm" /> : '📄'} Engineering Journal
                        </button>
                    )}
                </div>
            </section>

            {/* Students */}
            <section className="detail-section">
                <h2>Students ({students.length})</h2>
                {students.map((student, idx) => (
                    <div key={student.student_id} className="student-card">
                        <h3>{student.first_name} {student.surname}</h3>
                        <div className="detail-grid">
                            <div><strong>Date of Birth:</strong> {new Date(student.date_of_birth).toLocaleDateString()}</div>
                            <div><strong>Grade:</strong> {student.grade}</div>
                            <div><strong>Role:</strong> {student.role}</div>
                            <div><strong>Shirt Size:</strong> {student.shirt_size}</div>
                            <div><strong>Dietary Requirements:</strong> {student.dietary_requirements || 'None'}</div>
                        </div>
                        <div className="student-docs">
                            <strong>Documents:</strong>
                            <div className="file-list">
                                {student.parent_guardian_consent_form && (
                                    <button className="file-download-btn" onClick={() => downloadFile('parent_guardian_consent', `Consent_${student.first_name}`, idx)} disabled={downloading === `parent_guardian_consent_${idx}`}>
                                        {downloading === `parent_guardian_consent_${idx}` ? <span className="spinner-sm" /> : '📄'} Parent/Guardian Consent
                                    </button>
                                )}
                                {student.signed_integrity_declaration && (
                                    <button className="file-download-btn" onClick={() => downloadFile('signed_integrity_declaration', `Integrity_${student.first_name}`, idx)} disabled={downloading === `signed_integrity_declaration_${idx}`}>
                                        {downloading === `signed_integrity_declaration_${idx}` ? <span className="spinner-sm" /> : '📄'} Integrity Declaration
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            {/* Coach */}
            {coach && (
                <section className="detail-section">
                    <h2>Coach</h2>
                    <div className="detail-grid">
                        <div><strong>Name:</strong> {coach.first_name} {coach.surname}</div>
                        <div><strong>Email:</strong> {coach.email}</div>
                        <div><strong>Phone:</strong> {coach.phone_no}</div>
                        <div><strong>Date of Birth:</strong> {new Date(coach.date_of_birth).toLocaleDateString()}</div>
                        <div><strong>Staff Number:</strong> {coach.staff_number}</div>
                        <div><strong>Shirt Size:</strong> {coach.shirt_size}</div>
                        <div><strong>Dietary Requirements:</strong> {coach.dietary_requirements || 'None'}</div>
                    </div>
                    {coach.signed_integrity_declaration && (
                        <div className="file-list">
                            <button className="file-download-btn" onClick={() => downloadFile('signed_integrity_declaration', 'Coach Integrity')} disabled={downloading === 'coach_integrity'}>
                                {downloading === 'coach_integrity' ? <span className="spinner-sm" /> : '📄'} Integrity Declaration
                            </button>
                        </div>
                    )}
                </section>
            )}

            <button className="btn-secondary" onClick={() => navigate('/requests')}>← Back to Requests</button>

            <style>{`
                .detail-section {
                    margin-bottom: 2rem;
                }
                .detail-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 1rem;
                    margin: 1rem 0;
                }
                .student-card {
                    background: rgba(255,255,255,.03);
                    border: 1px solid rgba(255,255,255,.08);
                    border-radius: 12px;
                    padding: 1rem;
                    margin-bottom: 1rem;
                }
                .file-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    margin-top: 0.5rem;
                }
                .file-download-btn {
                    background: none;
                    border: none;
                    color: #60a5fa;
                    cursor: pointer;
                    font-size: 0.9rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.3rem;
                    padding: 0;
                }
                .file-download-btn:hover {
                    text-decoration: underline;
                }
                .spinner-sm {
                    display: inline-block;
                    width: 12px;
                    height: 12px;
                    border: 2px solid #60a5fa;
                    border-top-color: transparent;
                    border-radius: 50%;
                    animation: spin 0.6s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default RequestDetail;