import React, { useState, useEffect, useRef } from 'react';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import HeroSlider from '../components/HeroSlider';
import CategoryStrip from '../components/CategoryStrip';
import { useStore } from '../context/StoreContext';

const defaultFilters = {
  category: 'All',
  maxPrice: 500,
  minRating: 0,
  saleOnly: false,
  sortBy: 'default'
};

const knownCategories = ['All', 'Audio', 'Wearables', 'Gaming', 'Accessories'];

function Home({ scrollToProducts = false, selectedCategory = 'All' }) {
  const { products, productsLoading, searchQuery } = useStore();
  const [filters, setFilters] = useState({ ...defaultFilters, category: selectedCategory });
  const [filterOpen, setFilterOpen] = useState(false);
  const productsRef = useRef(null);

  useEffect(() => {
    setFilters(prev => ({ ...prev, category: selectedCategory }));
    if (selectedCategory !== 'All' && productsRef.current) {
      setTimeout(() => {
        productsRef.current.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (scrollToProducts && productsRef.current) {
      setTimeout(() => {
        productsRef.current.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [scrollToProducts]);

  const handleCategoryFromStrip = (val) => {
    setFilters(prev => ({ ...prev, category: val }));
    setTimeout(() => {
      productsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

let filtered = products.filter(p => {
  if (!p || !p.title) return false;
  const matchSearch = p.title.toLowerCase().includes((searchQuery || '').toLowerCase());

  let matchCat = true;
  if (filters.category === 'All') {
    matchCat = true;
  } else if (knownCategories.includes(filters.category)) {
    matchCat = (p.category || '') === filters.category;
  } else {
    matchCat = (p.title || '').toLowerCase().includes(filters.category.toLowerCase());
  }

  const matchPrice = parseFloat((p.price || '$0').replace('$', '')) <= filters.maxPrice;
  const matchRating = (p.rating || 0) >= filters.minRating;
  const matchSale = filters.saleOnly ? p.sale === true : true;
  return matchSearch && matchCat && matchPrice && matchRating && matchSale;
});

  const activeFilterCount = [
    filters.category !== 'All',
    filters.maxPrice < 500,
    filters.minRating > 0,
    filters.saleOnly,
    filters.sortBy !== 'default'
  ].filter(Boolean).length;

  return (
    <>
      <HeroSlider />

      <CategoryStrip
        onCategorySelect={handleCategoryFromStrip}
        activeCategory={filters.category}
      />

      <main className="container" ref={productsRef}>
        <div className="products-toolbar">
          <div className="section-label" style={{ margin: '3rem 0 0' }}>
            <span>Our Products</span>
            <h2>
              {searchQuery
                ? `Results for "${searchQuery}"`
                : filters.category !== 'All'
                  ? filters.category
                  : 'Featured Accessories'
              }
            </h2>
          </div>

          <button
            className={`filter-trigger ${activeFilterCount > 0 ? 'has-filters' : ''}`}
            onClick={() => setFilterOpen(true)}
          >
            <span>⚙</span>
            Filters
            {activeFilterCount > 0 && (
              <span className="filter-count">{activeFilterCount}</span>
            )}
          </button>
        </div>

        <div className="results-bar">
          <span>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} out of {products.length}
            {filters.category !== 'All' && (
              <button
                style={{
                  marginLeft: '0.75rem',
                  background: 'transparent',
                  color: 'var(--accent)',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer'
                }}
                onClick={() => setFilters(defaultFilters)}
              >
                Clear filter ✕
              </button>
            )}
          </span>
        </div>

        <section className="products">
          {productsLoading ? (
            <div className="products-loading">Loading products...</div>
          ) : filtered.length > 0 ? (
            filtered.map((p, i) => (
              <ProductCard key={p.id || i} product={p} index={i} />
            ))
          ) : (
            <div className="no-results">
              <span>🔍</span>
              <h3>No products found</h3>
              <p>Try adjusting your filters</p>
              <button
                className="btn-primary"
                onClick={() => setFilters(defaultFilters)}
              >
                Clear Filters
              </button>
            </div>
          )}
        </section>
      </main>

      <FilterSidebar
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        totalCount={products.length}
      />
    </>
  );
}

export default Home;