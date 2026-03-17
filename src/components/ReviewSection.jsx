import React, { useState, useEffect } from 'react';
import Stars from './Stars';
import { supabase } from '../lib/supabase';
import { useStore } from '../context/StoreContext';

function StarInput({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="star-input">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          className={`star-input-btn ${star <= (hovered || value) ? 'active' : ''}`}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function ReviewSection({ productId, productTitle }) {

  const { user, fetchProducts } = useStore();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', text: '', rating: 0 });
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ✅ Load reviews from Supabase
  useEffect(() => {
    if (!productId) return;
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (!error) setReviews(data || []);
    setLoading(false);
  };

  // ✅ Pre-fill name if logged in
  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.full_name) {
            setForm(p => ({ ...p, name: data.full_name }));
          }
        });
    }
  }, [user]);

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percent: reviews.length
      ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100
      : 0,
  }));

  // ✅ Save review to Supabase
  const handleSubmit = async () => {
    if (!form.name.trim()) return setError('Please enter your name.');
    if (form.rating === 0) return setError('Please select a star rating.');
    if (!form.text.trim()) return setError('Please write a review.');

    // Must be logged in
    if (!user) return setError('Please log in to submit a review.');

    setError('');
    setSubmitting(true);

    const { error: insertError } = await supabase.from('reviews').insert([{
      product_id: productId,
      user_id: user.id,
      user_name: form.name.trim(),
      rating: form.rating,
      comment: form.text.trim(),
    }]);

    setSubmitting(false);

    if (insertError) {
      setError('Failed to submit review. Please try again.');
      console.error(insertError);
    } else {
      setForm({ name: '', text: '', rating: 0 });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      fetchReviews(); // reload reviews
      fetchProducts(); 
    }
  };

  // ✅ Delete own review
  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete your review?')) return;
    await supabase.from('reviews').delete().eq('id', reviewId);
    fetchReviews();
  };

  return (
    <div className="review-section">

      {/* Header */}
      <div className="review-header">
        <h2 className="review-heading">Customer Reviews</h2>
        <span className="review-count">
          {reviews.length} review{reviews.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Summary */}
      {reviews.length > 0 && (
        <div className="review-summary">
          <div className="review-avg">
            <span className="review-avg-number">{avgRating}</span>
            <Stars rating={parseFloat(avgRating)} />
            <span className="review-avg-label">out of 5</span>
          </div>
          <div className="review-bars">
            {ratingCounts.map(({ star, count, percent }) => (
              <div key={star} className="review-bar-row">
                <span className="review-bar-label">{star} ★</span>
                <div className="review-bar-track">
                  <div className="review-bar-fill" style={{ width: `${percent}%` }} />
                </div>
                <span className="review-bar-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Write a review form */}
      <div className="review-form-box">
        <h3 className="review-form-title">Write a Review</h3>

        {!user && (
          <p className="review-login-notice">
            Please <a href="/login">sign in</a> to submit a review.
          </p>
        )}

        <div className="review-form-group">
          <label>Your Name</label>
          <input
            type="text"
            className="review-input"
            placeholder="e.g. Alex M."
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          />
        </div>

        <div className="review-form-group">
          <label>Your Rating</label>
          <StarInput
            value={form.rating}
            onChange={val => setForm(p => ({ ...p, rating: val }))}
          />
        </div>

        <div className="review-form-group">
          <label>Your Review</label>
          <textarea
            className="review-textarea"
            placeholder={`Share your experience with ${productTitle}...`}
            rows={4}
            value={form.text}
            onChange={e => setForm(p => ({ ...p, text: e.target.value }))}
          />
        </div>

        {error && <p className="review-error">{error}</p>}
        {submitted && <p className="review-success">✓ Review submitted successfully!</p>}

        <button
          className="btn-primary review-submit-btn"
          onClick={handleSubmit}
          disabled={submitting || !user}
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>

      {/* Reviews list */}
      {loading ? (
        <p style={{ padding: '2rem', color: 'var(--grey-400)' }}>Loading reviews...</p>
      ) : reviews.length > 0 ? (
        <div className="review-list">
          {reviews.map((r) => (
            <div key={r.id} className="review-card">
              <div className="review-card-top">
                <div className="review-avatar">
                  {r.user_name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="review-card-meta">
                  <span className="review-card-name">{r.user_name}</span>
                  <span className="review-card-date">
                    {new Date(r.created_at).toLocaleDateString('en-US', {
                      month: 'short', year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="review-card-stars">
                  <Stars rating={r.rating} />
                </div>
                {/* ✅ Delete button for own reviews */}
                {user && user.id === r.user_id && (
                  <button
                    className="review-delete-btn"
                    onClick={() => handleDelete(r.id)}
                    title="Delete review"
                  >
                    ✕
                  </button>
                )}
              </div>
              <p className="review-card-text">{r.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="review-empty">
          <span>💬</span>
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
      )}
    </div>
  );
}

export default ReviewSection;