import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../../layout/events.css';

// --- Types ---
interface EventInfo {
    event_id: number;
    name: string;
    date: string;
    venue: string;
    category: string;          // added
}

interface Student {
    id: number;
    first_name: string;
    surname: string;
    date_of_birth: string;
    grade: string;
    role: string;
    dietary_requirements: string;
    shirt_size: string;
    parent_guardian_consent: File | null;
    signed_integrity_declaration: File | null;
}

interface Coach {
    first_name: string;
    surname: string;
    email: string;
    phone_no: string;
    date_of_birth: string;
    staff_number: string;
    dietary_requirements: string;
    shirt_size: string;
    signed_integrity_declaration: File | null;
}

interface TeamFormData {
    team_name: string;
    school: string;
    category: string;
    thematic_focus: string;
    event_id: number;
    province: string;
    project_description: string;
    how_heard: string;
    material_bill: File | null;
    engineering_plan: File | null;
    project_report: File | null;
    engineering_journal: File | null;
}

// South African provinces
const PROVINCES = [
    "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal",
    "Limpopo", "Mpumalanga", "North West", "Northern Cape", "Western Cape"
];

const emptyStudent = (id: number): Student => ({
    id,
    first_name: '',
    surname: '',
    date_of_birth: '',
    grade: '',
    role: '',
    dietary_requirements: '',
    shirt_size: '',
    parent_guardian_consent: null,
    signed_integrity_declaration: null,
});

const emptyCoach: Coach = {
    first_name: '',
    surname: '',
    email: '',
    phone_no: '',
    date_of_birth: '',
    staff_number: '',
    dietary_requirements: '',
    shirt_size: '',
    signed_integrity_declaration: null,
};

