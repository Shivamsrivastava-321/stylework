export default function LoadingSkeleton() {
  return (
    <div className="lead-list">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="lead-card"
          style={{ cursor: 'default', pointerEvents: 'none' }}
        >
          <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%' }} />
          <div className="lead-info">
            <div className="skeleton" style={{ height: 14, width: '40%', borderRadius: 6 }} />
            <div className="skeleton" style={{ height: 12, width: '60%', borderRadius: 6, marginTop: 6 }} />
          </div>
          <div className="lead-meta">
            <div className="skeleton" style={{ height: 20, width: 72, borderRadius: 999 }} />
            <div className="skeleton" style={{ height: 11, width: 60, borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
