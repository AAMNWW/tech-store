import React, { useRef, useEffect, useState } from 'react';

const categories = [
  { label: 'All Products',      img: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=200&q=80', value: 'All' },
  { label: 'Wireless Earbuds',  img: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=200&q=80', value: 'Audio' },
  { label: 'Headphones',        img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80', value: 'Audio' },
  { label: 'Smart Watches',     img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80', value: 'Wearables' },
  { label: 'Fitness Bands',     img: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=200&q=80', value: 'Wearables' },
  { label: 'Gaming Mouse',      img: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=200&q=80', value: 'Gaming' },
  { label: 'Keyboards',         img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200&q=80', value: 'Gaming' },
  { label: 'Accessories',       img: 'https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=200&q=80', value: 'Accessories' },
  { label: 'Speakers',          img: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=200&q=80', value: 'Audio' },
  { label: 'Wireless Charger',  img: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=200&q=80', value: 'Accessories' },
  { label: 'Gaming Headset',    img: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=200&q=80', value: 'Gaming' },
  { label: 'Smart Ring',        img: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=200&q=80', value: 'Wearables' },
];

const ITEM_WIDTH = 150; // px per item
const VISIBLE = 7;      // items visible at once

function CategoryStrip({ onCategorySelect }) {
  const [startIndex, setStartIndex] = useState(0);
  const [active, setActive] = useState(0);
  const [sliding, setSliding] = useState(false);

  const maxStart = categories.length - VISIBLE;

  const slideTo = (newStart) => {
    if (sliding) return;
    const clamped = Math.max(0, Math.min(newStart, maxStart));
    setSliding(true);
    setStartIndex(clamped);
    setTimeout(() => setSliding(false), 500);
  };

  const prev = () => slideTo(startIndex - 1);
  const next = () => slideTo(startIndex + 1);

  // Auto advance every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setStartIndex(prev => {
        const next = prev + 1;
        return next > maxStart ? 0 : next;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [maxStart]);

  const handleClick = (cat, i) => {
    setActive(i);
    onCategorySelect && onCategorySelect(cat.value);
  };

  return (
    <div className="cat-strip-section">
      {/* Left arrow */}
      <button
        className="cat-strip-arrow left"
        onClick={prev}
        disabled={startIndex === 0}
      >
        &#8249;
      </button>

      {/* Viewport */}
      <div className="cat-strip-viewport">
        <div
          className="cat-strip-track"
          style={{ transform: `translateX(-${startIndex * ITEM_WIDTH}px)` }}
        >
          {categories.map((cat, i) => (
            <button
              key={i}
              className={`cat-strip-item ${active === i ? 'active' : ''}`}
              onClick={() => handleClick(cat, i)}
            >
              <div className="cat-strip-img">
                <img src={cat.img} alt={cat.label} />
              </div>
              <span>{cat.label.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right arrow */}
      <button
        className="cat-strip-arrow right"
        onClick={next}
        disabled={startIndex >= maxStart}
      >
        &#8250;
      </button>
    </div>
  );
}

export default CategoryStrip;