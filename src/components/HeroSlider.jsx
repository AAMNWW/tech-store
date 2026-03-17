import React, { useState, useEffect } from 'react';

const slides = [
  {
    img: '/image.png',
    tag: 'New Collection 2025',
    title: 'The Future of\nTech Accessories',
    subtitle: 'Premium gear crafted for those who demand more.',
  },
  {
    img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&q=80',
    tag: 'Best Seller',
    title: 'Noise Cancelling\nHeadphones',
    subtitle: 'Industry-leading ANC. 40hr battery. Pure audio bliss.',
  },
  {
    img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600&q=80',
    tag: 'New Arrival',
    title: 'Smart Watch\nPro Series',
    subtitle: 'Track everything. Stay connected. Look incredible.',
  },
  {
    img: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=1600&q=80',
    tag: 'Limited Deal',
    title: 'Wireless Earbuds\nElite Edition',
    subtitle: 'Crystal clear audio. All day comfort. Zero wires.',
  },
];

function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = (index) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 400);
  };

  const prev = () => goTo((current - 1 + slides.length) % slides.length);
  const next = () => goTo((current + 1) % slides.length);

  useEffect(() => {
    const timer = setInterval(() => next(), 5000);
    return () => clearInterval(timer);
  }, [current]);

  const slide = slides[current];

  return (
    <div className="hero-slider">
      <div className={`hero-slide ${animating ? 'fade-out' : 'fade-in'}`}>
        <img className="hero-bg" src={slide.img} alt={slide.title} />
        <div className="hero-overlay" />
        <div className="hero-content">
          <span className="hero-tag">{slide.tag}</span>
          <h1>{slide.title.split('\n').map((line, i) => (
            <span key={i}>{line}<br /></span>
          ))}</h1>
          <p>{slide.subtitle}</p>
          <div className="hero-actions">
            <button className="btn-primary ripple-btn">Shop Now</button>
            <button className="btn-secondary ripple-btn">Learn More</button>
          </div>
        </div>
      </div>

      {/* Arrows */}
      <button className="slider-arrow left" onClick={prev}>&#8249;</button>
      <button className="slider-arrow right" onClick={next}>&#8250;</button>

      {/* Dots */}
      <div className="slider-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`slider-dot ${i === current ? 'active' : ''}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  );
}

export default HeroSlider;