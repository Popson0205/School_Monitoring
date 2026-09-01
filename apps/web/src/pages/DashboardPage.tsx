import { useEffect, useState } from 'react';
import { api, DashboardSummary, PriorityEntry } from '../lib/api';

function scoreColor(score: number) {
  if (score >= 15) return '#dc2626';
  if (score >= 8) return '#f59e0b';
  if (score > 0) return '#eab308';
  return '#16a34a';
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [ranking, setRanking] = useState<PriorityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getSummary(), api.getPriorityRanking()])
      .then(([s, r]) => {
        setSummary(s);
        setRanking(r);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading dashboard…</p>;
  if (error) return <p style={{ color: '#dc2626' }}>{error}</p>;

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Priority Dashboard</h1>
      <p style={{ color: '#64748b', marginTop: -8 }}>
        Institutions ranked by urgency — combining facility condition, missing critical
        infrastructure, open security incidents, and enrollment size.
      </p>

      <div style={styles.kpiRow}>
        <KpiCard label="Total Institutions" value={summary?.totalInstitutions ?? 0} />
        <KpiCard
          label="Critical Priority"
          value={summary?.criticalPriorityCount ?? 0}
          accent="#dc2626"
        />
        <KpiCard
          label="Open Security Incidents"
          value={summary?.openSecurityIncidents ?? 0}
          accent="#f59e0b"
        />
        <KpiCard
          label="Active Interventions"
          value={summary?.activeInterventions ?? 0}
          accent="#0ea5e9"
        />
        <KpiCard
          label="Facilities Needing Attention"
          value={summary?.facilitiesNeedingAttention ?? 0}
          accent="#eab308"
        />
      </div>

      <h2 style={{ marginTop: 32 }}>Ranked by Urgency</h2>
      <div style={styles.list}>
        {ranking.length === 0 && <p style={{ color: '#64748b' }}>No data yet.</p>}
        {ranking.map((entry, idx) => (
          <div key={entry.institutionId} style={styles.row}>
            <div style={{ ...styles.rank, background: scoreColor(entry.score) }}>{idx + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{entry.institutionName}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                {entry.reasons.length > 0 ? entry.reasons.join(' · ') : 'No urgent issues flagged'}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                {entry.openIncidentCount} open incident(s) · {entry.activeInterventionCount}{' '}
                active intervention(s)
              </div>
            </div>
            <div style={{ ...styles.score, color: scoreColor(entry.score) }}>{entry.score}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KpiCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div style={styles.kpiCard}>
      <div style={{ fontSize: 28, fontWeight: 700, color: accent ?? '#0f172a' }}>{value}</div>
      <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{label}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  kpiRow: { display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 20 },
  kpiCard: {
    background: '#fff',
    borderRadius: 10,
    padding: '18px 20px',
    minWidth: 160,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  list: { display: 'flex', flexDirection: 'column', gap: 8 },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    background: '#fff',
    borderRadius: 10,
    padding: '14px 18px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  rank: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
    flexShrink: 0,
  },
  score: { fontSize: 20, fontWeight: 700, minWidth: 40, textAlign: 'right' },
};
