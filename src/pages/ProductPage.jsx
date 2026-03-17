import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import Stars from '../components/Stars';
import ReviewSection from '../components/ReviewSection';

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, productsLoading, addToCart, showToast } = useStore();

  const [activeImg, setActiveImg] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);

  // Find product by Supabase id (string match)
  const product = products.find(p => String(p.id) === String(id));

  // Set default color when product loads
  useEffect(() => {
    if (product?.colors?.length) {
      setSelectedColor(product.colors[0]);
    }
  }, [id, product]);

  // Reset image index when product changes
  useEffect(() => {
    setActiveImg(0);
  }, [id]);

  if (productsLoading) return (
    <div style={{ padding: '4rem', textAlign: 'center' }}>
      <p>Loading product...</p>
    </div>
  );

  if (!product) return (
    <div style={{ padding: '4rem', textAlign: 'center' }}>
      <h2>Product not found</h2>
      <button className="btn-primary" onClick={() => navigate('/')}>Go Home</button>
    </div>
  );

  const images = product.images || [product.img, product.img, product.img, product.img];

  const prev = () => setActiveImg(i => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setActiveImg(i => (i === images.length - 1 ? 0 : i + 1));

  const price = parseFloat((product.price || '$0').replace('$', ''));

  const handleAddToCart = () => {
    addToCart({ ...product, selectedColor: selectedColor?.name });
    showToast(`${product.title}${selectedColor?.name ? ` (${selectedColor.name})` : ''} added to cart!`);
  };

  // Related products: same category, different id
  const related = products
    .filter(p => p.category === product.category && String(p.id) !== String(id))
    .slice(0, 3);

  return (
    <div className="detail-page">
      <div className="container">

        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

        <div className="detail-layout">

          {/* IMAGE GALLERY */}
          <div className="gallery">
            <div className="gallery-main" onClick={() => setZoomed(true)}>
              <img
                src={images[activeImg]}
                alt={product.title}
                className="gallery-main-img"
              />
              <button className="gallery-arrow left" onClick={e => { e.stopPropagation(); prev(); }}>‹</button>
              <button className="gallery-arrow right" onClick={e => { e.stopPropagation(); next(); }}>›</button>
              <div className="gallery-counter">{activeImg + 1} / {images.length}</div>
              {product.sale && <span className="detail-sale-badge">SALE</span>}
              <div className="gallery-zoom-hint">🔍 Click to zoom</div>
            </div>

            <div className="gallery-thumbs">
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`gallery-thumb ${activeImg === i ? 'active' : ''}`}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={img} alt={`View ${i + 1}`} />
                </button>
              ))}
            </div>
          </div>

          {/* PRODUCT INFO */}
          <div className="detail-info">
            <span className="detail-category">{product.category}</span>
            <h1 className="detail-title">{product.title}</h1>

            <div className="detail-rating">
              <Stars rating={product.rating} />
              <span>{product.rating} out of 5</span>
            </div>

            <div className="detail-price">
              <span className="detail-current-price">{product.price}</span>
              {product.originalPrice && (
                <span className="detail-original-price">{product.originalPrice}</span>
              )}
              {product.sale && product.originalPrice && (
                <span className="detail-save">
                  Save ${(parseFloat(product.originalPrice.replace('$', '')) - price).toFixed(0)}
                </span>
              )}
            </div>

            {/* Color selector */}
            {product.colors?.length > 0 && (
              <div className="variant-section">
                <div className="variant-label">
                  <span>Color</span>
                  <strong>{selectedColor?.name}</strong>
                </div>
                <div className="color-swatches">
                  {product.colors.map((color, i) => (
                    <button
                      key={i}
                      className={`color-swatch ${selectedColor?.name === color.name ? 'active' : ''}`}
                      style={{ '--swatch-color': color.hex }}
                      onClick={() => setSelectedColor(color)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            <p className="detail-description">{product.description}</p>

            <div className="detail-features">
              <h3>Key Features</h3>
              <ul>
                {(product.features || [
                  'Premium build quality',
                  'Advanced technology',
                  'Ergonomic design',
                  '1-year warranty included',
                ]).map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>

            <div className="detail-actions">
              <button className="btn-primary detail-cart-btn" onClick={handleAddToCart}>
                Add to Cart
              </button>
              <button className="btn-secondary detail-wish-btn">♡ Wishlist</button>
            </div>

            <div className="detail-meta">
              <div className="meta-card">🚚<span>Free Delivery</span><small>Orders over $50</small></div>
              <div className="meta-card">↩<span>Easy Returns</span><small>30-day policy</small></div>
              <div className="meta-card">🛡<span>Warranty</span><small>1 year included</small></div>
            </div>
          </div>
        </div>
        
<ReviewSection
  productId={product.id}
  productTitle={product.title}
/>

        {/* Related products */}
        {related.length > 0 && (
          <div className="related-section">
            <h2 className="related-title">You May Also Like</h2>
            <div className="related-grid">
              {related.map(p => (
                <div
                  key={p.id}
                  className="related-card"
                  onClick={() => { navigate(`/product/${p.id}`); window.scrollTo(0, 0); }}
                >
                  <div className="related-img">
                    <img src={p.img} alt={p.title} />
                  </div>
                  <div className="related-info">
                    <p>{p.title}</p>
                    <span>{p.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ZOOM LIGHTBOX */}
      {zoomed && (
        <div className="lightbox" onClick={() => setZoomed(false)}>
          <button className="lightbox-close" onClick={() => setZoomed(false)}>✕</button>
          <button className="lightbox-arrow left" onClick={e => { e.stopPropagation(); prev(); }}>‹</button>
          <img
            src={images[activeImg]}
            alt={product.title}
            className="lightbox-img"
            onClick={e => e.stopPropagation()}
          />
          <button className="lightbox-arrow right" onClick={e => { e.stopPropagation(); next(); }}>›</button>
          <div className="lightbox-counter">{activeImg + 1} / {images.length}</div>
        </div>
      )}
    </div>
  );
}

export default ProductPage;