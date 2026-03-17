import React from 'react';
import { useStore } from '../context/StoreContext';
import Stars from './Stars';

function ProductDetail({ allProducts }) {
  const { selectedProduct, setSelectedProduct, addToCart } = useStore();

  if (!selectedProduct) return null;

  const related = allProducts
    .filter(p => p.category === selectedProduct.category && p.title !== selectedProduct.title)
    .slice(0, 3);

  return (
    <div className="detail-page">
      <div className="container">

        {/* Back button */}
        <button className="detail-back" onClick={() => setSelectedProduct(null)}>
          ← Back to Store
        </button>

        {/* Main product */}
        <div className="detail-inner">
          <div className="detail-img-wrap">
            <img src={selectedProduct.img} alt={selectedProduct.title} />
            {selectedProduct.sale && <span className="sale-badge sale-badge-lg">Sale</span>}
          </div>

          <div className="detail-info">
            <span className="detail-tag">{selectedProduct.category}</span>
            <h1>{selectedProduct.title}</h1>
            <Stars rating={selectedProduct.rating} />

            <p className="detail-price">
              {selectedProduct.originalPrice && (
                <span className="original-price" style={{ fontSize: '1.1rem', marginRight: '0.6rem' }}>
                  {selectedProduct.originalPrice}
                </span>
              )}
              {selectedProduct.price}
            </p>

            <p className="detail-desc">{selectedProduct.description}</p>

            <div className="detail-features">
              <div className="feature">✦ Premium Build Quality</div>
              <div className="feature">✦ 1 Year Warranty</div>
              <div className="feature">✦ Free Shipping Over $50</div>
              <div className="feature">✦ 30-Day Returns</div>
            </div>

            <div className="detail-actions">
              <button
                className="btn-primary detail-btn ripple-btn"
                onClick={() => addToCart(selectedProduct)}
              >
                Add to Cart
              </button>
              <button className="btn-outline-dark ripple-btn">
                ♡ Wishlist
              </button>
            </div>

            <div className="detail-meta">
              <div className="meta-item">
                <span className="meta-icon">🚚</span>
                <div>
                  <strong>Free Delivery</strong>
                  <p>Estimated 3–5 business days</p>
                </div>
              </div>
              <div className="meta-item">
                <span className="meta-icon">🔄</span>
                <div>
                  <strong>Easy Returns</strong>
                  <p>30-day hassle-free returns</p>
                </div>
              </div>
              <div className="meta-item">
                <span className="meta-icon">🛡️</span>
                <div>
                  <strong>Warranty</strong>
                  <p>1 year manufacturer warranty</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="related-section">
            <h3 className="related-title">You Might Also Like</h3>
            <div className="related-grid">
              {related.map((p, i) => (
                <div key={i} className="related-card" onClick={() => setSelectedProduct(p)}>
                  <img src={p.img} alt={p.title} />
                  <h4>{p.title}</h4>
                  <p>{p.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;