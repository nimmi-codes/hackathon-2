import { useState } from 'react';
import { createReport, getReports } from '../api.js';

const TYPES = {
  missed_pickup: 'Missed pickup',
  illegal_dumping: 'Illegal dumping',
};

const empty = { type: 'missed_pickup', area: '', description: '', reporterName: '', contact: '' };

export default function ReportIssue() {
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [lookup, setLookup] = useState('');
  const [reports, setReports] = useState(null);
  const [lookupError, setLookupError] = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const loadReports = async (contact) => {
    setLookupError('');
    try {
      setReports(await getReports(contact));
    } catch (err) {
      setLookupError(err.message);
      setReports(null);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      await createReport(form);
      setMessage('Report submitted. You can track it below using your contact details.');
      setLookup(form.contact);
      await loadReports(form.contact);
      setForm(empty);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section>
      <h2>Report an issue</h2>
      <form className="form" onSubmit={onSubmit}>
        <label>
          Issue type
          <select value={form.type} onChange={set('type')}>
            {Object.entries(TYPES).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
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
        <button type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit report'}</button>
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
      </form>

      <h2>Track your reports</h2>
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          loadReports(lookup.trim());
        }}
      >
        <input required value={lookup} onChange={(e) => setLookup(e.target.value)} placeholder="Phone or email used in report" />
        <button type="submit">View status</button>
      </form>
      {lookupError && <p className="error">{lookupError}</p>}
      {reports && reports.length === 0 && <p className="muted">No reports found for that contact.</p>}

      <div className="grid">
        {reports?.map((r) => (
          <article className="card" key={r._id}>
            <h3>
              {TYPES[r.type]} <span className={`badge ${r.status.replace(' ', '-').toLowerCase()}`}>{r.status}</span>
            </h3>
            <p className="muted">{r.area} · {new Date(r.createdAt).toLocaleString()}</p>
            <p>{r.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
