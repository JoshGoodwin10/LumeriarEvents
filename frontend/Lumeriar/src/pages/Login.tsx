import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { role } = await login(email, password);
      if (role === 'admin') {
        navigate('/dashboard');
      } else if (role === 'judge') {
        navigate('/judge/view');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="name@example.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="login-button">Sign in</button>
        </form>
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          padding: 1rem;
        }
        .login-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          padding: 2rem;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .login-header h1 {
          font-size: 1.8rem;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 0.5rem;
        }
        .login-header p {
          color: #94a3b8;
          font-size: 0.9rem;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .form-group label {
          font-size: 0.85rem;
          font-weight: 500;
          color: #cbd5e1;
          letter-spacing: 0.025em;
        }
        .form-group input {
          padding: 0.75rem 1rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #f1f5f9;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        .form-group input:focus {
          outline: none;
          border-color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
        }
        .form-group input::placeholder {
          color: #475569;
        }
        .error-message {
          background: rgba(239, 68, 68, 0.2);
          border-left: 3px solid #ef4444;
          color: #fecaca;
          padding: 0.75rem;
          border-radius: 12px;
          font-size: 0.85rem;
        }
        .login-button {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border: none;
          border-radius: 12px;
          padding: 0.85rem;
          font-weight: 600;
          font-size: 0.95rem;
          color: white;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
        }
        .login-button:hover {
          opacity: 0.9;
        }
        .login-button:active {
          transform: scale(0.98);
        }
        @media (max-width: 480px) {
          .login-card { padding: 1.5rem; }
          .login-header h1 { font-size: 1.5rem; }
        }
      `}</style>
    </div>
  );
}