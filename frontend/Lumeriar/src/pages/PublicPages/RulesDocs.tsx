import React, { useState, useEffect } from 'react';
import '../../layout/events.css'; // reuse existing public page styles

interface Document {
    document_id: number;
    name: string;
    description: string;
    version: string;
    file_name: string;
    upload_date: string;
}

const RulesDocs: React.FC = () => {
    const [docs, setDocs] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const res = await fetch('/api/documents');
                if (!res.ok) throw new Error('Failed to load documents');
                const data = await res.json();
                setDocs(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDocuments();
    }, []);

    if (loading) return <div className="events-loading">Loading documents...</div>;
    if (error) return <div className="events-error">Error: {error}</div>;

    const getDownloadUrl = (id: number) => `/api/documents/${id}/download`;

    return (
        <div className="events-page">
            <h1>Rules & Documents</h1>
            <p>Download the official documents for judges and tournament participants.</p>

            <div className="docs-list" style={{ marginTop: '2rem' }}>
                {docs.map(doc => (
                    <div key={doc.document_id} className="doc-card" style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        marginBottom: '1rem',
                    }}>
                        <h3>{doc.name}</h3>
                        <p>{doc.description || 'No description provided.'}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <span>Version: {doc.version} | Uploaded: {new Date(doc.upload_date).toLocaleDateString()}</span>
                            <a href={getDownloadUrl(doc.document_id)} className="btn-details" download>
                                Download PDF
                            </a>
                        </div>
                    </div>
                ))}
                {docs.length === 0 && <p>No documents available at this time.</p>}
            </div>
        </div>
    );
};

export default RulesDocs;