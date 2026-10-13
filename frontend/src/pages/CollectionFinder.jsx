import { useState } from 'react';
import { searchRoutes } from '../api.js';

export default function CollectionFinder() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      setResults(await searchRoutes(query));
    } catch (err) {
      setError(err.message);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2>Find your collection schedule</h2>
      <form className="row" onSubmit={onSearch}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter area or district (e.g. Galle, Nugegoda)"
          aria-label="Area"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}
      {results && results.length === 0 && <p className="muted">No routes found for “{query}”.</p>}

      <div className="grid">
        {results?.map((r) => (
          <article className="card" key={r._id}>
            <h3>{r.area}</h3>
            <p className="muted">{r.district} District</p>
            <dl>
              <dt>Route</dt>
              <dd>{r.routeNumber}</dd>
              <dt>Truck</dt>
              <dd>{r.truckNumber}</dd>
              <dt>Days</dt>
              <dd>{r.collectionDays.join(', ')}</dd>
              <dt>Time</dt>
              <dd>{r.collectionTime}</dd>
              <dt>Waste type</dt>
              <dd>{r.wasteType}</dd>
              <dt>Fee</dt>
              <dd>LKR {r.fee.toLocaleString()} / month</dd>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
