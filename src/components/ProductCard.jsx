import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import Stars from './Stars';
import useScrollAnimation from '../hooks/useScrollAnimation';

function ProductCard({ product, index }) {
  const navigate = useNavigate();
  const { addToCart, showToast } = useStore();
  const [ref, isVisible] = useScrollAnimation();
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || null);

  const handleCardClick = () => {
 navigate(`/product/${product.id}`);  // ✅ using Supabase id
    window.scrollTo(0, 0);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart({ ...product, selectedColor: selectedColor?.name });
    showToast(`${product.title} added to cart!`);
  };

  const handleColorClick = (e, color) => {
    e.stopPropagation();
    setSelectedColor(color);
  };

  const hexToTint = (hex) => {
    if (!hex) return '';
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    if (r > 200 && g > 200 && b > 200) return '';
    if (r < 80 && g < 80 && b < 80) return '';
    return hex;
  };

  const tintColor = selectedColor ? hexToTint(selectedColor.hex) : '';

  return (
    <div
      ref={ref}
      className={`product-card scroll-reveal ${isVisible ? 'visible' : ''}`}
      style={{ '--stagger': index % 4 }}
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="product-img-wrap">
        <img src={product.img} alt={product.title} className="product-img" />
        {tintColor && (
          <div className="product-color-tint" style={{ background: tintColor }} />
        )}
        {product.sale && <span className="sale-badge">SALE</span>}
      </div>

      {/* Info */}
      <div className="product-info">
        <p className="product-category">{product.category}</p>
        <h3 className="product-title">{product.title}</h3>
        <p className="product-desc">{product.description?.slice(0, 55)}...</p>

        {/* Stars + rating on one line */}
       <div className="product-rating">
  <Stars rating={product.rating} />
  <span className="rating-num">({product.rating})</span>
</div>

        {/* Color dots — max 3 shown */}
        {product.colors?.length > 0 && (
          <div className="card-colors">
            {product.colors.slice(0, 3).map((color, i) => (
              <button
                key={i}
                className={`card-color-dot ${selectedColor?.name === color.name ? 'active' : ''}`}
                style={{ '--dot-color': color.hex }}
                onClick={(e) => handleColorClick(e, color)}
                title={color.name}
              />
            ))}
            {product.colors.length > 3 && (
              <span className="card-colors-more">+{product.colors.length - 3}</span>
            )}
          </div>
        )}

        {/* Price + button */}
        <div className="product-footer">
          <div className="product-price">
            <span className="price-current">{product.price}</span>
            {product.originalPrice && (
              <span className="price-original">{product.originalPrice}</span>
            )}
          </div>
          <button className="add-to-cart-btn" onClick={handleAddToCart}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;