import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Footer({ onCategorySelect }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (!email.includes('@')) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  const goCategory = (cat) => {
    onCategorySelect && onCategorySelect(cat);
    navigate('/');
    setTimeout(() => {
      document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Top grid */}
        <div className="footer-grid">

          {/* Brand column */}
          <div className="footer-brand">
            <div className="footer-logo" onClick={() => navigate('/')}>TechStore</div>
            <p className="footer-tagline">Premium tech accessories for the modern world. Quality gear, delivered fast.</p>
            <div className="footer-socials">
              {/* Instagram */}
              <a href="#" className="social-icon" title="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              {/* Twitter/X */}
              <a href="#" className="social-icon" title="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              {/* Facebook */}
              <a href="#" className="social-icon" title="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              {/* YouTube */}
              <a href="#" className="social-icon" title="YouTube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Shop column */}
          <div className="footer-col">
            <h4>Shop</h4>
            <ul>
              <li><button onClick={() => goCategory('Audio')}>Audio</button></li>
              <li><button onClick={() => goCategory('Wearables')}>Wearables</button></li>
              <li><button onClick={() => goCategory('Gaming')}>Gaming</button></li>
              <li><button onClick={() => goCategory('Accessories')}>Accessories</button></li>
              <li><button onClick={() => { navigate('/'); }}>All Products</button></li>
            </ul>
          </div>

          {/* Company column */}
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><button onClick={() => navigate('/about')}>About Us</button></li>
              <li><button onClick={() => navigate('/contact')}>Contact</button></li>
              <li><button onClick={() => navigate('/about')}>Careers</button></li>
              <li><button onClick={() => navigate('/about')}>Press</button></li>
            </ul>
          </div>

          {/* Support column */}
          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><button onClick={() => navigate('/contact')}>FAQ</button></li>
              <li><button onClick={() => navigate('/contact')}>Shipping Info</button></li>
              <li><button onClick={() => navigate('/contact')}>Returns</button></li>
              <li><button onClick={() => navigate('/contact')}>Track Order</button></li>
              <li><button onClick={() => navigate('/contact')}>Help Center</button></li>
            </ul>
          </div>

          {/* Newsletter column */}
          <div className="footer-col footer-newsletter">
            <h4>Stay Updated</h4>
            <p>Get the latest deals and new arrivals straight to your inbox.</p>
            {subscribed ? (
              <div className="newsletter-success">✓ Thanks for subscribing!</div>
            ) : (
              <div className="newsletter-form">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
                />
                <button onClick={handleSubscribe}>→</button>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider" />

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p className="footer-copyright">© 2025 TechStore. All rights reserved.</p>

          {/* Payment icons */}
          <div className="footer-payments">
            <span className="payment-icon">VISA</span>
            <span className="payment-icon">MC</span>
            <span className="payment-icon">AMEX</span>
            <span className="payment-icon">PayPal</span>
            <span className="payment-icon">Apple Pay</span>
          </div>

          <div className="footer-legal">
            <button onClick={() => navigate('/contact')}>Privacy Policy</button>
            <button onClick={() => navigate('/contact')}>Terms of Service</button>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;