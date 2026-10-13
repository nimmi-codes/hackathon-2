import { useCallback, useEffect, useState } from 'react';
import { adminCreateRoute, adminDeleteRoute, adminRoutes, adminUpdateRoute } from '../../api.js';
import Modal from '../../components/Modal.jsx';
import { useToast } from '../../components/Toast.jsx';
import { EmptyState, Hero, SkeletonRows } from '../../components/ui.jsx';

const DAY_OPTIONS = ['Daily', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const blank = {
  area: '', district: '', routeNumber: '', truckNumber: '',
  collectionDays: [], collectionTime: '06:00 - 09:00', wasteType: 'General Waste', fee: 1000,
};

export default function AdminRoutes() {
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [editing, setEditing] = useState(null); // route object or {} for new
  const [form, setForm] = useState(blank);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    adminRoutes().then(setRows).catch((e) => { toast(e.message, 'error'); setRows([]); });
  }, [toast]);
  useEffect(load, [load]);

  const openForm = (r) => {
    setEditing(r || {});
    setForm(r ? { ...r } : blank);
  };
  const closeForm = useCallback(() => setEditing(null), []);
  const closeDelete = useCallback(() => setDeleting(null), []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const toggleDay = (d) =>
    setForm({
      ...form,
      collectionDays: form.collectionDays.includes(d) ? form.collectionDays.filter((x) => x !== d) : [...form.collectionDays, d],
    });

  const save = async (e) => {
    e.preventDefault();
    if (!form.collectionDays.length) return toast('Pick at least one collection day', 'error');
    setBusy(true);
    const body = { ...form, fee: Number(form.fee) };
    try {
      if (editing._id) await adminUpdateRoute(editing._id, body);
      else await adminCreateRoute(body);
      toast(editing._id ? 'Route updated' : 'Route added');
      closeForm();
      load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await adminDeleteRoute(deleting._id);
      toast('Route deleted');
      closeDelete();
      load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Hero chip="Staff portal" before="Routes &" accent="fees" />
      <div className="toolbar">
        <button type="button" className="btn btn-primary" onClick={() => openForm()}>+ Add route</button>
      </div>

      {rows === null && <SkeletonRows />}
      {rows && rows.length === 0 && (
        <EmptyState icon="🚛" title="No routes yet" text="Add the first collection route.">
          <button type="button" className="btn btn-primary" onClick={() => openForm()}>+ Add route</button>
        </EmptyState>
      )}
      {rows && rows.length > 0 && (
        <div className="glass table-wrap">
          <table>
            <thead>
              <tr><th>Area</th><th>Route</th><th>Truck</th><th>Days</th><th>Time</th><th>Waste</th><th>Fee (LKR)</th><th><span className="sr-only">Actions</span></th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id}>
                  <td data-label="Area">{r.area}<small className="muted block">{r.district}</small></td>
                  <td data-label="Route">{r.routeNumber}</td>
                  <td data-label="Truck">{r.truckNumber}</td>
                  <td data-label="Days">{r.collectionDays.join(', ')}</td>
                  <td data-label="Time">{r.collectionTime}</td>
                  <td data-label="Waste">{r.wasteType}</td>
                  <td data-label="Fee">{r.fee.toLocaleString()}</td>
                  <td className="actions">
                    <button type="button" className="btn sm" onClick={() => openForm(r)} aria-label={`Edit ${r.area}`}>Edit</button>
                    <button type="button" className="btn sm danger" onClick={() => setDeleting(r)} aria-label={`Delete ${r.area}`}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!editing} title={editing?._id ? 'Edit route' : 'Add route'} onClose={closeForm}>
        <form className="form" onSubmit={save}>
          <div className="form-grid">
            <label>Area<input required value={form.area} onChange={set('area')} /></label>
            <label>District<input required value={form.district} onChange={set('district')} /></label>
            <label>Route number<input required value={form.routeNumber} onChange={set('routeNumber')} /></label>
            <label>Truck number<input required value={form.truckNumber} onChange={set('truckNumber')} /></label>
            <label>Collection time<input required value={form.collectionTime} onChange={set('collectionTime')} placeholder="06:00 - 09:00" /></label>
            <label>Fee (LKR / month)<input required type="number" min="0" value={form.fee} onChange={set('fee')} /></label>
          </div>
          <label>Waste type<input required value={form.wasteType} onChange={set('wasteType')} /></label>
          <fieldset>
            <legend>Collection days</legend>
            <div className="day-picker">
              {DAY_OPTIONS.map((d) => (
                <label key={d} className={`day ${form.collectionDays.includes(d) ? 'on' : ''}`}>
                  <input type="checkbox" checked={form.collectionDays.includes(d)} onChange={() => toggleDay(d)} />
                  {d}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={closeForm}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleting} title="Delete route?" onClose={closeDelete}>
        <p>This permanently removes <strong>{deleting?.area}</strong> ({deleting?.routeNumber}).</p>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={closeDelete}>Cancel</button>
          <button type="button" className="btn danger" onClick={remove} disabled={busy}>{busy ? 'Deleting…' : 'Delete'}</button>
        </div>
      </Modal>
    </>
  );
}
