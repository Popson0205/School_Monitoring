import { FormEvent, useEffect, useState } from 'react';
import { api, Institution } from '../lib/api';

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    api
      .getInstitutions()
      .then(setInstitutions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Institutions</h1>
        <button style={styles.addBtn} onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : '+ Add Institution'}
        </button>
      </div>

      {showForm && (
        <AddInstitutionForm
          onCreated={() => {
            setShowForm(false);
            load();
          }}
        />
      )}

      {error && <p style={{ color: '#dc2626' }}>{error}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Ownership</th>
              <th style={styles.th}>Coordinates</th>
            </tr>
          </thead>
          <tbody>
            {institutions.map((inst) => (
              <tr key={inst.id}>
                <td style={styles.td}>{inst.name}</td>
                <td style={styles.td}>{inst.type}</td>
                <td style={styles.td}>{inst.ownership}</td>
                <td style={styles.td}>
                  {inst.lat.toFixed(4)}, {inst.lng.toFixed(4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function AddInstitutionForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('PRIMARY');
  const [ownership, setOwnership] = useState('GOVERNMENT');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.createInstitution({
        name,
        type,
        ownership,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        address: address || undefined,
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create institution');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formGrid}>
        <Field label="Name">
          <input value={name} onChange={(e) => setName(e.target.value)} required style={styles.input} />
        </Field>
        <Field label="Type">
          <select value={type} onChange={(e) => setType(e.target.value)} style={styles.input}>
            <option value="PRIMARY">Primary</option>
            <option value="SECONDARY">Secondary</option>
            <option value="UNIVERSITY">University</option>
          </select>
        </Field>
        <Field label="Ownership">
          <select value={ownership} onChange={(e) => setOwnership(e.target.value)} style={styles.input}>
            <option value="GOVERNMENT">Government</option>
            <option value="PRIVATE">Private</option>
          </select>
        </Field>
        <Field label="Latitude">
          <input
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            required
            type="number"
            step="any"
            style={styles.input}
          />
        </Field>
        <Field label="Longitude">
          <input
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            required
            type="number"
            step="any"
            style={styles.input}
          />
        </Field>
        <Field label="Address (optional)">
          <input value={address} onChange={(e) => setAddress(e.target.value)} style={styles.input} />
        </Field>
      </div>
      {error && <p style={{ color: '#dc2626', fontSize: 13 }}>{error}</p>}
      <button type="submit" style={styles.submitBtn} disabled={submitting}>
        {submitting ? 'Saving…' : 'Save Institution'}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  addBtn: {
    background: '#0f172a',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '8px 14px',
    fontSize: 13,
    cursor: 'pointer',
  },
  form: {
    background: '#fff',
    borderRadius: 10,
    padding: 20,
    margin: '16px 0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 14,
  },
  input: {
    width: '100%',
    padding: '8px 10px',
    borderRadius: 6,
    border: '1px solid #cbd5e1',
    fontSize: 13,
    boxSizing: 'border-box',
  },
  submitBtn: {
    marginTop: 16,
    background: '#0ea5e9',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '9px 16px',
    fontSize: 13,
    cursor: 'pointer',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 16,
  },
  th: {
    textAlign: 'left',
    padding: '10px 16px',
    fontSize: 12,
    color: '#64748b',
    borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '12px 16px',
    fontSize: 14,
    borderBottom: '1px solid #f1f5f9',
  },
};
