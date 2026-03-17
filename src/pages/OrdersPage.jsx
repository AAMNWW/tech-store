import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useStore } from '../context/StoreContext';

function OrdersPage() {
  const { user } = useStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) setOrders(data || []);
    setLoading(false);
  };

  const statusColors = {
    pending: '#f0a500',
    processing: '#0071e3',
    shipped: '#8b5cf6',
    delivered: '#27ae60',
    cancelled: '#e74c3c',
  };

  return (
    <div className="orders-page">
      <div className="container">

        <div className="orders-header">
          <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
          <div>
            <h1>My Orders</h1>
            <p className="orders-subtitle">{user?.email}</p>
          </div>
        </div>

        {loading ? (
          <div className="orders-loading">Loading your orders...</div>
        ) : orders.length === 0 ? (
          <div className="orders-empty">
            <span>🛒</span>
            <h2>No orders yet</h2>
            <p>Looks like you haven't placed any orders yet.</p>
            <button className="btn-primary" onClick={() => navigate('/')}>Start Shopping</button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-card">

                {/* Order Header */}
                <div className="order-card-header">
                  <div className="order-card-meta">
                    <span className="order-num">Order #{order.id}</span>
                    <span className="order-date">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="order-card-right">
                    <span
                      className="order-status-badge"
                      style={{ background: statusColors[order.status] || '#86868b' }}
                    >
                      {order.status}
                    </span>
                    <span className="order-total">${order.total}</span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="order-items">
                  {(order.items || []).map((item, i) => (
                    <div key={i} className="order-item">
                      <img src={item.img} alt={item.title} className="order-item-img" />
                      <div className="order-item-info">
                        <p className="order-item-title">{item.title}</p>
                        {item.selectedColor && (
                          <small className="order-item-color">Color: {item.selectedColor}</small>
                        )}
                        <small className="order-item-qty">Qty: {item.qty}</small>
                      </div>
                      <span className="order-item-price">
                        ${(parseFloat(item.price.replace('$', '')) * item.qty).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Shipping Address */}
                {order.shipping_address && (
                  <div className="order-shipping">
                    <p className="order-shipping-label">Shipped to</p>
                    <p>{order.shipping_address.name}</p>
                    <p>{order.shipping_address.address}, {order.shipping_address.city}</p>
                    <p>{order.shipping_address.country}</p>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdersPage;