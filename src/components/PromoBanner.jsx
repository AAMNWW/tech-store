import React, { useState } from 'react';

function PromoBanner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  const text = '🎉 Summer Sale — Up to 40% off selected items          ✦          🚚 Free shipping on orders over $50          ✦          ';

  return (
    <div className="promo-banner">
      <div className="promo-marquee-wrapper">
        <div className="promo-marquee">
          <span>{text}{text}</span>
        </div>
      </div>
      <button className="promo-close" onClick={() => setVisible(false)}>✕</button>
    </div>
  );
}

export default PromoBanner;