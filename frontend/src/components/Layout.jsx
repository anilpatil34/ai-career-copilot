/**
 * Layout — Main app shell with Sidebar and Navbar.
 */
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const navItems = [
  { path: '/dashboard', icon: '📊', label: 'Dashboard', section: 'Main' },
  { path: '/resume', icon: '📄', label: 'Resume Upload', section: 'Main' },
  { path: '/job-matcher', icon: '🎯', label: 'Job Matcher', section: 'AI Tools' },
  { path: '/roadmap', icon: '🗺️', label: 'Learning Roadmap', section: 'AI Tools' },
  { path: '/interview', icon: '🎤', label: 'Interview Prep', section: 'AI Tools' },
  { path: '/chatbot', icon: '💬', label: 'AI Chat', section: 'AI Tools' },
  { path: '/profile', icon: '👤', label: 'My Profile', section: 'Settings' },
];

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/resume': 'Resume Upload & Analysis',
  '/job-matcher': 'Job Description Matcher',
  '/chatbot': 'AI Career Assistant',
  '/roadmap': 'Learning Roadmap',
  '/profile': 'My Profile',
  '/interview': 'Interview Preparation',
};

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageTitle = pageTitles[location.pathname] || 'AI Career Copilot';
  const initials = user
    ? (user.first_name?.[0] || '') + (user.last_name?.[0] || user.username?.[0] || '')
    : '?';

  const sections = {};
  navItems.forEach((item) => {
    if (!sections[item.section]) sections[item.section] = [];
    sections[item.section].push(item);
  });

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <span className="logo-icon">🚀</span>
          <h2>AI Career Copilot</h2>
        </div>

        <nav className="sidebar-nav">
          {Object.entries(sections).map(([section, items]) => (
            <div className="sidebar-section" key={section}>
              <div className="sidebar-section-title">{section}</div>
              {items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{initials.toUpperCase()}</div>
            <div className="user-details">
              <div className="name">{user?.first_name || user?.username || 'User'}</div>
              <div className="email">{user?.email || ''}</div>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm btn-full" onClick={logout} style={{ marginTop: '12px' }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Navbar */}
      <header className="navbar">
        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          ☰
        </button>
        <h1 className="navbar-title">{pageTitle}</h1>
        <div className="navbar-actions">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Welcome, <strong style={{ color: 'var(--text-primary)' }}>{user?.first_name || user?.username}</strong>
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
