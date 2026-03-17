import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const menuData = [
  {
    label: 'Audio',
    items: ['All Audio', 'Earbuds', 'Headphones', 'Speakers', 'Microphones']
  },
  {
    label: 'Wearables',
    items: ['All Wearables', 'Smart Watches', 'Fitness Bands', 'Smart Rings', 'AR Glasses']
  },
  {
    label: 'Accessories',
    items: ['All Accessories', 'Charging', 'Cables & Hubs', 'Phone Cases', 'Laptop Stands']
  },
  {
    label: 'Gaming',
    items: ['All Gaming', 'Mice', 'Keyboards', 'Headsets', 'Controllers']
  },
];

function CategoryMenu({ onCategorySelect }) {
  const [activeMenu, setActiveMenu] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSelect = (category) => {
    onCategorySelect(category);
    setActiveMenu(null);
    setMenuOpen(false);
    navigate('/products');
  };

  return (
    <div className="cat-menu-wrapper">

      {/* Hamburger trigger button */}
      <button
        className={`cat-hamburger ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Dropdown panel */}
      {menuOpen && <div className="cat-backdrop" onClick={() => { setMenuOpen(false); setActiveMenu(null); }} />}

      <div className={`cat-dropdown ${menuOpen ? 'open' : ''}`}>
        <div className="cat-dropdown-inner">

          {/* Left: main categories */}
          <div className="cat-main">
            <button
              className={`cat-main-item ${activeMenu === null ? 'active' : ''}`}
              onClick={() => handleSelect('All')}
            >
              All Products
            </button>
            {menuData.map(menu => (
              <button
                key={menu.label}
                className={`cat-main-item ${activeMenu === menu.label ? 'active' : ''}`}
                onMouseEnter={() => setActiveMenu(menu.label)}
                onClick={() => handleSelect(menu.label)}
              >
                {menu.label}
                <span>→</span>
              </button>
            ))}
          </div>

          {/* Right: sub items */}
          <div className="cat-sub">
            {activeMenu ? (
              <>
                <p className="cat-sub-title">{activeMenu}</p>
                {menuData.find(m => m.label === activeMenu)?.items.map(item => (
                  <button
                    key={item}
                    className="cat-sub-item"
                    onClick={() => handleSelect(activeMenu)}
                  >
                    {item}
                  </button>
                ))}
              </>
            ) : (
              <div className="cat-sub-placeholder">
                <span>👆</span>
                <p>Hover a category to explore</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default CategoryMenu;