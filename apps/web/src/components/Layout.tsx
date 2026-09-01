import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/auth';

const navItems = [
  { to: '/', label: 'Priority Dashboard', end: true },
  { to: '/map', label: 'Map' },
  { to: '/institutions', label: 'Institutions' },
  { to: '/interventions', label: 'Interventions' },
  { to: '/incidents', label: 'Security Incidents' },
];

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div style={styles.wrapper}>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>School Monitor</div>
        <nav style={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.navLinkActive : {}),
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={styles.userBox}>
          <div style={{ fontSize: 13, color: '#cbd5e1' }}>{user?.email}</div>
          <button style={styles.logoutBtn} onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: { display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' },
  sidebar: {
    width: 220,
    background: '#0f172a',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 0',
  },
  brand: { fontWeight: 700, fontSize: 16, padding: '0 20px 20px' },
  nav: { display: 'flex', flexDirection: 'column', gap: 2, flex: 1 },
  navLink: {
    padding: '10px 20px',
    color: '#cbd5e1',
    textDecoration: 'none',
    fontSize: 14,
  },
  navLinkActive: {
    background: '#1e293b',
    color: '#fff',
    borderLeft: '3px solid #38bdf8',
  },
  userBox: { padding: '16px 20px', borderTop: '1px solid #1e293b' },
  logoutBtn: {
    marginTop: 8,
    background: 'transparent',
    border: '1px solid #334155',
    color: '#e2e8f0',
    borderRadius: 6,
    padding: '6px 10px',
    fontSize: 12,
    cursor: 'pointer',
  },
  main: { flex: 1, background: '#f8fafc', padding: '28px 32px', overflowY: 'auto' },
};
