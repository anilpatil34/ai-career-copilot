/**
 * DashboardPage — Overview with stats, score, skills, match history.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import ScoreCircle from '../components/ScoreCircle';
import LoadingSpinner from '../components/LoadingSpinner';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await authService.getDashboard();
      setStats(data);
    } catch (err) {
      console.error('Dashboard load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>📊 Dashboard</h1>
        <p>Your career progress at a glance</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">📄</div>
          <div className="stat-info">
            <h3>{stats?.resume_count || 0}</h3>
            <p>Resumes Uploaded</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-info">
            <h3>{stats?.analysis_count || 0}</h3>
            <p>Analyses Done</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">🎯</div>
          <div className="stat-info">
            <h3>{stats?.job_match_count || 0}</h3>
            <p>Jobs Matched</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">📈</div>
          <div className="stat-info">
            <h3>{stats?.avg_match || 0}%</h3>
            <p>Avg. Match Rate</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid-2">
        {/* Score Card */}
        <div className="card">
          <div className="card-header">
            <h2><span className="icon">🏆</span> Resume Score</h2>
            <button className="btn btn-sm btn-secondary" onClick={() => navigate('/resume')}>
              Analyze Resume
            </button>
          </div>
          {stats?.latest_score > 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
              <ScoreCircle score={stats.latest_score} />
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📄</div>
              <h3>No Analysis Yet</h3>
              <p>Upload and analyze your resume to see your score</p>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/resume')} style={{ marginTop: '16px' }}>
                Upload Resume
              </button>
            </div>
          )}
        </div>

        {/* Skills Overview */}
        <div className="card">
          <div className="card-header">
            <h2><span className="icon">💡</span> Skills Overview</h2>
          </div>
          {stats?.skills?.length > 0 ? (
            <>
              <div className="analysis-section">
                <h3>✅ Detected Skills</h3>
                <div className="skill-badges">
                  {stats.skills.map((skill, i) => (
                    <span key={i} className="skill-badge has">{skill}</span>
                  ))}
                </div>
              </div>
              {stats.missing_skills?.length > 0 && (
                <div className="analysis-section">
                  <h3>⚡ Skills to Develop</h3>
                  <div className="skill-badges">
                    {stats.missing_skills.map((skill, i) => (
                      <span key={i} className="skill-badge missing">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">💡</div>
              <h3>No Skills Detected</h3>
              <p>Analyze a resume to discover your skill profile</p>
            </div>
          )}
        </div>
      </div>

      {/* Match History */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h2><span className="icon">📋</span> Recent Job Matches</h2>
          <button className="btn btn-sm btn-secondary" onClick={() => navigate('/job-matcher')}>
            Match Job
          </button>
        </div>
        {stats?.match_history?.length > 0 ? (
          <div>
            {stats.match_history.map((match) => (
              <div className="history-item" key={match.id}>
                <div className="history-left">
                  <span className="history-icon">🎯</span>
                  <div>
                    <div className="history-title">{match.job_title}</div>
                    <div className="history-meta">{match.company} • {new Date(match.date).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="history-score">{match.match_percentage}%</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <h3>No Job Matches Yet</h3>
            <p>Paste a job description to see how well your resume matches</p>
          </div>
        )}
      </div>
    </div>
  );
}
