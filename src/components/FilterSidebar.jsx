import React from 'react';


function FilterSidebar({ open, onClose, filters, onChange, resultCount, totalCount }) {

  const handlePrice = (e) => onChange({ ...filters, maxPrice: parseInt(e.target.value) });
  const handleRating = (r) => onChange({ ...filters, minRating: r });
  const handleSale = () => onChange({ ...filters, saleOnly: !filters.saleOnly });
  const handleSort = (e) => onChange({ ...filters, sortBy: e.target.value });

  const resetAll = () => onChange({
    category: 'All',
    maxPrice: 500,
    minRating: 0,
    saleOnly: false,
    sortBy: 'default'
  });

  return (
    <>
      {open && <div className="filter-backdrop" onClick={onClose} />}

      <div className={`filter-sidebar ${open ? 'open' : ''}`}>

        {/* Header */}
        <div className="filter-header">
          <h2>Filters</h2>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>

        {/* Results count */}
        <div className="filter-results">
          <span>{resultCount} results out of {totalCount}</span>
          <button className="filter-reset" onClick={resetAll}>Reset All</button>
        </div>

        {/* Sort by */}
        <div className="filter-section">
          <h4>Sort By</h4>
          <select
            className="filter-select"
            value={filters.sortBy}
            onChange={handleSort}
          >
            <option value="default">Default</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
          </select>
        </div>


        {/* Price Range */}
        <div className="filter-section">
          <h4>Max Price <span className="filter-value">${filters.maxPrice}</span></h4>
          <input
            type="range"
            min="20"
            max="500"
            step="10"
            value={filters.maxPrice}
            onChange={handlePrice}
            className="filter-range"
          />
          <div className="filter-range-labels">
            <span>$20</span>
            <span>$500</span>
          </div>
        </div>

        {/* Rating */}
        <div className="filter-section">
          <h4>Minimum Rating</h4>
          <div className="filter-ratings">
            {[0, 3, 3.5, 4, 4.5].map(r => (
              <button
                key={r}
                className={`filter-rating-btn ${filters.minRating === r ? 'active' : ''}`}
                onClick={() => handleRating(r)}
              >
                {r === 0 ? 'All' : `${r}★ & up`}
              </button>
            ))}
          </div>
        </div>

        {/* Sale Only */}
        <div className="filter-section">
          <div className="filter-toggle-row">
            <div>
              <h4>Sale Items Only</h4>
              <p>Show discounted products</p>
            </div>
            <button
              className={`toggle-btn ${filters.saleOnly ? 'active' : ''}`}
              onClick={handleSale}
            >
              <span className="toggle-knob" />
            </button>
          </div>
        </div>

      </div>
    </>
  );
}

export default FilterSidebar;