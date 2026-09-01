import { useEffect, useState } from 'react';
import { api, SecurityIncident } from '../lib/api';

const STATUS_OPTIONS = ['REPORTED', 'VERIFIED', 'RESPONSE_DISPATCHED', 'RESOLVED', 'FALSE_ALARM'];

const SEVERITY_COLOR: Record<string, string> = {
  LOW: '#94a3b8',
  MEDIUM: '#eab308',
  HIGH: '#f59e0b',
  CRITICAL: '#dc2626',
};

export default function IncidentsPage() {
  const [items, setItems] = useState<SecurityIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    api
      .getIncidents()
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleStatusChange(id: string, status: string) {
    await api.updateIncidentStatus(id, status);
    load();
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Security Incidents</h1>
      <p style={{ color: '#64748b', marginTop: -8 }}>
        Reported incidents driving rescue and security response — separate from routine
        facility inspection.
      </p>

      {error && <p style={{ color: '#dc2626' }}>{error}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : items.length === 0 ? (
        <p style={{ color: '#64748b' }}>No incidents reported.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
          {items.map((item) => (
            <div key={item.id} style={styles.row}>
              <div
                style={{ ...styles.severityBar, background: SEVERITY_COLOR[item.severity] }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{item.institution?.name ?? item.institutionId}</div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                  {item.type.replace(/_/g, ' ')} {item.description ? `· ${item.description}` : ''}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                  Occurred {new Date(item.occurredAt).toLocaleString()}
                </div>
              </div>
              <span style={{ ...styles.badge, background: SEVERITY_COLOR[item.severity] }}>
                {item.severity}
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
  severityBar: { width: 4, alignSelf: 'stretch', borderRadius: 2 },
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
