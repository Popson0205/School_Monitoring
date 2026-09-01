import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@demo-tenant.test');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h1 style={styles.title}>School Monitor</h1>
        <p style={styles.subtitle}>Sign in to your ministry / institution account</p>

        <label style={styles.label}>Email</label>
        <input
          style={styles.input}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label style={styles.label}>Password</label>
        <input
          style={styles.input}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p style={styles.error}>{error}</p>}

        <button style={styles.button} type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f172a',
    fontFamily: 'system-ui, sans-serif',
  },
  form: {
    background: '#fff',
    padding: '2.5rem',
    borderRadius: 12,
    width: 340,
    boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
  },
  title: { margin: 0, fontSize: 22, color: '#0f172a' },
  subtitle: { marginTop: 6, marginBottom: 24, color: '#64748b', fontSize: 14 },
  label: { display: 'block', fontSize: 13, color: '#334155', marginBottom: 6, marginTop: 14 },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #cbd5e1',
    fontSize: 14,
    boxSizing: 'border-box',
  },
  error: { color: '#dc2626', fontSize: 13, marginTop: 12 },
  button: {
    width: '100%',
    marginTop: 24,
    padding: '10px 12px',
    borderRadius: 8,
    border: 'none',
    background: '#0f172a',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
};
