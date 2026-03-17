import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { supabase } from '../lib/supabase';

const STEPS = ['Cart', 'Shipping', 'Payment', 'Confirmation'];

const VALID_COUPONS = {
  'TECH10': 10,
  'SAVE20': 20,
  'FIRST15': 15,
};

function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, updateQty, removeFromCart, clearCart, user, showToast } = useStore();

  const [step, setStep] = useState(0);
  const [coupon, setCoupon] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderNumber] = useState(() => '#TS' + Math.floor(Math.random() * 90000 + 10000));

  const [shipping, setShipping] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '', zip: '', country: 'Pakistan',
  });

  const [payment, setPayment] = useState({
    cardName: '', cardNumber: '', expiry: '', cvv: '',
  });

  const [shippingMethod, setShippingMethod] = useState('standard');
  const [errors, setErrors] = useState({});
  // Pre-fill shipping if logged in
useEffect(() => {
  if (!user) return;
  const fetchAddress = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('shipping_address, full_name')
      .eq('id', user.id)
      .single();

    if (data?.shipping_address) {
      setShipping(prev => ({
        ...prev,
        ...data.shipping_address,
        email: user.email || '',
      }));
    } else if (data?.full_name) {
      const parts = data.full_name.split(' ');
      setShipping(prev => ({
        ...prev,
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || '',
        email: user.email || '',
      }));
    }
  };
  fetchAddress();
}, [user]);

  const subtotal = cart.reduce((sum, item) => {
    return sum + parseFloat(item.price.replace('$', '')) * item.qty;
  }, 0);

  const shippingCost = subtotal > 50 ? 0 : shippingMethod === 'express' ? 15 : 5;
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount + shippingCost;

  const applyCoupon = () => {
    const code = couponInput.toUpperCase().trim();
    if (VALID_COUPONS[code]) {
      setCoupon(code);
      setDiscount(VALID_COUPONS[code]);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code.');
    }
  };

  const removeCoupon = () => {
    setCoupon('');
    setDiscount(0);
    setCouponInput('');
    setCouponError('');
  };

  const formatCard = (val) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (val) =>
    val.replace(/\D/g, '').slice(0, 4).replace(/(.{2})/, '$1/');

  const validateShipping = () => {
    const e = {};
    if (!shipping.firstName.trim()) e.firstName = 'Required';
    if (!shipping.lastName.trim()) e.lastName = 'Required';
    if (!shipping.email.trim()) e.email = 'Required';
    if (!shipping.address.trim()) e.address = 'Required';
    if (!shipping.city.trim()) e.city = 'Required';
    if (!shipping.zip.trim()) e.zip = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePayment = () => {
    const e = {};
    if (!payment.cardName.trim()) e.cardName = 'Required';
    if (payment.cardNumber.replace(/\s/g, '').length < 16) e.cardNumber = 'Enter valid card number';
    if (payment.expiry.length < 5) e.expiry = 'Required';
    if (payment.cvv.length < 3) e.cvv = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveOrder = async () => {
    const orderData = {
      user_id: user?.id || null,
      items: cart.map(item => ({
        title: item.title,
        qty: item.qty,
        price: item.price,
        img: item.img,
        selectedColor: item.selectedColor || null,
      })),
      total: parseFloat(total.toFixed(2)),
      status: 'pending',
      shipping_address: {
        name: `${shipping.firstName} ${shipping.lastName}`,
        email: shipping.email,
        phone: shipping.phone,
        address: shipping.address,
        city: shipping.city,
        state: shipping.state,
        zip: shipping.zip,
        country: shipping.country,
        method: shippingMethod,
      },
    };

    const { error } = await supabase.from('orders').insert([orderData]);
    if (error) {
      console.error('Order save error:', error);
      showToast('Order placed but could not be saved. Contact support.');
    }

    // ✅ ADD THIS BELOW
    if (user) {
      await supabase
        .from('profiles')
        .update({
          shipping_address: {
            firstName: shipping.firstName,
            lastName: shipping.lastName,
            phone: shipping.phone,
            address: shipping.address,
            city: shipping.city,
            state: shipping.state,
            zip: shipping.zip,
            country: shipping.country,
          }
        })
        .eq('id', user.id);
    }
  };

  // ✅ Single handleNext with clearCart
  const handleNext = async () => {
    if (step === 0) { setStep(1); return; }
    if (step === 1) { if (!validateShipping()) return; setStep(2); return; }
    if (step === 2) {
      if (!validatePayment()) return;
      setLoading(true);
      await saveOrder();
      clearCart(); // ✅ clears cart after order
      setLoading(false);
      setStep(3);
    }
  };

  const handleBack = () => setStep(s => s - 1);

  const OrderSummary = () => (
    <div className="checkout-summary">
      <h3 className="checkout-summary-title">Order Summary</h3>
      <div className="checkout-summary-items">
        {cart.map((item, i) => (
          <div key={i} className="checkout-summary-item">
            <div className="checkout-summary-img">
              <img src={item.img} alt={item.title} />
              <span className="checkout-item-qty">{item.qty}</span>
            </div>
            <div className="checkout-summary-info">
              <p>{item.title}</p>
              {item.selectedColor && <small>{item.selectedColor}</small>}
            </div>
            <span className="checkout-summary-price">
              ${(parseFloat(item.price.replace('$', '')) * item.qty).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {step < 3 && (
        <div className="checkout-coupon">
          {coupon ? (
            <div className="coupon-applied">
              <span>🎉 <strong>{coupon}</strong> — {discount}% off</span>
              <button onClick={removeCoupon}>✕</button>
            </div>
          ) : (
            <div className="coupon-input-row">
              <input
                type="text"
                placeholder="Coupon code"
                value={couponInput}
                onChange={e => setCouponInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applyCoupon()}
              />
              <button onClick={applyCoupon}>Apply</button>
            </div>
          )}
          {couponError && <p className="coupon-error">{couponError}</p>}
          <p className="coupon-hint">Try: TECH10, SAVE20, FIRST15</p>
        </div>
      )}

      <div className="checkout-totals">
        <div className="checkout-total-row">
          <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="checkout-total-row discount">
            <span>Discount ({discount}%)</span>
            <span>-${discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="checkout-total-row">
          <span>Shipping</span>
          <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
        </div>
        <div className="checkout-total-row total">
          <span>Total</span><span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="checkout-page">
      <div className="checkout-container">

        <div className="checkout-header">
          <div className="checkout-logo" onClick={() => navigate('/')}>TechStore</div>
          {step < 3 && (
            <div className="checkout-steps">
              {STEPS.slice(0, 3).map((s, i) => (
                <React.Fragment key={i}>
                  <div className={`checkout-step ${i <= step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
                    <div className="checkout-step-circle">
                      {i < step ? '✓' : i + 1}
                    </div>
                    <span>{s}</span>
                  </div>
                  {i < 2 && <div className={`checkout-step-line ${i < step ? 'done' : ''}`} />}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {step < 3 ? (
          <div className="checkout-body">
            <div className="checkout-main">

              {/* STEP 0: CART */}
              {step === 0 && (
                <div className="checkout-section">
                  <h2>Your Cart</h2>
                  {cart.length === 0 ? (
                    <div className="checkout-empty">
                      <span>🛒</span>
                      <p>Your cart is empty</p>
                      <button className="btn-primary" onClick={() => navigate('/')}>Shop Now</button>
                    </div>
                  ) : (
                    <div className="checkout-cart-list">
                      {cart.map((item, i) => (
                        <div key={i} className="checkout-cart-item">
                          <div className="checkout-cart-img">
                            <img src={item.img} alt={item.title} />
                          </div>
                          <div className="checkout-cart-info">
                            <h4>{item.title}</h4>
                            {item.selectedColor && <p className="cart-item-color">{item.selectedColor}</p>}
                            <div className="checkout-qty-row">
                              <button onClick={() => updateQty(item.title, item.qty - 1)}>−</button>
                              <span>{item.qty}</span>
                              <button onClick={() => updateQty(item.title, item.qty + 1)}>+</button>
                            </div>
                          </div>
                          <div className="checkout-cart-right">
                            <span className="checkout-cart-price">
                              ${(parseFloat(item.price.replace('$', '')) * item.qty).toFixed(2)}
                            </span>
                            <button className="checkout-remove-btn" onClick={() => removeFromCart(item.title)}>Remove</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 1: SHIPPING */}
              {step === 1 && (
                <div className="checkout-section">
                  <h2>Shipping Information</h2>
                  <div className="checkout-form-grid">
                    {[
                      { key: 'firstName', label: 'First Name', placeholder: 'John', half: true },
                      { key: 'lastName', label: 'Last Name', placeholder: 'Doe', half: true },
                      { key: 'email', label: 'Email', placeholder: 'you@example.com', type: 'email', half: true },
                      { key: 'phone', label: 'Phone', placeholder: '+92 300 0000000', half: true },
                      { key: 'address', label: 'Address', placeholder: '123 Main Street' },
                      { key: 'city', label: 'City', placeholder: 'Karachi', half: true },
                      { key: 'state', label: 'State / Province', placeholder: 'Sindh', half: true },
                      { key: 'zip', label: 'ZIP / Postal Code', placeholder: '75000', half: true },
                    ].map(field => (
                      <div key={field.key} className={`checkout-field ${field.half ? 'half' : ''}`}>
                        <label>{field.label}</label>
                        <input
                          type={field.type || 'text'}
                          placeholder={field.placeholder}
                          value={shipping[field.key]}
                          onChange={e => setShipping(p => ({ ...p, [field.key]: e.target.value }))}
                          className={errors[field.key] ? 'error' : ''}
                        />
                        {errors[field.key] && <span className="field-error">{errors[field.key]}</span>}
                      </div>
                    ))}
                  </div>

                  <h3 className="shipping-method-title">Shipping Method</h3>
                  <div className="shipping-methods">
                    <label className={`shipping-method ${shippingMethod === 'standard' ? 'active' : ''}`}>
                      <input type="radio" value="standard" checked={shippingMethod === 'standard'} onChange={() => setShippingMethod('standard')} />
                      <div><strong>Standard Delivery</strong><small>5–7 business days</small></div>
                      <span>{subtotal > 50 ? 'Free' : '$5.00'}</span>
                    </label>
                    <label className={`shipping-method ${shippingMethod === 'express' ? 'active' : ''}`}>
                      <input type="radio" value="express" checked={shippingMethod === 'express'} onChange={() => setShippingMethod('express')} />
                      <div><strong>Express Delivery</strong><small>1–2 business days</small></div>
                      <span>{subtotal > 50 ? 'Free' : '$15.00'}</span>
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 2: PAYMENT */}
              {step === 2 && (
                <div className="checkout-section">
                  <h2>Payment Details</h2>
                  <div className="card-preview">
                    <div className="card-preview-top">
                      <span className="card-chip">▬▬</span>
                      <span className="card-type">VISA</span>
                    </div>
                    <div className="card-number-preview">
                      {(payment.cardNumber || '•••• •••• •••• ••••').padEnd(19, '•')}
                    </div>
                    <div className="card-preview-bottom">
                      <div>
                        <small>Card Holder</small>
                        <p>{payment.cardName || 'FULL NAME'}</p>
                      </div>
                      <div>
                        <small>Expires</small>
                        <p>{payment.expiry || 'MM/YY'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="checkout-form-grid">
                    <div className="checkout-field">
                      <label>Name on Card</label>
                      <input
                        type="text"
                        placeholder="Aamna Tariq"
                        value={payment.cardName}
                        onChange={e => setPayment(p => ({ ...p, cardName: e.target.value.toUpperCase() }))}
                        className={errors.cardName ? 'error' : ''}
                      />
                      {errors.cardName && <span className="field-error">{errors.cardName}</span>}
                    </div>
                    <div className="checkout-field">
                      <label>Card Number</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={payment.cardNumber}
                        onChange={e => setPayment(p => ({ ...p, cardNumber: formatCard(e.target.value) }))}
                        className={errors.cardNumber ? 'error' : ''}
                      />
                      {errors.cardNumber && <span className="field-error">{errors.cardNumber}</span>}
                    </div>
                    <div className="checkout-field half">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={payment.expiry}
                        onChange={e => setPayment(p => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                        className={errors.expiry ? 'error' : ''}
                      />
                      {errors.expiry && <span className="field-error">{errors.expiry}</span>}
                    </div>
                    <div className="checkout-field half">
                      <label>CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={4}
                        value={payment.cvv}
                        onChange={e => setPayment(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '') }))}
                        className={errors.cvv ? 'error' : ''}
                      />
                      {errors.cvv && <span className="field-error">{errors.cvv}</span>}
                    </div>
                  </div>
                  <div className="secure-badge">🔒 Your payment is secured with 256-bit SSL encryption</div>
                </div>
              )}

              <div className="checkout-nav">
                {step > 0 && (
                  <button className="checkout-back-btn" onClick={handleBack}>← Back</button>
                )}
                {cart.length > 0 && (
                  <button className="checkout-next-btn" onClick={handleNext} disabled={loading}>
                    {loading ? <span className="auth-spinner" /> :
                      step === 2 ? `Pay $${total.toFixed(2)}` :
                      step === 1 ? 'Continue to Payment →' :
                      'Continue to Shipping →'}
                  </button>
                )}
              </div>
            </div>

            <OrderSummary />
          </div>
        ) : (

          /* STEP 3: CONFIRMATION */
          <div className="checkout-confirmation">
            <div className="confirmation-icon">✓</div>
            <h1>Order Confirmed!</h1>
            <p className="confirmation-order-num">Order {orderNumber}</p>
            <p className="confirmation-msg">
              Thank you for your purchase! We've sent a confirmation to{' '}
              <strong>{shipping.email || 'your email'}</strong>.
              Your order will arrive in {shippingMethod === 'express' ? '1–2' : '5–7'} business days.
            </p>

            <div className="confirmation-summary">
              {cart.map((item, i) => (
                <div key={i} className="confirmation-item">
                  <img src={item.img} alt={item.title} />
                  <div>
                    <p>{item.title}</p>
                    <small>Qty: {item.qty}</small>
                  </div>
                  <span>${(parseFloat(item.price.replace('$', '')) * item.qty).toFixed(2)}</span>
                </div>
              ))}
              <div className="confirmation-total">
                <span>Total paid</span>
                <strong>${total.toFixed(2)}</strong>
              </div>
            </div>

            <div className="confirmation-actions">
              <button className="btn-primary" onClick={() => navigate('/')}>Continue Shopping</button>
              <button className="checkout-back-btn" onClick={() => navigate('/contact')}>Need Help?</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CheckoutPage;