const Register: React.FC = () => {
    const [searchParams] = useSearchParams();
    const eventId = searchParams.get('event');
    const navigate = useNavigate();

    const [event, setEvent] = useState<EventInfo | null>(null);
    const [loadingEvent, setLoadingEvent] = useState(true);
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Form data states
    const [team, setTeam] = useState<TeamFormData>({
        team_name: '',
        school: '',
        category: '',
        thematic_focus: '',
        event_id: 0,
        province: '',
        project_description: '',
        how_heard: '',
        material_bill: null,
        engineering_plan: null,
        project_report: null,
        engineering_journal: null,
    });
    const [students, setStudents] = useState<Student[]>([emptyStudent(1)]);
    const [coach, setCoach] = useState<Coach>(emptyCoach);
    const [schools, setSchools] = useState<{ school_id: number; school_name: string }[]>([]);
    const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
    const [newSchoolName, setNewSchoolName] = useState<string>('');

    // Fetch event details
    useEffect(() => {
        if (!eventId) {
            setError('No event specified.');
            setLoadingEvent(false);
            return;
        }
        const fetchEvent = async () => {
            try {
                const res = await fetch(`/api/events/${eventId}`);
                if (!res.ok) throw new Error('Event not found');
                const data = await res.json();
                setEvent(data);
                // Auto-fill competition category from event's category
                setTeam(prev => ({
                    ...prev,
                    event_id: parseInt(eventId),
                    category: data.category || ''   // set the category field
                }));
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoadingEvent(false);
            }
        };
        fetchEvent();
    }, [eventId]);

    useEffect(() => {
        const fetchSchools = async () => {
            try {
                const res = await fetch('/api/schools/public');
                if (res.ok) {
                    const data = await res.json();
                    setSchools(data);
                }
            } catch (err) {
                console.error('Failed to load schools', err);
            }
        };
        fetchSchools();
    }, []);

    // Student management
    const addStudent = () => {
        const newId = Math.max(...students.map(s => s.id), 0) + 1;
        setStudents([...students, emptyStudent(newId)]);
    };
    const removeStudent = (id: number) => {
        if (students.length === 1) return;
        setStudents(students.filter(s => s.id !== id));
    };
    const updateStudent = (id: number, field: keyof Student, value: any) => {
        setStudents(students.map(s => s.id === id ? { ...s, [field]: value } : s));
    };
    const updateStudentFile = (id: number, field: 'parent_guardian_consent' | 'signed_integrity_declaration', file: File | null) => {
        setStudents(students.map(s => s.id === id ? { ...s, [field]: file } : s));
    };

    // Team field change
    const handleTeamChange = (field: keyof TeamFormData, value: any) => {
        setTeam({ ...team, [field]: value });
    };
    const handleTeamFile = (field: 'material_bill' | 'engineering_plan' | 'project_report' | 'engineering_journal', file: File | null) => {
        setTeam({ ...team, [field]: file });
    };

    // Coach change
    const handleCoachChange = (field: keyof Coach, value: any) => {
        setCoach({ ...coach, [field]: value });
    };
    const handleCoachFile = (field: 'signed_integrity_declaration', file: File | null) => {
        setCoach({ ...coach, [field]: file });
    };

    // Navigation
    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    // Validation per step (unchanged)
    const validateStep1 = (): boolean => {
        if (!team.team_name.trim()) { setError('Team name required'); return false; }
        if (!team.school.trim()) { setError('School/Institution required'); return false; }
        if (!team.category.trim()) { setError('Competition category required'); return false; }
        if (!team.thematic_focus.trim()) { setError('Thematic focus required'); return false; }
        if (!team.province.trim()) { setError('Province required'); return false; }
        if (!team.project_description.trim()) { setError('Project description required'); return false; }
        if (!team.how_heard.trim()) { setError('How did you hear about us? required'); return false; }
        setError('');
        return true;
    };
    const validateStep2 = (): boolean => {
        for (let student of students) {
            if (!student.first_name.trim()) { setError('All student first names required'); return false; }
            if (!student.surname.trim()) { setError('All student surnames required'); return false; }
            if (!student.date_of_birth) { setError('All student dates of birth required'); return false; }
            if (!student.grade) { setError('All student grades required'); return false; }
            if (!student.role) { setError('All student roles required'); return false; }
            if (!student.shirt_size) { setError('All student shirt sizes required'); return false; }
        }
        if (!coach.first_name.trim()) { setError('Coach first name required'); return false; }
        if (!coach.surname.trim()) { setError('Coach surname required'); return false; }
        if (!coach.email.trim() || !coach.email.includes('@')) { setError('Valid coach email required'); return false; }
        if (!coach.phone_no.trim()) { setError('Coach phone number required'); return false; }
        if (!coach.date_of_birth) { setError('Coach date of birth required'); return false; }
        if (!coach.staff_number.trim()) { setError('Coach staff number required'); return false; }
        if (!coach.shirt_size) { setError('Coach shirt size required'); return false; }
        setError('');
        return true;
    };
    const validateStep3 = (): boolean => {
        if (!team.material_bill) { setError('Bill of Materials/Build Budget Declaration required'); return false; }
        if (!team.engineering_plan) { setError('Engineering Plans/Schematics required'); return false; }
        if (!team.project_report) { setError('Project Report required'); return false; }
        if (!team.engineering_journal) { setError('Engineering Journal required'); return false; }
        for (let student of students) {
            if (!student.parent_guardian_consent) { setError(`Parent/Guardian consent for ${student.first_name} ${student.surname} required`); return false; }
            if (!student.signed_integrity_declaration) { setError(`Integrity declaration for ${student.first_name} ${student.surname} required`); return false; }
        }
        if (!coach.signed_integrity_declaration) { setError('Coach integrity declaration required'); return false; }
        setError('');
        return true;
    };

    const handleSubmit = async () => {
        if (!validateStep3()) return;
        setSubmitting(true);
        setError('');
        try {
            const formData = new FormData();
            const teamData = {
                team_name: team.team_name,
                school: team.school,
                category: team.category,
                thematic_focus: team.thematic_focus,
                event_id: team.event_id,
                province: team.province,
                project_description: team.project_description,
                how_heard: team.how_heard,
            };
            formData.append('team', JSON.stringify(teamData));
            const studentsData = students.map(s => ({
                first_name: s.first_name,
                surname: s.surname,
                date_of_birth: s.date_of_birth,
                grade: s.grade,
                role: s.role,
                dietary_requirements: s.dietary_requirements,
                shirt_size: s.shirt_size,
            }));
            formData.append('students', JSON.stringify(studentsData));
            const coachData = {
                first_name: coach.first_name,
                surname: coach.surname,
                email: coach.email,
                phone_no: coach.phone_no,
                date_of_birth: coach.date_of_birth,
                staff_number: coach.staff_number,
                dietary_requirements: coach.dietary_requirements,
                shirt_size: coach.shirt_size,
            };
            formData.append('coach', JSON.stringify(coachData));

            formData.append('material_bill', team.material_bill!);
            formData.append('engineering_plan', team.engineering_plan!);
            formData.append('project_report', team.project_report!);
            formData.append('engineering_journal', team.engineering_journal!);
            students.forEach((student, idx) => {
                formData.append(`student_consent_${idx}`, student.parent_guardian_consent!);
                formData.append(`student_integrity_${idx}`, student.signed_integrity_declaration!);
            });
            formData.append('coach_integrity', coach.signed_integrity_declaration!);

            const response = await fetch('/api/register', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Submission failed');
            }
            alert('Registration submitted successfully! Awaiting approval.');
            navigate('/events');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingEvent) return <div>Loading event details...</div>;
    if (error && !event) return <div className="events-error">{error}</div>;
    if (!eventId) return <div>No event selected.</div>;

    return (
        <div className="events-page">
            <h1>Register for: {event?.name}</h1>
            <p>{event?.venue} - {event?.date ? new Date(event.date).toLocaleDateString() : 'Date TBA'}</p>

            <div className="registration-steps">
                <div className="step-indicator">
                    <span className={step >= 1 ? 'active' : ''}>1. Team Details</span>
                    <span className={step >= 2 ? 'active' : ''}>2. Members & Coach</span>
                    <span className={step >= 3 ? 'active' : ''}>3. Uploads</span>
                    <span className={step >= 4 ? 'active' : ''}>4. Review & Submit</span>
                </div>

                {error && <div className="error-message">{error}</div>}

                {/* Step 1: Team Details */}
                {step === 1 && (
                    <div className="step-form">
                        <div className="form-group">
                            <label>Team Name *</label>
                            <input type="text" value={team.team_name} onChange={e => handleTeamChange('team_name', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>School / Institution *</label>
                            <select
                                value={selectedSchoolId}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSelectedSchoolId(val);
                                    if (val === 'new') {
                                        setTeam({ ...team, school: newSchoolName });
                                    } else {
                                        const selected = schools.find(s => s.school_id.toString() === val);
                                        if (selected) {
                                            setTeam({ ...team, school: selected.school_name });
                                            setNewSchoolName('');
                                        }
                                    }
                                }}
                            >
                                <option value="">-- Select a school --</option>
                                {schools.map(s => (
                                    <option key={s.school_id} value={s.school_id}>{s.school_name}</option>
                                ))}
                                <option value="new">+ Add new school</option>
                            </select>
                            {selectedSchoolId === 'new' && (
                                <input
                                    type="text"
                                    placeholder="Enter new school name"
                                    value={newSchoolName}
                                    onChange={(e) => {
                                        setNewSchoolName(e.target.value);
                                        setTeam({ ...team, school: e.target.value });
                                    }}
                                    style={{ marginTop: '8px' }}
                                />
                            )}
                        </div>
                        <div className="form-group">
                            <label>Competition Category *</label>
                            <input type="text" value={team.category} onChange={e => handleTeamChange('category', e.target.value)} disabled />
                        </div>
                        <div className="form-group">
                            <label>Thematic Focus *</label>
                            <input type="text" value={team.thematic_focus} onChange={e => handleTeamChange('thematic_focus', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>School Province *</label>
                            <select value={team.province} onChange={e => handleTeamChange('province', e.target.value)}>
                                <option value="">Select Province</option>
                                {PROVINCES.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Brief Project Description *</label>
                            <textarea rows={3} value={team.project_description} onChange={e => handleTeamChange('project_description', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>How did you hear about Lumeriar? *</label>
                            <input type="text" value={team.how_heard} onChange={e => handleTeamChange('how_heard', e.target.value)} />
                        </div>
                        <div className="step-buttons">
                            <button className="btn-next" onClick={() => { if (validateStep1()) nextStep(); }}>Next</button>
                        </div>
                    </div>
                )}

                {/* Step 2: Team Members and Coach (unchanged) */}
                {step === 2 && (
                    <div className="step-form">
                        {/* ... same as before ... */}
                        <h3>Students</h3>
                        {students.map((student, idx) => (
                            <div key={student.id} className="student-card">
                                <h4>Student {idx + 1}</h4>
                                <div className="form-row">
                                    <div className="form-group"><label>First Name *</label><input value={student.first_name} onChange={e => updateStudent(student.id, 'first_name', e.target.value)} /></div>
                                    <div className="form-group"><label>Surname *</label><input value={student.surname} onChange={e => updateStudent(student.id, 'surname', e.target.value)} /></div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group"><label>Date of Birth *</label><input type="date" value={student.date_of_birth} onChange={e => updateStudent(student.id, 'date_of_birth', e.target.value)} /></div>
                                    <div className="form-group"><label>Grade *</label><input value={student.grade} onChange={e => updateStudent(student.id, 'grade', e.target.value)} /></div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group"><label>Role *</label><input value={student.role} onChange={e => updateStudent(student.id, 'role', e.target.value)} /></div>
                                    <div className="form-group"><label>Shirt Size *</label>
                                        <select value={student.shirt_size} onChange={e => updateStudent(student.id, 'shirt_size', e.target.value)}>
                                            <option value="">Select</option><option>XS</option><option>S</option><option>M</option><option>L</option><option>XL</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group"><label>Dietary Requirements</label><input value={student.dietary_requirements} onChange={e => updateStudent(student.id, 'dietary_requirements', e.target.value)} /></div>
                                {students.length > 1 && <button type="button" className="btn-remove" onClick={() => removeStudent(student.id)}>Remove Student</button>}
                            </div>
                        ))}
                        <button type="button" className="btn-add" onClick={addStudent}>+ Add Student</button>

                        <h3>Coach</h3>
                        <div className="coach-card">
                            <div className="form-row">
                                <div className="form-group"><label>First Name *</label><input value={coach.first_name} onChange={e => handleCoachChange('first_name', e.target.value)} /></div>
                                <div className="form-group"><label>Surname *</label><input value={coach.surname} onChange={e => handleCoachChange('surname', e.target.value)} /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Email *</label><input type="email" value={coach.email} onChange={e => handleCoachChange('email', e.target.value)} /></div>
                                <div className="form-group"><label>Phone Number *</label><input type="tel" value={coach.phone_no} onChange={e => handleCoachChange('phone_no', e.target.value)} /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Date of Birth *</label><input type="date" value={coach.date_of_birth} onChange={e => handleCoachChange('date_of_birth', e.target.value)} /></div>
                                <div className="form-group"><label>Staff Number *</label><input value={coach.staff_number} onChange={e => handleCoachChange('staff_number', e.target.value)} /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Dietary Requirements</label><input value={coach.dietary_requirements} onChange={e => handleCoachChange('dietary_requirements', e.target.value)} /></div>
                                <div className="form-group"><label>Shirt Size *</label>
                                    <select value={coach.shirt_size} onChange={e => handleCoachChange('shirt_size', e.target.value)}>
                                        <option value="">Select</option><option>XS</option><option>S</option><option>M</option><option>L</option><option>XL</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="step-buttons">
                            <button className="btn-prev" onClick={prevStep}>Back</button>
                            <button className="btn-next" onClick={() => { if (validateStep2()) nextStep(); }}>Next</button>
                        </div>
                    </div>
                )}

                {/* Step 3: Document Uploads (unchanged) */}
                {step === 3 && (
                    <div className="step-form">
                        <h3>Team Documents</h3>
                        <div className="form-group"><label>Bill of Materials / Build Budget Declaration *</label><input type="file" onChange={e => handleTeamFile('material_bill', e.target.files?.[0] || null)} /></div>
                        <div className="form-group"><label>Engineering Plans / Schematics *</label><input type="file" onChange={e => handleTeamFile('engineering_plan', e.target.files?.[0] || null)} /></div>
                        <div className="form-group"><label>Project Report *</label><input type="file" onChange={e => handleTeamFile('project_report', e.target.files?.[0] || null)} /></div>
                        <div className="form-group"><label>Engineering Journal *</label><input type="file" onChange={e => handleTeamFile('engineering_journal', e.target.files?.[0] || null)} /></div>

                        <h3>Student Documents</h3>
                        {students.map((student, idx) => (
                            <div key={student.id} className="student-docs">
                                <h4>{student.first_name || 'Student'} {student.surname}</h4>
                                <div className="form-group"><label>Parent/Guardian Consent Form *</label><input type="file" onChange={e => updateStudentFile(student.id, 'parent_guardian_consent', e.target.files?.[0] || null)} /></div>
                                <div className="form-group"><label>Signed Integrity Declaration *</label><input type="file" onChange={e => updateStudentFile(student.id, 'signed_integrity_declaration', e.target.files?.[0] || null)} /></div>
                            </div>
                        ))}

                        <h3>Coach Document</h3>
                        <div className="form-group"><label>Signed Integrity Declaration *</label><input type="file" onChange={e => handleCoachFile('signed_integrity_declaration', e.target.files?.[0] || null)} /></div>

                        <div className="step-buttons">
                            <button className="btn-prev" onClick={prevStep}>Back</button>
                            <button className="btn-next" onClick={() => { if (validateStep3()) nextStep(); }}>Next</button>
                        </div>
                    </div>
                )}

                {/* Step 4: Review and Submit (unchanged) */}
                {step === 4 && (
                    <div className="step-form">
                        <h3>Review your registration</h3>
                        <div className="review-section">
                            <h4>Team Details</h4>
                            <p><strong>Team Name:</strong> {team.team_name}</p>
                            <p><strong>School:</strong> {team.school}</p>
                            <p><strong>Category:</strong> {team.category}</p>
                            <p><strong>Thematic Focus:</strong> {team.thematic_focus}</p>
                            <p><strong>Province:</strong> {team.province}</p>
                            <p><strong>Project Description:</strong> {team.project_description}</p>
                            <p><strong>How heard:</strong> {team.how_heard}</p>
                        </div>
                        <div className="review-section">
                            <h4>Students ({students.length})</h4>
                            {students.map(s => <p key={s.id}>{s.first_name} {s.surname} – Grade {s.grade}, {s.role}</p>)}
                        </div>
                        <div className="review-section">
                            <h4>Coach</h4>
                            <p>{coach.first_name} {coach.surname} ({coach.email}, {coach.phone_no})</p>
                        </div>
                        <div className="review-section">
                            <h4>Documents</h4>
                            <ul>
                                <li>Bill of Materials: {team.material_bill?.name || '✔️ Uploaded'}</li>
                                <li>Engineering Plan: {team.engineering_plan?.name || '✔️ Uploaded'}</li>
                                <li>Project Report: {team.project_report?.name || '✔️ Uploaded'}</li>
                                <li>Engineering Journal: {team.engineering_journal?.name || '✔️ Uploaded'}</li>
                                <li>Student consents: {students.length} files</li>
                                <li>Student integrity declarations: {students.length} files</li>
                                <li>Coach integrity declaration: {coach.signed_integrity_declaration?.name || '✔️ Uploaded'}</li>
                            </ul>
                        </div>
                        <div className="step-buttons">
                            <button className="btn-prev" onClick={prevStep}>Back</button>
                            <button className="btn-submit" onClick={handleSubmit} disabled={submitting}>
                                {submitting ? 'Submitting...' : 'Submit Registration'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Register;