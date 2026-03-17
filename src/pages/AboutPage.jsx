import React from 'react';
import { useNavigate } from 'react-router-dom';
import useScrollAnimation from '../hooks/useScrollAnimation';
function AboutPage() {
  const navigate = useNavigate();
  const [ref1, v1] = useScrollAnimation();
  const [ref2, v2] = useScrollAnimation();

  return (
    <div className="about-page">

      <div className="about-hero">
        <div className="container">
          <button className="detail-back" onClick={() => navigate(-1)}>← Back</button>
          <span className="hero-tag">Our Story</span>
          <h1>Built for Tech Lovers,<br />By Tech Lovers</h1>
          <p>We believe great accessories shouldn't cost a fortune.</p>
        </div>
      </div>

      <div className="container">
        <div ref={ref1} className={`about-grid scroll-reveal ${v1 ? 'visible' : ''}`}>
          <div className="about-card">
            <span className="about-icon">🎯</span>
            <h3>Our Mission</h3>
            <p>To make premium tech accessories accessible to everyone without compromising on quality or design.</p>
          </div>
          <div className="about-card">
            <span className="about-icon">🌍</span>
            <h3>Global Reach</h3>
            <p>Shipping to over 50 countries worldwide with fast, reliable delivery and easy returns.</p>
          </div>
          <div className="about-card">
            <span className="about-icon">⭐</span>
            <h3>Quality First</h3>
            <p>Every product is tested and verified before it reaches our store. We only sell what we'd use ourselves.</p>
          </div>
        </div>

        <div ref={ref2} className={`about-stats scroll-reveal ${v2 ? 'visible' : ''}`}>
          <div className="stat">
            <h2>50K+</h2>
            <p>Happy Customers</p>
          </div>
          <div className="stat">
            <h2>200+</h2>
            <p>Products</p>
          </div>
          <div className="stat">
            <h2>50+</h2>
            <p>Countries</p>
          </div>
          <div className="stat">
            <h2>4.8★</h2>
            <p>Average Rating</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;