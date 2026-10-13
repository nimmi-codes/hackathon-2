export const Skeleton = ({ lines = 3, className = '' }) => (
  <div className={`skeleton-block ${className}`} aria-hidden="true">
    {Array.from({ length: lines }, (_, i) => (
      <span key={i} className="skeleton" style={{ width: `${90 - i * 18}%` }} />
    ))}
  </div>
);

export const SkeletonGrid = ({ count = 3 }) => (
  <div className="grid" role="status" aria-label="Loading">
    {Array.from({ length: count }, (_, i) => (
      <div className="card glass" key={i}>
        <Skeleton lines={4} />
      </div>
    ))}
  </div>
);

export const SkeletonRows = ({ rows = 5 }) => (
  <div className="glass table-wrap" role="status" aria-label="Loading">
    {Array.from({ length: rows }, (_, i) => (
      <div className="skeleton row-skel" key={i} />
    ))}
  </div>
);

export const EmptyState = ({ icon = '🌿', title, text, children }) => (
  <div className="empty glass">
    <div className="empty-icon" aria-hidden="true">{icon}</div>
    <h3>{title}</h3>
    {text && <p>{text}</p>}
    {children}
  </div>
);

export const Chip = ({ children }) => <span className="chip glass">{children}</span>;

export const StatusBadge = ({ status }) => (
  <span className={`badge ${status.replace(/\s+/g, '-').toLowerCase()}`}>{status}</span>
);

/** Heading block with a static soft green glow. `accent` is rendered italic. */
export function Hero({ chip, before, accent, after, children }) {
  return (
    <section className="hero">
      <div className="hero-light" aria-hidden="true" />
      <Chip>{chip}</Chip>
      <h1>
        {before} <em>{accent}</em>
        {after ? ` ${after}` : ''}
      </h1>
      {children}
    </section>
  );
}
