/**
 * RoadmapPage — Generate personalized learning roadmaps.
 */
import { useState, useEffect } from 'react';
import aiService from '../services/aiService';
import authService from '../services/authService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function RoadmapPage() {
  const [missingSkills, setMissingSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [roadmap, setRoadmap] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const data = await authService.getDashboard();
      const skills = data.missing_skills || [];
      setMissingSkills(skills);
      setSelectedSkills(skills.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    const skill = customSkill.trim();
    if (skill && !selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
      if (!missingSkills.includes(skill)) {
        setMissingSkills([...missingSkills, skill]);
      }
      setCustomSkill('');
    }
  };

  const handleGenerate = async () => {
    if (selectedSkills.length === 0) {
      setError('Please select at least one skill.');
      return;
    }
    setGenerating(true);
    setError('');
    setRoadmap(null);
    try {
      const result = await aiService.generateRoadmap(selectedSkills);
      setRoadmap(result.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Roadmap generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading skills..." />;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>🗺️ Personalized Learning Roadmap</h1>
        <p>Get a step-by-step plan to build the skills you need</p>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Skill Selection */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h2><span className="icon">⚡</span> Select Skills to Learn</h2>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleGenerate}
            disabled={generating || selectedSkills.length === 0}
          >
            {generating ? '⏳ Generating...' : '🚀 Generate Roadmap'}
          </button>
        </div>

        {missingSkills.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Skills identified from your resume analysis:
            </p>
            <div className="skill-badges">
              {missingSkills.map((skill, i) => (
                <button
                  key={i}
                  className={`skill-badge ${selectedSkills.includes(skill) ? 'has' : 'missing'}`}
                  onClick={() => toggleSkill(skill)}
                  style={{ cursor: 'pointer' }}
                >
                  {selectedSkills.includes(skill) ? '✓ ' : '+ '}{skill}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Add a custom skill..."
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomSkill()}
            style={{ flex: 1 }}
          />
          <button className="btn btn-secondary" onClick={addCustomSkill}>+ Add</button>
        </div>

        {selectedSkills.length > 0 && (
          <div style={{ marginTop: '12px' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Selected: {selectedSkills.join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Generated Roadmap */}
      {generating ? (
        <LoadingSpinner text="Generating your personalized roadmap..." />
      ) : roadmap ? (
        <div className="card fade-in">
          <div className="card-header">
            <h2><span className="icon">📍</span> Your Learning Roadmap</h2>
            {roadmap.total_duration && (
              <span className="skill-badge has">📅 {roadmap.total_duration}</span>
            )}
          </div>

          {roadmap.summary && (
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem', lineHeight: 1.6 }}>
              {roadmap.summary}
            </p>
          )}

          <div className="roadmap-timeline">
            {(roadmap.roadmap || []).map((phase, i) => (
              <div className="roadmap-phase" key={i}>
                <div className="phase-header">
                  <span className="phase-number">Phase {phase.phase || i + 1}</span>
                  <h3 style={{ flex: 1 }}>{phase.title}</h3>
                  <span className="phase-duration">⏱️ {phase.duration}</span>
                </div>

                <div className="phase-content">
                  {phase.skills?.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <h4>Skills</h4>
                      <div className="skill-badges">
                        {phase.skills.map((s, j) => (
                          <span key={j} className="skill-badge has">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {phase.resources?.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <h4>📚 Resources</h4>
                      <ul>
                        {phase.resources.map((r, j) => <li key={j}>{r}</li>)}
                      </ul>
                    </div>
                  )}

                  {phase.projects?.length > 0 && (
                    <div>
                      <h4>🛠️ Projects</h4>
                      <ul>
                        {phase.projects.map((p, j) => <li key={j}>{p}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🗺️</div>
            <h3>No Roadmap Generated Yet</h3>
            <p>Select the skills you want to learn and generate your personalized roadmap</p>
          </div>
        </div>
      )}
    </div>
  );
}
