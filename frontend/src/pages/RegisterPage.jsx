/**
 * RegisterPage — User registration form.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.password2) {
      setError('Passwords do not match.');
      return;
    }
    const result = await register(form);
    if (!result.success) setError(result.error);
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="auth-layout">
      <div className="auth-card fade-in">
        <div className="auth-logo">🚀</div>
        <h1>Create Account</h1>
        <p className="subtitle">Join AI Career Copilot and supercharge your career</p>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reg-first">First Name</label>
              <input id="reg-first" type="text" className="form-control" placeholder="John"
                value={form.first_name} onChange={update('first_name')} required />
            </div>
            <div className="form-group">
              <label htmlFor="reg-last">Last Name</label>
              <input id="reg-last" type="text" className="form-control" placeholder="Doe"
                value={form.last_name} onChange={update('last_name')} required />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-username">Username</label>
            <input id="reg-username" type="text" className="form-control" placeholder="johndoe"
              value={form.username} onChange={update('username')} required />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email</label>
            <input id="reg-email" type="email" className="form-control" placeholder="john@example.com"
              value={form.email} onChange={update('email')} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reg-pass">Password</label>
              <input id="reg-pass" type="password" className="form-control" placeholder="Min 8 characters"
                value={form.password} onChange={update('password')} required minLength={8} />
            </div>
            <div className="form-group">
              <label htmlFor="reg-pass2">Confirm Password</label>
              <input id="reg-pass2" type="password" className="form-control" placeholder="Repeat password"
                value={form.password2} onChange={update('password2')} required minLength={8} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
            {loading ? '⏳ Creating Account...' : '🎉 Create Account'}
          </button>
        </form>

        <div className="auth-toggle">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
