/**
 * LoadingSpinner — Reusable loading state component.
 */
export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="loading-spinner">
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" />
        <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{text}</p>
      </div>
    </div>
  );
}
