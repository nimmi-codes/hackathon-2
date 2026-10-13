import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminReports, adminRoutes } from '../../api.js';
import { useToast } from '../../components/Toast.jsx';
import { EmptyState, Hero, Skeleton, StatusBadge } from '../../components/ui.jsx';

const TYPES = { missed_pickup: 'Missed pickup', illegal_dumping: 'Illegal dumping' };

export default function Dashboard() {
  const toast = useToast();
  const [data, setData] = useState(null);

  useEffect(() => {
    Promise.all([adminRoutes(), adminReports()])
      .then(([routes, reports]) => setData({ routes, reports }))
      .catch((e) => toast(e.message, 'error'));
  }, [toast]);

  const count = (s) => data.reports.filter((r) => r.status === s).length;

  return (
    <>
      <Hero chip="Staff portal" before="Operations" accent="overview" />
      <div className="stats">
        {['Routes', 'Pending', 'In Progress', 'Resolved'].map((label) => (
          <div className="stat glass" key={label}>
            <span className="muted">{label}</span>
            {data ? (
              <strong>{label === 'Routes' ? data.routes.length : count(label)}</strong>
            ) : (
              <Skeleton lines={1} />
            )}
          </div>
        ))}
      </div>

      <h2 className="section-title">Latest reports</h2>
      {!data && <div className="glass pad"><Skeleton lines={4} /></div>}
      {data && data.reports.length === 0 && (
        <EmptyState icon="🌿" title="No reports yet" text="New citizen reports will show up here." />
      )}
      {data && data.reports.length > 0 && (
        <div className="glass table-wrap">
          <table>
            <thead><tr><th>Type</th><th>Area</th><th>Status</th><th>Filed</th></tr></thead>
            <tbody>
              {data.reports.slice(0, 5).map((r) => (
                <tr key={r._id}>
                  <td>{TYPES[r.type]}</td>
                  <td>{r.area}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p><Link className="btn" to="/admin/reports">Manage reports →</Link></p>
    </>
  );
}
