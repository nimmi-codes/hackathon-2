import { lazy, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import CustomCursor from './components/CustomCursor.jsx';
import CollectionFinder from './pages/CollectionFinder.jsx';
import ReportIssue from './pages/ReportIssue.jsx';
import StaffLogin from './pages/StaffLogin.jsx';
import { getToken } from './api.js';

const Dashboard = lazy(() => import('./pages/admin/Dashboard.jsx'));
const AdminRoutes = lazy(() => import('./pages/admin/AdminRoutes.jsx'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports.jsx'));

function Protected({ children }) {
  return getToken() ? children : <Navigate to="/staff" replace />;
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // api.js fires this when the server rejects the staff token
  useEffect(() => {
    const onExpired = () => navigate('/staff');
    window.addEventListener('cl-auth-expired', onExpired);
    return () => window.removeEventListener('cl-auth-expired', onExpired);
  }, [navigate]);

  return (
    <>
    <CustomCursor />
    <Layout>
      {/* pass location so the exiting page keeps rendering its own route */}
      <Routes location={location}>
        <Route path="/" element={<CollectionFinder />} />
        <Route path="/report" element={<ReportIssue />} />
        <Route path="/staff" element={<StaffLogin />} />
        <Route path="/admin" element={<Protected><Dashboard /></Protected>} />
        <Route path="/admin/routes" element={<Protected><AdminRoutes /></Protected>} />
        <Route path="/admin/reports" element={<Protected><AdminReports /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
    </>
  );
}
