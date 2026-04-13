/**
 * LandingPage — Public-facing page explaining AI Career Copilot.
 */
import { Link } from 'react-router-dom';

const features = [
  {
    icon: '📄',
    title: 'AI Resume Analysis',
    desc: 'Upload your resume and get an AI-powered score, skill detection, strengths, weaknesses, and actionable suggestions.',
    color: '#a78bfa',
  },
  {
    icon: '🎯',
    title: 'Job Fit Matching',
    desc: 'Paste any job description and instantly see how well your resume matches — with missing keywords and improvement tips.',
    color: '#34d399',
  },
  {
    icon: '🗺️',
    title: 'Learning Roadmaps',
    desc: 'Get a personalized, phased learning plan based on skills you\'re missing — with resources and project ideas.',
    color: '#fbbf24',
  },
  {
    icon: '💬',
    title: 'AI Career Chatbot',
    desc: 'Chat with an AI assistant for career advice, interview tips, salary negotiation strategies, and more.',
    color: '#60a5fa',
  },
  {
    icon: '🎤',
    title: 'Interview Preparation',
    desc: 'Practice with AI-generated interview questions tailored to your target role and get feedback on your answers.',
    color: '#f472b6',
  },
  {
    icon: '📊',
    title: 'Career Dashboard',
    desc: 'Track your progress with a dashboard showing resume scores, skill profiles, and job match history.',
    color: '#c084fc',
  },
];

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-brand">
            <span className="logo-icon">🚀</span>
            <span className="brand-text">AI Career Copilot</span>
          </div>
          <div className="landing-nav-links">
            <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="hero-content">
          <div className="hero-badge">🤖 Powered by AI</div>
          <h1>Make <span className="gradient-text">Data-Driven</span> Career Decisions</h1>
          <p className="hero-subtitle">
            AI Career Copilot analyzes your resume, matches it with job descriptions, generates personalized learning roadmaps,
            and helps you prepare for interviews — all powered by advanced AI.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">
              🎉 Get Started Free
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              🔑 Sign In
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat-pill"><span className="stat-num">📄</span> Resume Analysis</div>
            <div className="stat-pill"><span className="stat-num">🎯</span> Job Matching</div>
            <div className="stat-pill"><span className="stat-num">🗺️</span> Smart Roadmaps</div>
            <div className="stat-pill"><span className="stat-num">💬</span> AI Chatbot</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features" id="features">
        <div className="features-inner">
          <h2 className="section-title">Everything You Need to <span className="gradient-text">Succeed</span></h2>
          <p className="section-subtitle">A complete AI-powered toolkit for students and professionals to boost their career</p>
          <div className="features-grid">
            {features.map((f, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-icon" style={{ background: `${f.color}22`, color: f.color }}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="landing-steps">
        <div className="steps-inner">
          <h2 className="section-title">How It <span className="gradient-text">Works</span></h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Upload Resume</h3>
              <p>Upload your PDF or DOCX resume. AI extracts and parses all text automatically.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Get AI Analysis</h3>
              <p>Receive a detailed score, skills breakdown, strengths, weaknesses, and improvement suggestions.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Match & Improve</h3>
              <p>Compare with job descriptions, generate learning roadmaps, and practice interviews with AI.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <div className="cta-inner">
          <h2>Ready to Supercharge Your Career?</h2>
          <p>Join AI Career Copilot today and make data-driven career decisions.</p>
          <Link to="/register" className="btn btn-primary btn-lg">
            🚀 Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="logo-icon">🚀</span> AI Career Copilot
          </div>
          <p>© 2026 AI Career Copilot. Built for students & professionals.</p>
        </div>
      </footer>
    </div>
  );
}
