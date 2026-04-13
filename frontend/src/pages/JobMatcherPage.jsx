/**
 * JobMatcherPage — Paste a job description and match against resume.
 */
import { useState, useEffect } from 'react';
import resumeService from '../services/resumeService';
import jobService from '../services/jobService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function JobMatcherPage() {
  const [resumes, setResumes] = useState([]);
  const [form, setForm] = useState({ resume_id: '', title: '', company: '', description: '' });
  const [matching, setMatching] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadResumes(), loadHistory()]).then(() => setLoading(false));
  }, []);

  const loadResumes = async () => {
    try {
      const data = await resumeService.list();
      const list = data.results || data;
      setResumes(list);
      if (list.length > 0 && !form.resume_id) {
        setForm((f) => ({ ...f, resume_id: list[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadHistory = async () => {
    try {
      const data = await jobService.history();
      setHistory(data.results || data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.resume_id || !form.description.trim()) {
      setError('Please select a resume and enter a job description.');
      return;
    }
    setMatching(true);
    setError('');
    setResult(null);
    try {
      const data = await jobService.match(form.resume_id, form.title, form.company, form.description);
      setResult(data.data);
      await loadHistory();
    } catch (err) {
      setError(err.response?.data?.error || 'Job matching failed.');
    } finally {
      setMatching(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading..." />;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>🎯 Job Description Matcher</h1>
        <p>Compare your resume against any job description</p>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="grid-2">
        {/* Input Form */}
        <div className="card">
          <div className="card-header">
            <h2><span className="icon">📝</span> Job Details</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="jm-resume">Select Resume</label>
              <select
                id="jm-resume"
                className="form-control"
                value={form.resume_id}
                onChange={(e) => setForm({ ...form, resume_id: e.target.value })}
              >
                {resumes.length === 0 && <option value="">No resumes — upload one first</option>}
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>{r.original_filename}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="jm-title">Job Title</label>
                <input id="jm-title" type="text" className="form-control" placeholder="e.g. Frontend Developer"
                  value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label htmlFor="jm-company">Company (optional)</label>
                <input id="jm-company" type="text" className="form-control" placeholder="e.g. Google"
                  value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="jm-desc">Job Description</label>
              <textarea
                id="jm-desc"
                className="form-control"
                placeholder="Paste the full job description here..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                style={{ minHeight: '200px' }}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={matching || resumes.length === 0}>
              {matching ? '⏳ Analyzing Match...' : '🎯 Match Against Resume'}
            </button>
          </form>
        </div>

        {/* Result / History */}
        <div>
          {result ? (
            <div className="card fade-in">
              <div className="card-header">
                <h2><span className="icon">📊</span> Match Result</h2>
                <span className="skill-badge has">{result.job_title}</span>
              </div>

              <div className="match-bar-container">
                <div className="match-bar-label">
                  <span>Match Percentage</span>
                  <span className="percentage">{result.match_percentage}%</span>
                </div>
                <div className="match-bar">
                  <div className="match-bar-fill" style={{ width: `${result.match_percentage}%` }} />
                </div>
              </div>

              {result.summary && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '16px 0', lineHeight: 1.6 }}>
                  {result.summary}
                </p>
              )}

              <div className="analysis-section">
                <h3>✅ Matching Skills</h3>
                <div className="skill-badges">
                  {(result.matching_skills || []).map((s, i) => <span key={i} className="skill-badge has">{s}</span>)}
                </div>
              </div>

              <div className="analysis-section">
                <h3>❌ Missing Keywords</h3>
                <div className="skill-badges">
                  {(result.missing_keywords || []).map((s, i) => <span key={i} className="skill-badge missing">{s}</span>)}
                </div>
              </div>

              <div className="analysis-section">
                <h3>💡 Suggestions</h3>
                <ul className="analysis-list">
                  {(result.suggestions || []).map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-header">
                <h2><span className="icon">📋</span> Match History</h2>
              </div>
              {history.length > 0 ? (
                history.slice(0, 8).map((h) => (
                  <div className="history-item" key={h.id}>
                    <div className="history-left">
                      <span className="history-icon">🎯</span>
                      <div>
                        <div className="history-title">{h.job_title}</div>
                        <div className="history-meta">{h.job_company || 'N/A'} • {new Date(h.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="history-score">{h.match_percentage}%</div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">🎯</div>
                  <h3>No Matches Yet</h3>
                  <p>Paste a job description and compare it with your resume</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
