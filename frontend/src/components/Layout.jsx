import { Suspense, useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { getToken, setToken } from '../api.js';
import { Skeleton } from './ui.jsx';

const CLIENT_NAV = [
  { to: '/', label: 'Find Collection', end: true },
  { to: '/report', label: 'Report Issue' },
  { to: '/staff', label: 'Staff Login' },
];
const ADMIN_NAV = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/routes', label: 'Routes & Fees' },
  { to: '/admin/reports', label: 'Reports' },
];

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [menu, setMenu] = useState(false);
  const isAdmin = location.pathname.startsWith('/admin');
  const loggedIn = !!getToken();

  // Scroll to top + close mobile menu on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    setMenu(false);
  }, [location.pathname]);

  const logout = () => {
    setToken('');
    navigate('/staff');
  };

  const links = isAdmin ? ADMIN_NAV : CLIENT_NAV.filter((l) => !(l.to === '/staff' && loggedIn));
  const dur = reduce ? 0 : 0.3;

  return (
    <div className={`app ${isAdmin ? 'is-admin' : ''}`}>
      <div className="bg" aria-hidden="true" />

      {/* subtle progress bar on each page change */}
      {!reduce && (
        <motion.div
          key={location.pathname}
          className="progress"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', opacity: { delay: 0.4, duration: 0.2 } }}
        />
      )}

      <header className="nav-wrap">
        <nav className="nav glass" aria-label="Main">
          <Link to={isAdmin ? '/admin' : '/'} className="brand">
            Clean<em>Lanka</em>
            {isAdmin && <span className="brand-tag">Staff</span>}
          </Link>
          <button
            type="button"
            className="menu-btn"
            aria-expanded={menu}
            aria-controls="nav-links"
            onClick={() => setMenu((m) => !m)}
          >
            {menu ? 'Close' : 'Menu'}
          </button>
          <div id="nav-links" className={`nav-links ${menu ? 'open' : ''}`}>
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className="nav-link">
                {l.label}
              </NavLink>
            ))}
            {isAdmin && (
              <button type="button" className="nav-link as-btn" onClick={logout}>
                Logout
              </button>
            )}
          </div>
        </nav>
      </header>

      <main className="container">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: reduce ? 0 : 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : -12 }}
            transition={{ duration: dur, ease: 'easeOut' }}
          >
            <Suspense
              fallback={
                <div className="glass pad" role="status" aria-label="Loading page">
                  <Skeleton lines={4} />
                </div>
              }
            >
              {children}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="footer">
        <span>© {new Date().getFullYear()} Clean Lanka</span>
        <span>Sri Lanka Waste Collection · Sample schedules for demonstration</span>
      </footer>
    </div>
  );
}
