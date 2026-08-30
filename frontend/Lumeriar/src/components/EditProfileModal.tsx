// src/components/EditProfileModal.tsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';

interface EditProfileModalProps {
    onClose: () => void;
    onSaved: () => void;
}

export default function EditProfileModal({ onClose, onSaved }: EditProfileModalProps) {
    const { token, role } = useAuth(); // get role
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        first_name: '',
        surname: '',
        phone_no: '',
        date_of_birth: '',
        shirt_size: '',
        dietary_requirements: '',
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/auth/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.message || 'Failed to load profile');
                }
                const data = await res.json();
                setForm({
                    first_name: data.first_name || '',
                    surname: data.surname || '',
                    phone_no: data.phone_no || '',
                    date_of_birth: data.date_of_birth ? new Date(data.date_of_birth).toISOString().split('T')[0] : '',
                    shirt_size: data.shirt_size || '',
                    dietary_requirements: data.dietary_requirements || '',
                });
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [token]);

    const handleChange = (field: string, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Update failed');
            }
            alert('Profile updated successfully!');
            onSaved();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="td-loading"><span className="spinner-lg" /></div>;

    const isCoach = role === 'coach';

    return createPortal(
        <div className="tdm-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="tdm-box" onClick={(e) => e.stopPropagation()}>
                <div className="tdm-head">
                    <h2 className="tdm-title">Edit Profile</h2>
                    <button className="tdm-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit} className="tdm-form">
                    <div className="tdm-row">
                        <div className="tdm-field">
                            <label className="tdm-label">First Name</label>
                            <input
                                type="text"
                                className="tdm-input"
                                value={form.first_name}
                                onChange={(e) => handleChange('first_name', e.target.value)}
                            />
                        </div>
                        <div className="tdm-field">
                            <label className="tdm-label">Surname</label>
                            <input
                                type="text"
                                className="tdm-input"
                                value={form.surname}
                                onChange={(e) => handleChange('surname', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="tdm-row">
                        <div className="tdm-field">
                            <label className="tdm-label">Phone Number</label>
                            <input
                                type="tel"
                                className="tdm-input"
                                value={form.phone_no}
                                onChange={(e) => handleChange('phone_no', e.target.value)}
                            />
                        </div>
                        <div className="tdm-field">
                            <label className="tdm-label">Date of Birth</label>
                            <input
                                type="date"
                                className="tdm-input"
                                value={form.date_of_birth}
                                onChange={(e) => handleChange('date_of_birth', e.target.value)}
                            />
                        </div>
                    </div>
                    {isCoach && (
                        <>
                            <div className="tdm-row">
                                <div className="tdm-field">
                                    <label className="tdm-label">Shirt Size</label>
                                    <select
                                        className="tdm-input"
                                        value={form.shirt_size}
                                        onChange={(e) => handleChange('shirt_size', e.target.value)}
                                    >
                                        <option value="">Select</option>
                                        <option>XS</option>
                                        <option>S</option>
                                        <option>M</option>
                                        <option>L</option>
                                        <option>XL</option>
                                    </select>
                                </div>
                                <div className="tdm-field">
                                    <label className="tdm-label">Dietary Requirements</label>
                                    <input
                                        type="text"
                                        className="tdm-input"
                                        value={form.dietary_requirements}
                                        onChange={(e) => handleChange('dietary_requirements', e.target.value)}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                    {error && <p className="tdm-error">{error}</p>}
                    <div className="tdm-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}