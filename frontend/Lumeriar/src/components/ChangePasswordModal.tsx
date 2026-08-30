// src/components/ChangePasswordModal.tsx
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../api/client';  // adjust path

interface ChangePasswordModalProps {
    onClose: () => void;
    onSaved: () => void;
}

export default function ChangePasswordModal({ onClose, onSaved }: ChangePasswordModalProps) {
    const { token } = useAuth();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE}/api/auth/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    old_password: oldPassword,
                    new_password: newPassword,
                }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Change failed');
            }
            alert('Password changed successfully!');
            onSaved();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return createPortal(
        <div className="tdm-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="tdm-box" onClick={(e) => e.stopPropagation()}>
                <div className="tdm-head">
                    <h2 className="tdm-title">Change Password</h2>
                    <button className="tdm-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit} className="tdm-form">
                    <div className="tdm-field">
                        <label className="tdm-label">Current Password</label>
                        <input
                            type="password"
                            className="tdm-input"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="tdm-field">
                        <label className="tdm-label">New Password</label>
                        <input
                            type="password"
                            className="tdm-input"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={8}
                        />
                    </div>
                    <div className="tdm-field">
                        <label className="tdm-label">Confirm New Password</label>
                        <input
                            type="password"
                            className="tdm-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={8}
                        />
                    </div>
                    {error && <p className="tdm-error">{error}</p>}
                    <div className="tdm-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : 'Change Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}