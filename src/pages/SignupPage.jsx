import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim()) return setError('Please enter your name.');
    if (!form.email.trim()) return setError('Please enter your email.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    setError('');
    setLoading(true);

    const { error: authError } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: { full_name: form.name.trim() },
      },
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      setSuccess(true); // show confirmation message
    }
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  // ✅ Success state — Supabase sends a confirmation email by default
  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-logo" onClick={() => navigate('/')}>TechStore</div>
          <div style={{ fontSize: '3rem', margin: '1rem 0' }}>📧</div>
          <h1 className="auth-title">Check your email</h1>
          <p className="auth-subtitle">
            We sent a confirmation link to <strong>{form.email}</strong>.
            Click it to activate your account, then sign in.
          </p>
          <button
            className="auth-submit-btn"
            style={{ marginTop: '1.5rem' }}
            onClick={() => navigate('/login')}
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-logo" onClick={() => navigate('/')}>TechStore</div>
        <h1 className="auth-title">Create an account</h1>
        <p className="auth-subtitle">Join TechStore and start shopping</p>

        <button className="auth-google-btn" onClick={handleGoogle}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        <div className="auth-divider"><span>or</span></div>

        <div className="auth-form">
          <div className="auth-field">
            <label>Full name</label>
            <input
              type="text"
              placeholder="Aamna Tariq"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            />
          </div>

          <div className="auth-field">
            <label>Email address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            />
          </div>

          <div className="auth-field">
            <label>Confirm password</label>
            <input
              type="password"
              placeholder="Repeat your password"
              value={form.confirm}
              onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
            />
          </div>

          {form.password.length > 0 && (
            <div className="password-strength">
              <div className="strength-bar">
                <div
                  className="strength-fill"
                  style={{
                    width: form.password.length < 6 ? '33%' : form.password.length < 10 ? '66%' : '100%',
                    background: form.password.length < 6 ? '#e74c3c' : form.password.length < 10 ? '#f0a500' : '#27ae60'
                  }}
                />
              </div>
              <span className="strength-label">
                {form.password.length < 6 ? 'Weak' : form.password.length < 10 ? 'Medium' : 'Strong'}
              </span>
            </div>
          )}

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-submit-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="auth-spinner" /> : 'Create Account'}
          </button>

          <p className="auth-terms">
            By signing up you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
          </p>
        </div>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" className="auth-switch-link">Sign in</Link>
        </p>

      </div>
    </div>
  );
}

export default SignupPage;