/**
 * ScoreCircle — Animated circular score visualization.
 */
export default function ScoreCircle({ score = 0, size = 160, label = 'Resume Score' }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#6366f1';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="score-circle-wrapper">
      <div className="score-circle" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <circle
            className="bg-ring"
            cx={size / 2}
            cy={size / 2}
            r={radius}
          />
          <circle
            className="score-ring"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ stroke: getColor() }}
          />
        </svg>
        <div className="score-value">
          <span className="number">{score}</span>
          <span className="label">/ 100</span>
        </div>
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>{label}</p>
    </div>
  );
}
