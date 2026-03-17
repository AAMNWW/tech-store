import React from 'react';

const categories = ['All', 'Audio', 'Wearables', 'Accessories', 'Gaming'];

function CategoryFilter({ active, onChange }) {
  return (
    <div className="category-filter">
      {categories.map(cat => (
        <button
          key={cat}
          className={`cat-btn ${active === cat ? 'active' : ''}`}
          onClick={() => onChange(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

export default CategoryFilter;