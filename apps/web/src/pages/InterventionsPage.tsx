import { useEffect, useState } from 'react';
import { api, Intervention } from '../lib/api';

const STATUS_OPTIONS = ['PLANNED', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

const STATUS_COLOR: Record<string, string> = {
  PLANNED: '#94a3b8',
  APPROVED: '#0ea5e9',
  IN_PROGRESS: '#f59e0b',
  COMPLETED: '#16a34a',
  CANCELLED: '#dc2626',
};

export default function InterventionsPage() {
  const [items, setItems] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    api
      .getInterventions()
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleStatusChange(id: string, status: string) {
    await api.updateInterventionStatus(id, status);
    load();
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Interventions</h1>
      <p style={{ color: '#64748b', marginTop: -8 }}>
        Material distribution, repairs, and security deployments — planned through to
        completion.
      </p>

      {error && <p style={{ color: '#dc2626' }}>{error}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : items.length === 0 ? (
        <p style={{ color: '#64748b' }}>No interventions recorded yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
          {items.map((item) => (
            <div key={item.id} style={styles.row}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{item.institution?.name ?? item.institutionId}</div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                  {item.type.replace(/_/g, ' ')} {item.description ? `· ${item.description}` : ''}
                </div>
                {item.budget && (
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                    Budget: ₦{item.budget.toLocaleString()}
                  </div>
                )}
              </div>
              <span style={{ ...styles.badge, background: STATUS_COLOR[item.status] }}>
                {item.priority}
              </span>
              <select
                value={item.status}
                onChange={(e) => handleStatusChange(item.id, e.target.value)}
                style={styles.select}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    background: '#fff',
    borderRadius: 10,
    padding: '14px 18px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  badge: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    padding: '4px 10px',
    borderRadius: 999,
  },
  select: {
    padding: '6px 10px',
    borderRadius: 6,
    border: '1px solid #cbd5e1',
    fontSize: 13,
  },
};
