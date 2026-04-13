/**
 * ProfilePage — View and edit user profile with career-related fields.
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    profile: {
      bio: '',
      phone: '',
      career_goals: '',
      experience_years: 0,
      current_role: '',
      target_role: '',
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await authService.getProfile();
      setProfile(data);
      setForm({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        profile: {
          bio: data.profile?.bio || '',
          phone: data.profile?.phone || '',
          career_goals: data.profile?.career_goals || '',
          experience_years: data.profile?.experience_years || 0,
          current_role: data.profile?.current_role || '',
          target_role: data.profile?.target_role || '',
        },
      });
    } catch (err) {
      setError('Failed to load profile.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await authService.updateProfile(form);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const updateProfile = (field) => (e) =>
    setForm({ ...form, profile: { ...form.profile, [field]: e.target.value } });

  if (loading) return <LoadingSpinner text="Loading profile..." />;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>👤 My Profile</h1>
        <p>Manage your personal information and career details</p>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      <form onSubmit={handleSave}>
        <div className="grid-2">
          {/* Personal Info */}
          <div className="card">
            <div className="card-header">
              <h2><span className="icon">🧑</span> Personal Information</h2>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="prof-first">First Name</label>
                <input id="prof-first" type="text" className="form-control"
                  value={form.first_name} onChange={updateField('first_name')} />
              </div>
              <div className="form-group">
                <label htmlFor="prof-last">Last Name</label>
                <input id="prof-last" type="text" className="form-control"
                  value={form.last_name} onChange={updateField('last_name')} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="prof-email">Email Address</label>
              <input id="prof-email" type="email" className="form-control"
                value={form.email} onChange={updateField('email')} />
            </div>

            <div className="form-group">
              <label htmlFor="prof-phone">Phone Number</label>
              <input id="prof-phone" type="text" className="form-control" placeholder="e.g. +91 9876543210"
                value={form.profile.phone} onChange={updateProfile('phone')} />
            </div>

            <div className="form-group">
              <label htmlFor="prof-bio">Bio</label>
              <textarea id="prof-bio" className="form-control" placeholder="Tell us about yourself..."
                value={form.profile.bio} onChange={updateProfile('bio')} style={{ minHeight: '100px' }} />
            </div>
          </div>

          {/* Career Info */}
          <div className="card">
            <div className="card-header">
              <h2><span className="icon">💼</span> Career Details</h2>
            </div>

            <div className="form-group">
              <label htmlFor="prof-current">Current Role</label>
              <input id="prof-current" type="text" className="form-control"
                placeholder="e.g. Junior Developer" value={form.profile.current_role}
                onChange={updateProfile('current_role')} />
            </div>

            <div className="form-group">
              <label htmlFor="prof-target">Target Role</label>
              <input id="prof-target" type="text" className="form-control"
                placeholder="e.g. Senior Full Stack Developer" value={form.profile.target_role}
                onChange={updateProfile('target_role')} />
            </div>

            <div className="form-group">
              <label htmlFor="prof-exp">Years of Experience</label>
              <input id="prof-exp" type="number" className="form-control" min="0" max="50"
                value={form.profile.experience_years}
                onChange={(e) => setForm({
                  ...form,
                  profile: { ...form.profile, experience_years: parseInt(e.target.value) || 0 }
                })} />
            </div>

            <div className="form-group">
              <label htmlFor="prof-goals">Career Goals</label>
              <textarea id="prof-goals" className="form-control"
                placeholder="What are your career goals? Where do you want to be in 2-5 years?"
                value={form.profile.career_goals} onChange={updateProfile('career_goals')}
                style={{ minHeight: '120px' }} />
            </div>
          </div>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            {saving ? '⏳ Saving...' : '💾 Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
