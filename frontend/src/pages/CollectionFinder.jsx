import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { searchRoutes } from '../api.js';
import { nextPickup, weekSchedule } from '../lib/nextPickup.js';
import { EmptyState, Hero, SkeletonGrid } from '../components/ui.jsx';

const WASTE_TYPES = ['All types', 'General', 'Organic', 'Recyclables'];

function RouteCard({ r, index }) {
  const [open, setOpen] = useState(false);
  const next = useMemo(() => nextPickup(r), [r]);
  const week = useMemo(() => weekSchedule(r), [r]);

  return (
    <motion.article
      className={`card glass hoverable ${open ? 'expanded' : ''}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.07 }}
      layout="position"
    >
      <button
        type="button"
        className="card-toggle"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <div className="card-top">
          <div>
            <h3>{r.area}</h3>
            <p className="muted">{r.district} District</p>
          </div>
          <span className={`pill-badge ${next.active ? 'live' : ''}`}>{next.label}</span>
        </div>
        <dl>
          <dt>Route</dt><dd>{r.routeNumber}</dd>
          <dt>Truck</dt><dd>{r.truckNumber}</dd>
          <dt>Days</dt><dd>{r.collectionDays.join(', ')}</dd>
          <dt>Time</dt><dd>{r.collectionTime}</dd>
          <dt>Waste type</dt><dd>{r.wasteType}</dd>
          <dt>Fee</dt><dd>LKR {r.fee.toLocaleString()} / month</dd>
        </dl>
        <span className="expand-hint">{open ? 'Hide schedule ↑' : 'View pickup schedule ↓'}</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.ol
            className="timeline"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            aria-label={`Upcoming pickups for ${r.area}`}
          >
            {week.map((d) => (
              <li key={d.key} className={`${d.pickup ? 'on' : ''} ${d.today ? 'today' : ''}`}>
                <span className="dot" aria-hidden="true" />
                <span className="tl-day">{d.day} · {d.date}{d.today ? ' (today)' : ''}</span>
                <span className="tl-info">{d.pickup ? r.collectionTime : 'No pickup'}</span>
              </li>
            ))}
          </motion.ol>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

export default function CollectionFinder() {
  const [area, setArea] = useState('');
  const [type, setType] = useState(WASTE_TYPES[0]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSug, setShowSug] = useState(false);
  const [active, setActive] = useState(-1);
  const resultsRef = useRef(null);

  // Area names for autocomplete (existing public endpoint, empty search = all)
  useEffect(() => {
    searchRoutes('')
      .then((rows) => setSuggestions([...new Set(rows.flatMap((r) => [r.area, r.district]))].sort()))
      .catch(() => {});
  }, []);

  const matches = useMemo(() => {
    const q = area.trim().toLowerCase();
    if (!q) return [];
    return suggestions.filter((s) => s.toLowerCase().includes(q) && s.toLowerCase() !== q).slice(0, 6);
  }, [area, suggestions]);

  const runSearch = async (value = area) => {
    setLoading(true);
    setError('');
    setShowSug(false);
    try {
      const rows = await searchRoutes(value);
      setResults(rows);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    } catch (err) {
      setError(err.message);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    runSearch();
  };

  const pick = (s) => {
    setArea(s);
    runSearch(s);
  };

  const onKeyDown = (e) => {
    if (!showSug || !matches.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % matches.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a <= 0 ? matches.length - 1 : a - 1)); }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); pick(matches[active]); }
    else if (e.key === 'Escape') setShowSug(false);
  };

  const filtered = useMemo(
    () => (results && type !== WASTE_TYPES[0] ? results.filter((r) => r.wasteType.toLowerCase().includes(type.toLowerCase())) : results),
    [results, type]
  );

  return (
    <>
      <Hero chip="Sri Lanka Waste Collection" before="Find your" accent="pickup" after="in seconds">
        <p className="lede">
          Search your area to see the truck and route number, collection days and time, waste type and monthly fee.
        </p>

        <form className="search glass" onSubmit={onSubmit} role="search">
          <div className="field area-field">
            <label htmlFor="area">Area</label>
            <input
              id="area"
              value={area}
              autoComplete="off"
              placeholder="e.g. Galle, Nugegoda"
              role="combobox"
              aria-expanded={showSug && matches.length > 0}
              aria-controls="area-list"
              aria-autocomplete="list"
              onChange={(e) => { setArea(e.target.value); setShowSug(true); setActive(-1); }}
              onFocus={() => setShowSug(true)}
              onBlur={() => setTimeout(() => setShowSug(false), 120)}
              onKeyDown={onKeyDown}
            />
            <AnimatePresence>
              {showSug && matches.length > 0 && (
                <motion.ul
                  id="area-list"
                  role="listbox"
                  className="suggest glass"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {matches.map((s, i) => (
                    <li
                      key={s}
                      role="option"
                      aria-selected={i === active}
                      className={i === active ? 'active' : ''}
                      onMouseDown={() => pick(s)}
                    >
                      {s}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
          <div className="field type-field">
            <label htmlFor="type">Waste type</label>
            <select id="type" value={type} onChange={(e) => setType(e.target.value)}>
              {WASTE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Searching…' : 'Search'}
          </button>
        </form>
      </Hero>

      <section ref={resultsRef} className="results" aria-live="polite">
        {error && <p className="error" role="alert">{error}</p>}
        {loading && <SkeletonGrid count={3} />}
        {!loading && results === null && !error && (
          <EmptyState icon="🔎" title="Start with your area" text="Results will appear here. Leave the area blank and search to browse every route." />
        )}
        {!loading && filtered && filtered.length === 0 && (
          <EmptyState icon="🌿" title="No routes found" text={`Nothing matches “${area}”${type !== WASTE_TYPES[0] ? ` with ${type.toLowerCase()} waste` : ''}. Try a nearby town or a different waste type.`} />
        )}
        {!loading && filtered && filtered.length > 0 && (
          <div className="grid">
            {filtered.map((r, i) => <RouteCard key={r._id} r={r} index={i} />)}
          </div>
        )}
      </section>
    </>
  );
}
