import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const menuData = {
  'AUDIO': [
    { label: 'All Audio',           value: 'Audio' },
    { label: 'Wireless Earbuds',    value: 'Wireless Earbuds' },
    { label: 'Headphones',          value: 'Noise Cancelling Headphones' },
    { label: 'Bluetooth Speakers',  value: 'Bluetooth Speaker' },
    { label: 'View All',            value: 'All' },
  ],
  'WEARABLES': [
    { label: 'All Wearables',  value: 'Wearables' },
    { label: 'Smart Watches',  value: 'Smart Watch' },
    { label: 'Fitness Bands',  value: 'Fitness Band' },
    { label: 'Smart Rings',    value: 'Smart Ring' },
    { label: 'View All',       value: 'All' },
  ],
  'GAMING': [
    { label: 'All Gaming',          value: 'Gaming' },
    { label: 'Gaming Mouse',        value: 'Gaming Mouse' },
    { label: 'Mechanical Keyboards',value: 'Mechanical Keyboard' },
    { label: 'Gaming Headsets',     value: 'Gaming Headset' },
    { label: 'View All',            value: 'All' },
  ],
  'ACCESSORIES': [
    { label: 'All Accessories', value: 'Accessories' },
    { label: 'Wireless Charger',value: 'Wireless Charger' },
    { label: 'USB-C Hubs',      value: 'USB-C Hub' },
    { label: 'Laptop Stands',   value: 'Laptop Stand' },
    { label: 'View All',        value: 'All' },
  ],
};

function Header({ onHomeClick, onCategorySelect }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('AUDIO');
  const [searchOpen, setSearchOpen] = useState(false);
  const [badgePop, setBadgePop] = useState(false);
  const prevCount = useRef(0);
  const navigate = useNavigate();
  // Update destructure
const { cartCount, setCartOpen, darkMode, toggleDark, searchQuery, setSearchQuery, user, role, logout } = useStore();
  useEffect(() => {
    if (cartCount > prevCount.current) {
      setBadgePop(true);
      setTimeout(() => setBadgePop(false), 400);
    }
    prevCount.current = cartCount;
  }, [cartCount]);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

 const handleCategoryClick = (item) => {
  setMenuOpen(false);
  onCategorySelect && onCategorySelect(item.value);
  navigate('/');
};
  return (
    <>
      {/* Overlay menu */}
      {menuOpen && (
        <div className="nav-overlay" onClick={() => setMenuOpen(false)} />
      )}

      <div className={`nav-drawer ${menuOpen ? 'open' : ''}`}>
        <div className="nav-drawer-header">
          <Link to="/" className="nav-drawer-logo" onClick={() => { setMenuOpen(false); onHomeClick && onHomeClick(); }}>
            TechStore
          </Link>
          <button className="nav-drawer-close" onClick={() => setMenuOpen(false)}>✕</button>
        </div>

        {/* Category tabs */}
        <div className="nav-drawer-tabs">
          {Object.keys(menuData).map(tab => (
            <button
              key={tab}
              className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Category items */}
        <div className="nav-drawer-items">
          {menuData[activeTab].map((item, i) => (
  <button
    key={i}
    className="nav-drawer-item"
    onClick={() => handleCategoryClick(item)}
  >
    {item.label.toUpperCase()}
  </button>
  
))}
        </div>
      </div>

      {/* Sticky header bar */}
      <header className="main-header">
        <div className="header-container">

          {/* Left */}
          <div className="header-left">
            <button
              className={`hamburger-btn ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
            <Link
              to="/"
              className="logo"
              onClick={() => { onHomeClick && onHomeClick(); }}
            >
              TechStore
            </Link>
          </div>

          {/* Right icons */}
          <div className="header-icons">

            {/* Search */}
            <div className={`search-wrapper ${searchOpen ? 'open' : ''}`}>
              {searchOpen && (
                <input
                  className="search-input"
                  type="text"
                  placeholder="I'm looking for..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoFocus
                />
              )}
              <button
                className="hdr-icon-btn"
                onClick={() => { setSearchOpen(!searchOpen); setSearchQuery(''); }}
                aria-label="Search"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </button>
            </div>

            {/* Dark mode toggle */}
            <button
              className="hdr-icon-btn"
onClick={() => toggleDark()}
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>

            {/* Account */}
           {/* Account */}
{user ? (
  <div className="hdr-account-wrap">
    <button className="hdr-icon-btn hdr-account-btn" title={user.email}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
      <span className="hdr-account-dot" />
    </button>
    <div className="hdr-account-dropdown">
      <div className="hdr-account-dropdown">
  <p className="hdr-account-email">{user.email}</p>
  <hr />
  {role === 'admin' && (
    <button onClick={() => navigate('/admin')}>🛠 Admin Panel</button>
  )}
  <button onClick={() => navigate('/orders')}>📋 My Orders</button>
  <button onClick={() => navigate('/profile')}>👤 My Profile</button>
  <button onClick={() => logout()}>Sign Out</button>
</div>
      <p className="hdr-account-email">{user.email}</p>
      <hr />
      <button onClick={() => logout()}>Sign Out</button>
    </div>
  </div>
) : (
  <Link to="/login" className="hdr-icon-btn" aria-label="Account">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  </Link>
)}
            {/* Cart */}
            <button className="hdr-icon-btn cart-icon-btn" onClick={() => setCartOpen(true)} aria-label="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {cartCount > 0 && (
                <span className={`cart-badge ${badgePop ? 'pop' : ''}`}>{cartCount}</span>
              )}
            </button>

          </div>
        </div>
      </header>
    </>
  );
}

export default Header;