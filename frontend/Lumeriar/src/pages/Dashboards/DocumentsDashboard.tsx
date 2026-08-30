// src/pages/Dashboards/DocumentsDashboard.tsx
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import "../../layout/dashboard.css";
import { API_BASE } from '../../api/client';  // adjust path

interface Document {
    document_id: number;
    name: string;
    description: string;
    version: string;
    file_name: string;
    upload_date: string;
    is_current: number;
}

const emptyForm = () => ({
    name: "",
    description: "",
    version: "",
    file: null as File | null,
});

function UploadModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
    const [form, setForm] = useState(emptyForm());
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const setField = (field: string, value: any) => setForm(f => ({ ...f, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.version || !form.file) {
            setError("Name, version, and file are required.");
            return;
        }
        setUploading(true);
        setError("");
        const data = new FormData();
        data.append("name", form.name);
        data.append("description", form.description);
        data.append("version", form.version);
        data.append("file", form.file);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/api/documents`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: data,
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Upload failed");
            }
            onSaved();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    return createPortal(
        <div className="tdm-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="tdm-box">
                <div className="tdm-head">
                    <h2 className="tdm-title">Upload New Document Version</h2>
                    <button className="tdm-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit} className="tdm-form">
                    <div className="tdm-field">
                        <label className="tdm-label">Document Name *</label>
                        <select className="tdm-input" value={form.name} onChange={e => setField("name", e.target.value)} required>
                            <option value="">-- Select Document --</option>
                            <option value="Judges Manual">Judges Manual</option>
                            <option value="Judge Training Course">Judge Training Course</option>
                            <option value="Official Tournament Handbook">Official Tournament Handbook</option>
                        </select>
                    </div>
                    <div className="tdm-field">
                        <label className="tdm-label">Version *</label>
                        <input className="tdm-input" value={form.version} onChange={e => setField("version", e.target.value)} placeholder="e.g., 2.0" required />
                    </div>
                    <div className="tdm-field">
                        <label className="tdm-label">Description (optional)</label>
                        <textarea className="tdm-input" rows={2} value={form.description} onChange={e => setField("description", e.target.value)} />
                    </div>
                    <div className="tdm-field">
                        <label className="tdm-label">PDF File *</label>
                        <input type="file" accept=".pdf" onChange={e => setField("file", e.target.files?.[0] || null)} required />
                    </div>
                    {error && <p className="tdm-error">{error}</p>}
                    <div className="tdm-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={uploading}>
                            {uploading ? <span className="spinner-sm" /> : "Upload"}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}

function DeleteConfirm({ doc, onClose, onDeleted }: { doc: Document; onClose: () => void; onDeleted: () => void }) {
    const [loading, setLoading] = useState(false);
    const confirm = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/api/documents/${doc.document_id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error("Delete failed");
            onDeleted();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };
    return createPortal(
        <div className="tdm-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="tdm-box tdm-box-sm">
                <div className="tdm-head">
                    <h2 className="tdm-title">Delete Document Version</h2>
                    <button className="tdm-close" onClick={onClose}>×</button>
                </div>
                <p>Delete <strong>{doc.name} v{doc.version}</strong>? This action cannot be undone.</p>
                <div className="tdm-actions">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn-danger" onClick={confirm} disabled={loading}>
                        {loading ? <span className="spinner-sm" /> : "Delete"}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default function DocumentsDashboard() {
    const [docs, setDocs] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUpload, setShowUpload] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/api/documents/all`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            setDocs(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const getDownloadUrl = (id: number) => `${API_BASE}/api/documents/${id}/download`;

    return (
        <div className="td-root">
            <div className="td-header">
                <div>
                    <h1 className="td-title">Documents Management</h1>
                    <p className="td-subtitle">Upload new versions of official documents</p>
                </div>
                <button className="btn-primary" onClick={() => setShowUpload(true)}>Upload New Version</button>
            </div>

            <div className="td-table-wrap">
                {loading ? (
                    <div className="td-loading"><span className="spinner-lg" /></div>
                ) : docs.length === 0 ? (
                    <div className="td-empty">No documents uploaded yet.</div>
                ) : (
                    <table className="td-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Version</th>
                                <th>Description</th>
                                <th>File Name</th>
                                <th>Upload Date</th>
                                <th>Current</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {docs.map(doc => (
                                <tr key={doc.document_id}>
                                    <td>{doc.name}</td>
                                    <td>{doc.version}</td>
                                    <td>{doc.description || "—"}</td>
                                    <td>{doc.file_name}</td>
                                    <td>{new Date(doc.upload_date).toLocaleDateString()}</td>
                                    <td>{doc.is_current ? "✅" : "—"}</td>
                                    <td className="td-actions">
                                        <a href={getDownloadUrl(doc.document_id)} className="btn-icon" download title="Download">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="7 10 12 15 17 10" />
                                                <line x1="12" y1="15" x2="12" y2="3" />
                                            </svg>
                                        </a>
                                        <button className="btn-icon delete" onClick={() => setDeleteTarget(doc)} title="Delete">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showUpload && <UploadModal onClose={() => setShowUpload(false)} onSaved={() => { setShowUpload(false); load(); }} />}
            {deleteTarget && <DeleteConfirm doc={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={() => { setDeleteTarget(null); load(); }} />}
        </div>
    );
}