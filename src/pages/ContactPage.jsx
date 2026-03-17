import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ContactPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = () => {
    if (!form.name || !form.email || !form.message) return;
    setSent(true);
  };

  return (
    <div className="contact-page">
      <div className="container">

        <button className="detail-back" onClick={() => navigate(-1)}>← Back</button>

        <div className="section-label" style={{ marginTop: '1rem' }}>
          <span>Get In Touch</span>
          <h2>Contact Us</h2>
        </div>

        <div className="contact-grid">
          <div className="contact-info">
            <div className="contact-item">
              <span>📍</span>
              <div>
                <strong>Address</strong>
                <p>123 Tech Street, Silicon Valley, CA</p>
              </div>
            </div>
            <div className="contact-item">
              <span>📧</span>
              <div>
                <strong>Email</strong>
                <p>hello@techstore.com</p>
              </div>
            </div>
            <div className="contact-item">
              <span>📞</span>
              <div>
                <strong>Phone</strong>
                <p>+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="contact-item">
              <span>🕐</span>
              <div>
                <strong>Hours</strong>
                <p>Mon–Fri, 9am–6pm PST</p>
              </div>
            </div>
          </div>

          <div className="contact-form">
            {sent ? (
              <div className="form-success">
                <span>✅</span>
                <h3>Message Sent!</h3>
                <p>We'll get back to you within 24 hours.</p>
                <button className="btn-primary" onClick={() => setSent(false)}>
                  Send Another
                </button>
              </div>
            ) : (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handle}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handle}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handle}
                    placeholder="How can we help?"
                    rows={5}
                  />
                </div>
                <button className="btn-primary ripple-btn" onClick={submit}>
                  Send Message
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;