import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useStore } from '../context/StoreContext';

function ProfilePage() {
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    avatar_url: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      setForm({
        full_name: data.full_name || '',
        email: data.email || user.email || '',
        avatar_url: data.avatar_url || '',
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name.trim(),
        avatar_url: form.avatar_url.trim(),
      })
      .eq('id', user.id);

    setSaving(false);
    if (!error) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handleAvatarUpload = async (file) => {
    if (!file) return;
    setAvatarUploading(true);

    const ext = file.name.split('.').pop();
    const fileName = `avatar-${user.id}.${ext}`;

    const { error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, { upsert: true });

    if (!error) {
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);
      setForm(p => ({ ...p, avatar_url: publicUrl }));
    }
    setAvatarUploading(false);
  };

  const handlePasswordChange = async () => {
    setPasswordError('');
    setPasswordSuccess(false);

    if (passwordForm.newPassword.length < 6)
      return setPasswordError('Password must be at least 6 characters.');
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      return setPasswordError('Passwords do not match.');

    const { error } = await supabase.auth.updateUser({
      password: passwordForm.newPassword,
    });

    if (error) setPasswordError(error.message);
    else {
      setPasswordSuccess(true);
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(false), 3000);
    }
  };

  if (loading) return (
    <div style={{ padding: '4rem', textAlign: 'center' }}>
      <p>Loading profile...</p>
    </div>
  );

  return (
    <div className="profile-page">
      <div className="container">

        <div className="profile-header">
          <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
          <h1>My Profile</h1>
        </div>

        <div className="profile-layout">

          {/* LEFT — Avatar + quick info */}
          <div className="profile-sidebar">
            <div className="profile-avatar-wrap">
              {form.avatar_url ? (
                <img src={form.avatar_url} alt="avatar" className="profile-avatar" />
              ) : (
                <div className="profile-avatar-placeholder">
                  {form.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                </div>
              )}

              <label className="profile-avatar-upload" title="Change photo">
                {avatarUploading ? '⏳' : '📷'}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => handleAvatarUpload(e.target.files[0])}
                />
              </label>
            </div>

            <h2 className="profile-name">{form.full_name || 'Your Name'}</h2>
            <p className="profile-email">{form.email}</p>

            <div className="profile-quick-links">
              <button onClick={() => navigate('/orders')}>📋 My Orders</button>
              <button onClick={() => { logout(); navigate('/'); }}>🚪 Sign Out</button>
            </div>
          </div>

          {/* RIGHT — Edit forms */}
          <div className="profile-main">

            {/* Personal Info */}
            <div className="profile-card">
              <h3>Personal Information</h3>

              <div className="profile-form">
                <div className="profile-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={form.full_name}
                    onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                  />
                </div>

                <div className="profile-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    disabled
                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  />
                  <small style={{ color: 'var(--grey-400)', fontSize: '0.75rem' }}>
                    Email cannot be changed
                  </small>
                </div>

                <div className="profile-field">
                  <label>Avatar URL</label>
                  <input
                    type="text"
                    placeholder="https://... or use 📷 to upload"
                    value={form.avatar_url}
                    onChange={e => setForm(p => ({ ...p, avatar_url: e.target.value }))}
                  />
                </div>
              </div>

              {success && (
                <p className="profile-success">✅ Profile updated successfully!</p>
              )}

              <button
                className="profile-save-btn"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            {/* Change Password */}
            <div className="profile-card">
              <h3>Change Password</h3>

              <div className="profile-form">
                <div className="profile-field">
                  <label>New Password</label>
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                  />
                </div>

                <div className="profile-field">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Repeat new password"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  />
                </div>
              </div>

              {passwordError && <p className="profile-error">{passwordError}</p>}
              {passwordSuccess && <p className="profile-success">✅ Password changed successfully!</p>}

              <button
                className="profile-save-btn"
                onClick={handlePasswordChange}
              >
                Update Password
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;