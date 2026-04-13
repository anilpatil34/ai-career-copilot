/**
 * ResumeUploadPage — Upload, manage, and analyze resumes.
 */
import { useState, useEffect, useRef } from 'react';
import resumeService from '../services/resumeService';
import ScoreCircle from '../components/ScoreCircle';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ResumeUploadPage() {
  const [resumes, setResumes] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => { loadResumes(); }, []);

  const loadResumes = async () => {
    try {
      const data = await resumeService.list();
      setResumes(data.results || data);
    } catch (err) {
      console.error('Failed to load resumes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file) => {
    setError('');
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx', 'doc'].includes(ext)) {
      setError('Please upload a PDF or DOCX file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB.');
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      await resumeService.upload(selectedFile);
      setSuccess('Resume uploaded successfully!');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await loadResumes();
    } catch (err) {
      setError(err.response?.data?.file?.[0] || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async (resumeId) => {
    setAnalyzing(resumeId);
    setError('');
    setAnalysis(null);
    try {
      const result = await resumeService.analyze(resumeId);
      setAnalysis(result.data);
      setSuccess('Resume analyzed successfully!');
      await loadResumes();
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed.');
    } finally {
      setAnalyzing(null);
    }
  };

  const handleDelete = async (resumeId) => {
    if (!confirm('Delete this resume and its analysis?')) return;
    try {
      await resumeService.delete(resumeId);
      setResumes(resumes.filter((r) => r.id !== resumeId));
      if (analysis?.resume === resumeId) setAnalysis(null);
      setSuccess('Resume deleted.');
    } catch (err) {
      setError('Delete failed.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  if (loading) return <LoadingSpinner text="Loading resumes..." />;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>📄 Resume Upload & Analysis</h1>
        <p>Upload your resume and get AI-powered insights</p>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      <div className="grid-2">
        {/* Upload Section */}
        <div className="card">
          <div className="card-header">
            <h2><span className="icon">📤</span> Upload Resume</h2>
          </div>

          <div
            className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="upload-icon">📁</div>
            <h3>Drag & Drop your resume here</h3>
            <p>or <span className="browse-link">browse files</span></p>
            <p style={{ marginTop: '8px', fontSize: '0.78rem' }}>Supported: PDF, DOCX (Max 5MB)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
            />
          </div>

          {selectedFile && (
            <div className="selected-file">
              <span className="file-icon">📄</span>
              <div className="file-info">
                <div className="file-name">{selectedFile.name}</div>
                <div className="file-size">{(selectedFile.size / 1024).toFixed(1)} KB</div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={handleUpload} disabled={uploading}>
                {uploading ? '⏳ Uploading...' : '⬆️ Upload'}
              </button>
            </div>
          )}
        </div>

        {/* Resume List */}
        <div className="card">
          <div className="card-header">
            <h2><span className="icon">📋</span> Your Resumes</h2>
          </div>

          {resumes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📄</div>
              <h3>No Resumes Yet</h3>
              <p>Upload your first resume to get started</p>
            </div>
          ) : (
            <div className="data-list">
              {resumes.map((resume) => (
                <div className="data-list-item" key={resume.id}>
                  <span style={{ fontSize: '1.3rem' }}>📄</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {resume.original_filename}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(resume.uploaded_at).toLocaleDateString()} · {resume.score !== null ? `Score: ${resume.score}` : 'Not analyzed'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {!resume.has_analysis ? (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleAnalyze(resume.id)}
                        disabled={analyzing === resume.id}
                      >
                        {analyzing === resume.id ? '⏳' : '🔍'} Analyze
                      </button>
                    ) : (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleAnalyze(resume.id)}
                      >
                        👁️ View
                      </button>
                    )}
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(resume.id)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Analysis Result */}
      {analysis && (
        <div className="card fade-in" style={{ marginTop: '24px' }}>
          <div className="card-header">
            <h2><span className="icon">🤖</span> AI Analysis Result</h2>
            <span className="skill-badge has">{analysis.resume_name}</span>
          </div>

          <div className="grid-2" style={{ gap: '32px' }}>
            {/* Left — Score */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
              <ScoreCircle score={analysis.score} />
              {analysis.summary && (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                  {analysis.summary}
                </p>
              )}
            </div>

            {/* Right — Details */}
            <div>
              <div className="analysis-section">
                <h3>✅ Skills Detected</h3>
                <div className="skill-badges">
                  {(analysis.skills || []).map((s, i) => <span key={i} className="skill-badge has">{s}</span>)}
                </div>
              </div>

              <div className="analysis-section">
                <h3>⚡ Missing Skills</h3>
                <div className="skill-badges">
                  {(analysis.missing_skills || []).map((s, i) => <span key={i} className="skill-badge missing">{s}</span>)}
                </div>
              </div>
            </div>
          </div>

          <div className="grid-2" style={{ marginTop: '24px' }}>
            <div className="analysis-section">
              <h3>💪 Strengths</h3>
              <ul className="analysis-list">
                {(analysis.strengths || []).map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="analysis-section">
              <h3>⚠️ Weaknesses</h3>
              <ul className="analysis-list">
                {(analysis.weaknesses || []).map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </div>

          <div className="grid-2" style={{ marginTop: '16px' }}>
            <div className="analysis-section">
              <h3>📝 Suggestions</h3>
              <ul className="analysis-list">
                {(analysis.suggestions || []).map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </div>

          {analysis.recommended_roles?.length > 0 && (
            <div className="analysis-section" style={{ marginTop: '16px' }}>
              <h3>🎯 Recommended Roles</h3>
              <div className="skill-badges">
                {analysis.recommended_roles.map((r, i) => (
                  <span key={i} className="skill-badge has" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', borderColor: 'rgba(99,102,241,0.2)' }}>
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
