/**
 * InterviewPrepPage — AI-powered mock interview preparation.
 */
import { useState, useEffect } from 'react';
import aiService from '../services/aiService';
import authService from '../services/authService';
import LoadingSpinner from '../components/LoadingSpinner';

const popularRoles = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Data Scientist', 'DevOps Engineer', 'UI/UX Designer',
  'Product Manager', 'Machine Learning Engineer', 'Cloud Architect',
  'Mobile Developer', 'QA Engineer', 'Cybersecurity Analyst',
];

export default function InterviewPrepPage() {
  const [role, setRole] = useState('');
  const [skills, setSkills] = useState([]);
  const [questions, setQuestions] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserSkills();
  }, []);

  const loadUserSkills = async () => {
    try {
      const data = await authService.getDashboard();
      setSkills(data.skills || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (selectedRole) => {
    const targetRole = selectedRole || role.trim();
    if (!targetRole) {
      setError('Please enter or select a role.');
      return;
    }
    setRole(targetRole);
    setGenerating(true);
    setError('');
    setQuestions(null);
    setActiveQuestion(null);
    setEvaluation(null);
    try {
      const result = await aiService.getInterviewQuestions(targetRole, skills);
      setQuestions(result.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate questions.');
    } finally {
      setGenerating(false);
    }
  };

  const handleEvaluate = async () => {
    if (!answer.trim()) {
      setError('Please type your answer before submitting.');
      return;
    }
    setEvaluating(true);
    setError('');
    setEvaluation(null);
    try {
      const result = await aiService.evaluateAnswer(
        activeQuestion.question,
        answer,
        questions?.role || role
      );
      setEvaluation(result.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to evaluate answer.');
    } finally {
      setEvaluating(false);
    }
  };

  const selectQuestion = (q) => {
    setActiveQuestion(q);
    setAnswer('');
    setEvaluation(null);
    setError('');
  };

  const backToQuestions = () => {
    setActiveQuestion(null);
    setAnswer('');
    setEvaluation(null);
  };

  if (loading) return <LoadingSpinner text="Loading..." />;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>🎤 Interview Preparation</h1>
        <p>Practice with AI-generated questions tailored to your target role</p>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Role Selection */}
      {!questions && !generating && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h2><span className="icon">🎯</span> Choose Your Target Role</h2>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Enter a job role (e.g. Full Stack Developer)..."
              value={role}
              onChange={(e) => setRole(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              style={{ flex: 1 }}
            />
            <button
              className="btn btn-primary"
              onClick={() => handleGenerate()}
              disabled={!role.trim()}
            >
              🚀 Generate Questions
            </button>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Or choose a popular role:
          </p>
          <div className="skill-badges">
            {popularRoles.map((r, i) => (
              <button
                key={i}
                className="skill-badge has"
                onClick={() => { setRole(r); handleGenerate(r); }}
                style={{ cursor: 'pointer' }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {generating && <LoadingSpinner text={`Generating interview questions for "${role}"...`} />}

      {/* Questions List */}
      {questions && !activeQuestion && (
        <div className="card fade-in">
          <div className="card-header">
            <h2><span className="icon">📝</span> Interview Questions</h2>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className="skill-badge has">{questions.role}</span>
              <button className="btn btn-secondary btn-sm" onClick={() => { setQuestions(null); setRole(''); }}>
                ← Change Role
              </button>
            </div>
          </div>

          {questions.summary && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px', lineHeight: 1.6 }}>
              {questions.summary}
            </p>
          )}

          <div className="data-list">
            {(questions.questions || []).map((q, i) => (
              <div className="data-list-item" key={q.id || i} style={{ cursor: 'pointer' }}
                onClick={() => selectQuestion(q)}>
                <span style={{ fontSize: '1.3rem' }}>
                  {q.category === 'Technical' ? '💻' : q.category === 'Behavioral' ? '🧠' :
                    q.category === 'Problem Solving' ? '🧩' : '🎯'}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {q.question}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', gap: '12px' }}>
                    <span>📁 {q.category}</span>
                    <span>📊 {q.difficulty}</span>
                  </div>
                </div>
                <button className="btn btn-primary btn-sm">
                  ✍️ Practice
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Answer & Evaluate */}
      {activeQuestion && (
        <div className="fade-in">
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h2><span className="icon">✍️</span> Your Answer</h2>
              <button className="btn btn-secondary btn-sm" onClick={backToQuestions}>
                ← Back to Questions
              </button>
            </div>

            <div style={{
              background: 'rgba(99,102,241,0.08)', borderRadius: '12px',
              padding: '20px', marginBottom: '20px', borderLeft: '4px solid var(--primary)'
            }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', gap: '12px' }}>
                <span>📁 {activeQuestion.category}</span>
                <span>📊 {activeQuestion.difficulty}</span>
              </div>
              <p style={{ fontWeight: 600, fontSize: '1rem', lineHeight: 1.5, color: 'var(--text-primary)' }}>
                {activeQuestion.question}
              </p>
              {activeQuestion.tips && (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '10px' }}>
                  💡 <strong>Tip:</strong> {activeQuestion.tips}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="interview-answer">Your Answer</label>
              <textarea
                id="interview-answer"
                className="form-control"
                placeholder="Type your answer here... Be specific and use examples from your experience."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                style={{ minHeight: '180px' }}
              />
            </div>

            <button
              className="btn btn-primary btn-lg btn-full"
              onClick={handleEvaluate}
              disabled={evaluating || !answer.trim()}
            >
              {evaluating ? '⏳ Evaluating Your Answer...' : '🤖 Get AI Feedback'}
            </button>
          </div>

          {/* Evaluation Result */}
          {evaluation && (
            <div className="card fade-in">
              <div className="card-header">
                <h2><span className="icon">📊</span> AI Feedback</h2>
                <div className={`skill-badge ${evaluation.score >= 70 ? 'has' : 'missing'}`}>
                  Score: {evaluation.score}/100
                </div>
              </div>

              {/* Score Bar */}
              <div className="match-bar-container">
                <div className="match-bar-label">
                  <span>Answer Quality</span>
                  <span className="percentage">{evaluation.score}%</span>
                </div>
                <div className="match-bar">
                  <div className="match-bar-fill" style={{ width: `${evaluation.score}%` }} />
                </div>
              </div>

              {evaluation.feedback && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '16px 0', lineHeight: 1.7 }}>
                  {evaluation.feedback}
                </p>
              )}

              <div className="grid-2" style={{ marginTop: '16px' }}>
                <div className="analysis-section">
                  <h3>💪 What You Did Well</h3>
                  <ul className="analysis-list">
                    {(evaluation.strengths || []).map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div className="analysis-section">
                  <h3>📝 Areas to Improve</h3>
                  <ul className="analysis-list">
                    {(evaluation.improvements || []).map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              </div>

              {evaluation.sample_answer && (
                <div className="analysis-section" style={{ marginTop: '16px' }}>
                  <h3>✨ Sample Strong Answer</h3>
                  <div style={{
                    background: 'rgba(52,211,153,0.08)', borderRadius: '12px',
                    padding: '16px', fontSize: '0.88rem', lineHeight: 1.7,
                    color: 'var(--text-secondary)', borderLeft: '4px solid #34d399'
                  }}>
                    {evaluation.sample_answer}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
