import { useCallback, useEffect, useState } from 'react';
import { adminReports, adminSetStatus } from '../../api.js';
import { useToast } from '../../components/Toast.jsx';
import { EmptyState, Hero, SkeletonRows, StatusBadge } from '../../components/ui.jsx';

const TYPES = { missed_pickup: 'Missed pickup', illegal_dumping: 'Illegal dumping' };
const STATUSES = ['Pending', 'In Progress', 'Resolved'];

export default function AdminReports() {
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [filter, setFilter] = useState('All');

  const load = useCallback(() => {
    adminReports().then(setRows).catch((e) => { toast(e.message, 'error'); setRows([]); });
  }, [toast]);
  useEffect(load, [load]);

  const change = async (r, status) => {
    try {
      const updated = await adminSetStatus(r._id, status);
      setRows((x) => x.map((i) => (i._id === r._id ? updated : i)));
      toast(`Marked ${status.toLowerCase()}`);
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const shown = rows && (filter === 'All' ? rows : rows.filter((r) => r.status === filter));

  return (
    <>
      <Hero chip="Staff portal" before="Citizen" accent="reports" />
      <div className="toolbar" role="group" aria-label="Filter by status">
        {['All', ...STATUSES].map((s) => (
          <button
            key={s}
            type="button"
            className={`btn sm ${filter === s ? 'btn-primary' : ''}`}
            aria-pressed={filter === s}
            onClick={() => setFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {rows === null && <SkeletonRows />}
      {shown && shown.length === 0 && (
        <EmptyState
          icon="🌿"
          title={rows.length === 0 ? 'No reports yet' : 'No reports in this status'}
          text={rows.length === 0 ? 'New citizen reports will show up here.' : 'Try another filter.'}
        />
      )}
      {shown && shown.length > 0 && (
        <div className="glass table-wrap">
          <table>
            <thead>
              <tr><th>Type</th><th>Area</th><th>Description</th><th>Reporter</th><th>Filed</th><th>Status</th></tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r._id}>
                  <td data-label="Type">{TYPES[r.type]}</td>
                  <td data-label="Area">{r.area}</td>
                  <td data-label="Description" className="desc">{r.description}</td>
                  <td data-label="Reporter">{r.reporterName}<small className="muted block">{r.contact}</small></td>
                  <td data-label="Filed">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td data-label="Status">
                    <StatusBadge status={r.status} />
                    <select
                      className="status-select"
                      aria-label={`Change status for report in ${r.area}`}
                      value={r.status}
                      onChange={(e) => change(r, e.target.value)}
                    >
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
