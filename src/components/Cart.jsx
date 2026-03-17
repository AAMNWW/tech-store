import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

function Cart() {
  const { cart, cartOpen, setCartOpen, removeFromCart, updateQty, cartCount } = useStore();
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => {
    const num = parseFloat(item.price.replace('$', ''));
    return sum + num * item.qty;
  }, 0);

  const handleCheckout = () => {
    setCartOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      {cartOpen && <div className="cart-backdrop" onClick={() => setCartOpen(false)} />}
      <div className={`cart-sidebar ${cartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>Your Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}</h2>
          <button className="icon-btn" onClick={() => setCartOpen(false)}>✕</button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <span>🛒</span>
            <p>Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map(item => (
                <div className="cart-item" key={item.title}>
                  <img src={item.img} alt={item.title} />
                  <div className="cart-item-info">
                    <h4>{item.title}</h4>
                    <p className="cart-item-price">{item.price}</p>
                    <div className="qty-selector">
                      <button onClick={() => updateQty(item.title, -1)}>−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.title, +1)}>+</button>
                    </div>
                  </div>
                  <button className="remove-btn" onClick={() => removeFromCart(item.title)}>✕</button>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <button
                className="btn-primary"
                style={{ width: '100%' }}
                onClick={handleCheckout}
              >
                Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Cart;