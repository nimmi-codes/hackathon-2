import { useState } from 'react';
import { motion } from 'framer-motion';
import { createReport, getReports } from '../api.js';
import { useToast } from '../components/Toast.jsx';
import { EmptyState, Hero, SkeletonGrid, StatusBadge } from '../components/ui.jsx';

const TYPES = {
  missed_pickup: 'Missed pickup',
  illegal_dumping: 'Illegal dumping',
};

const empty = { type: 'missed_pickup', area: '', description: '', reporterName: '', contact: '' };

export default function ReportIssue() {
  const toast = useToast();
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);

  const [lookup, setLookup] = useState('');
  const [reports, setReports] = useState(null);
  const [loadingReports, setLoadingReports] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const loadReports = async (contact) => {
    setLoadingReports(true);
    try {
      setReports(await getReports(contact));
    } catch (err) {
      toast(err.message, 'error');
      setReports(null);
    } finally {
      setLoadingReports(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createReport(form);
      toast('Report submitted. Track it below with your contact details.');
      setLookup(form.contact);
      await loadReports(form.contact);
      setForm(empty);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Hero chip="Help keep Sri Lanka clean" before="Report an" accent="issue">
        <p className="lede">Missed pickup or illegal dumping? Tell us and follow the status of your report.</p>
      </Hero>

      <div className="two-col">
        <form className="form glass pad" onSubmit={onSubmit}>
          <h2>New report</h2>
          <label>
            Issue type
            <select value={form.type} onChange={set('type')}>
              {Object.entries(TYPES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <label>
            Area / location
            <input required value={form.area} onChange={set('area')} placeholder="e.g. Nugegoda, High Level Rd" />
          </label>
          <label>
            Description
            <textarea required rows={4} maxLength={1000} value={form.description} onChange={set('description')} />
          </label>
          <label>
            Your name
            <input required value={form.reporterName} onChange={set('reporterName')} />
          </label>
          <label>
            Phone or email (used to track your reports)
            <input required value={form.contact} onChange={set('contact')} />
          </label>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit report'}
          </button>
        </form>

        <div className="tracker">
          <form
            className="form glass pad"
            onSubmit={(e) => { e.preventDefault(); loadReports(lookup.trim()); }}
          >
            <h2>Track your reports</h2>
            <div className="row">
              <input
                required
                aria-label="Phone or email used in report"
                value={lookup}
                onChange={(e) => setLookup(e.target.value)}
                placeholder="Phone or email used in report"
              />
              <button type="submit" className="btn">View status</button>
            </div>
          </form>

          <div className="stack">
            {loadingReports && <SkeletonGrid count={2} />}
            {!loadingReports && reports === null && (
              <EmptyState icon="📋" title="No reports loaded" text="Enter your phone or email to see the status of your reports." />
            )}
            {!loadingReports && reports && reports.length === 0 && (
              <EmptyState icon="🌿" title="No reports found" text="Nothing is filed under that contact yet." />
            )}
            {!loadingReports && reports?.map((r, i) => (
              <motion.article
                className="card glass"
                key={r._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 6) * 0.06, duration: 0.35 }}
              >
                <div className="card-top">
                  <h3>{TYPES[r.type]}</h3>
                  <StatusBadge status={r.status} />
                </div>
                <p className="muted">{r.area} · {new Date(r.createdAt).toLocaleString()}</p>
                <p>{r.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
