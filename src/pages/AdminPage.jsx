import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useStore } from '../context/StoreContext';

function AdminPage() {
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState('products');

  // Products state
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadingIdx, setUploadingIdx] = useState(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const csvRef = useRef();

  const emptyForm = {
    title: '', price: '', original_price: '', category: '',
    img: '', images: ['', '', '', '', ''],
    description: '', sale: false, rating: 0,
    features: ['', '', '', ''],
    colors: [{ name: '', hex: '' }],
  };
  const [productForm, setProductForm] = useState(emptyForm);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => { fetchProducts(); fetchOrders(); }, []);

  const fetchProducts = async () => {
    setProductsLoading(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(data || []);
    setProductsLoading(false);
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setOrders(data || []);
    setOrdersLoading(false);
  };

  const resetForm = () => {
    setProductForm(emptyForm);
    setEditingProduct(null);
    setShowAddForm(false);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setProductForm({
      title: product.title || '',
      price: product.price || '',
      original_price: product.original_price || '',
      category: product.category || '',
      img: product.img || '',
      images: product.images
        ? [...product.images, '', '', '', '', ''].slice(0, 5)
        : ['', '', '', '', ''],
      description: product.description || '',
      sale: product.sale || false,
      rating: product.rating || 0,
      features: product.features
        ? [...product.features, '', '', ''].slice(0, 4)
        : ['', '', '', ''],
      colors: product.colors?.length
        ? product.colors
        : [{ name: '', hex: '' }],
    });
    setShowAddForm(true);
    setTimeout(() => document.querySelector('.admin-form-card')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  // ── IMAGE UPLOAD to Supabase Storage ──
  const handleImageUpload = async (file, index) => {
    if (!file) return;
    setUploadingIdx(index);
    const ext = file.name.split('.').pop();
    const fileName = `product-${Date.now()}-${Math.random().toString(36).slice(2)}-${index}.${ext}`;
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, { upsert: true });

    if (error) {
      alert('Upload failed: ' + error.message);
      setUploadingIdx(null);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    if (index === 'main') {
      setProductForm(p => ({ ...p, img: publicUrl }));
    } else {
      const newImages = [...productForm.images];
      newImages[index] = publicUrl;
      setProductForm(p => ({ ...p, images: newImages }));
    }
    setUploadingIdx(null);
  };

  // ── SAVE PRODUCT ──
  const handleSaveProduct = async () => {
    if (!productForm.title.trim() || !productForm.price.trim()) {
      alert('Title and price are required.');
      return;
    }

    const cleanedImages = productForm.images.filter(u => u.trim() !== '');
    const cleanedFeatures = productForm.features.filter(f => f.trim() !== '');
    const cleanedColors = productForm.colors.filter(c => c.name.trim() !== '');

    const payload = {
      title: productForm.title.trim(),
      price: productForm.price.trim(),
      original_price: productForm.original_price.trim() || null,
      category: productForm.category,
      img: cleanedImages[0] || productForm.img.trim() || '',
      images: cleanedImages.length > 0 ? cleanedImages : null,
      description: productForm.description.trim(),
      sale: productForm.sale,
      rating: parseFloat(productForm.rating) || 0,
      features: cleanedFeatures.length > 0 ? cleanedFeatures : null,
      colors: cleanedColors.length > 0 ? cleanedColors : null,
    };

    if (editingProduct) {
      await supabase.from('products').update(payload).eq('id', editingProduct.id);
    } else {
      await supabase.from('products').insert([payload]);
    }
    resetForm();
    fetchProducts();
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await supabase.from('products').delete().eq('id', id);
    fetchProducts();
  };

  // ── CSV BULK IMPORT ──
  const handleCSVImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCsvLoading(true);

    const text = await file.text();
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

    const rows = lines.slice(1).map(line => {
      // Handle quoted commas
      const cols = [];
      let current = '';
      let inQuotes = false;
      for (let ch of line) {
        if (ch === '"') { inQuotes = !inQuotes; }
        else if (ch === ',' && !inQuotes) { cols.push(current.trim()); current = ''; }
        else { current += ch; }
      }
      cols.push(current.trim());

      const row = {};
      headers.forEach((h, i) => { row[h] = cols[i] || ''; });
      return row;
    });

    const products = rows.map(row => ({
      title: row.title || '',
      price: row.price || '$0',
      original_price: row.original_price || null,
      category: row.category || '',
      img: row.img || '',
      images: row.images ? row.images.split('|').map(u => u.trim()) : null,
      description: row.description || '',
      sale: row.sale === 'true' || row.sale === '1',
      rating: parseFloat(row.rating) || 0,
      features: row.features ? row.features.split('|').map(f => f.trim()) : null,
      colors: row.colors ? row.colors.split('|').map(c => {
        const [name, hex] = c.split(':');
        return { name: name?.trim(), hex: hex?.trim() };
      }) : null,
    })).filter(p => p.title);

    const { error } = await supabase.from('products').insert(products);
    if (error) alert('Import failed: ' + error.message);
    else alert(`✅ ${products.length} products imported!`);

    setCsvLoading(false);
    e.target.value = '';
    fetchProducts();
  };

  // ── Download CSV template ──
  const downloadTemplate = () => {
    const header = 'title,price,original_price,category,img,images,description,sale,rating,features,colors';
    const example = '"Sony WH-1000XM5","$349.99","$399.99","Audio","https://example.com/main.jpg","https://example.com/1.jpg|https://example.com/2.jpg","Industry leading noise cancellation",false,4.8,"40hr battery|Multipoint connect|Foldable design","Black:#000000|Silver:#C0C0C0"';
    const blob = new Blob([header + '\n' + example], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'products-template.csv'; a.click();
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    await supabase.from('orders').update({ status }).eq('id', orderId);
    fetchOrders();
  };

  const statusColors = {
    pending: '#f0a500', processing: '#0071e3',
    shipped: '#8b5cf6', delivered: '#27ae60', cancelled: '#e74c3c',
  };

  // ── IMAGE FIELD component ──
  // ── IMAGE FIELD component ──
  const ImageField = ({ label, value, onChange, onUpload, uploading }) => (
    <div className="admin-image-field">
      <label>{label}</label>
      <div className="admin-image-input-row">
        <input
          type="text"
          placeholder="Paste image URL..."
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        <label className="admin-upload-btn" title="Upload from device">
          {uploading ? '⏳' : '📁'}
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={e => onUpload(e.target.files[0])}
          />
        </label>
      </div>
      {value && (
        <img src={value} alt="preview" className="admin-image-preview" />
      )}
    </div>
  );

  return (
    <div className="admin-page">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo" onClick={() => navigate('/')}>TechStore</div>
        <p className="admin-email">{user?.email}</p>
        <nav className="admin-nav">
          <button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>📦 Products</button>
          <button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>🧾 Orders</button>
        </nav>
        <button className="admin-logout" onClick={() => { logout(); navigate('/'); }}>Sign Out</button>
      </aside>

      <main className="admin-main">

        {/* ── PRODUCTS TAB ── */}
        {tab === 'products' && (
          <div>
            <div className="admin-toolbar">
              <h1>Products <span>({products.length})</span></h1>
              <div className="admin-toolbar-actions">
                <button className="admin-csv-btn" onClick={downloadTemplate}>⬇ CSV Template</button>
                <label className="admin-csv-btn admin-import-btn">
                  {csvLoading ? 'Importing...' : '⬆ Import CSV'}
                  <input ref={csvRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleCSVImport} />
                </label>
                <button className="admin-add-btn" onClick={() => { resetForm(); setShowAddForm(true); }}>+ Add Product</button>
              </div>
            </div>

            {/* ── ADD / EDIT FORM ── */}
            {showAddForm && (
              <div className="admin-form-card">
                <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>

                {/* Basic Info */}
                <div className="admin-form-section-title">Basic Info</div>
                <div className="admin-form-grid">
                  <div className="admin-field">
                    <label>Title *</label>
                    <input value={productForm.title} onChange={e => setProductForm(p => ({ ...p, title: e.target.value }))} placeholder="Product title" />
                  </div>
                  <div className="admin-field">
                    <label>Category</label>
                    <select value={productForm.category} onChange={e => setProductForm(p => ({ ...p, category: e.target.value }))}>
                      <option value="">Select category</option>
                      <option value="Audio">Audio</option>
                      <option value="Wearables">Wearables</option>
                      <option value="Gaming">Gaming</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                  <div className="admin-field">
                    <label>Price *</label>
                    <input value={productForm.price} onChange={e => setProductForm(p => ({ ...p, price: e.target.value }))} placeholder="$99.99" />
                  </div>
                  <div className="admin-field">
                    <label>Original Price (before sale)</label>
                    <input value={productForm.original_price} onChange={e => setProductForm(p => ({ ...p, original_price: e.target.value }))} placeholder="$129.99" />
                  </div>
                  <div className="admin-field">
                    <label>Rating (0–5)</label>
                    <input type="number" min="0" max="5" step="0.1" value={productForm.rating} onChange={e => setProductForm(p => ({ ...p, rating: e.target.value }))} />
                  </div>
                  <div className="admin-field" style={{ justifyContent: 'flex-end' }}>
                    <label className="admin-checkbox">
                      <input type="checkbox" checked={productForm.sale} onChange={e => setProductForm(p => ({ ...p, sale: e.target.checked }))} />
                      <span>Mark as On Sale</span>
                    </label>
                  </div>
                  <div className="admin-field full-width">
                    <label>Description</label>
                    <textarea value={productForm.description} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))} placeholder="Product description..." rows={3} />
                  </div>
                </div>

                {/* Images */}
                <div className="admin-form-section-title" style={{ marginTop: '1.5rem' }}>
                  Images
                  <span className="admin-section-hint">First image = main card image. Add up to 5 for the gallery slideshow.</span>
                </div>
                <div className="admin-images-grid">
                  {productForm.images.map((url, i) => (
                    <ImageField
                      key={i}
                      label={i === 0 ? `Image 1 (Main)` : `Image ${i + 1}`}
                      value={url}
                      onChange={val => {
                        const imgs = [...productForm.images];
                        imgs[i] = val;
                        // Auto-set main img from first image
                        if (i === 0) setProductForm(p => ({ ...p, images: imgs, img: val }));
                        else setProductForm(p => ({ ...p, images: imgs }));
                      }}
                      onUpload={file => handleImageUpload(file, i)}
                      uploading={uploadingIdx === i}
                    />
                  ))}
                </div>

                {/* Features */}
                <div className="admin-form-section-title" style={{ marginTop: '1.5rem' }}>
                  Key Features
                  <span className="admin-section-hint">Shown as bullet points on the product page.</span>
                </div>
                <div className="admin-features-list">
                  {productForm.features.map((f, i) => (
                    <div key={i} className="admin-feature-row">
                      <span className="admin-feature-num">{i + 1}</span>
                      <input
                        value={f}
                        onChange={e => {
                          const feats = [...productForm.features];
                          feats[i] = e.target.value;
                          setProductForm(p => ({ ...p, features: feats }));
                        }}
                        placeholder={`Feature ${i + 1} e.g. "40hr battery life"`}
                      />
                    </div>
                  ))}
                  <button className="admin-add-feature-btn" onClick={() => setProductForm(p => ({ ...p, features: [...p.features, ''] }))}>
                    + Add Feature
                  </button>
                </div>

                {/* Colors */}
                <div className="admin-form-section-title" style={{ marginTop: '1.5rem' }}>
                  Color Variants
                  <span className="admin-section-hint">Name + hex code. e.g. "Midnight Black" + #1a1a1a</span>
                </div>
                <div className="admin-colors-list">
                  {productForm.colors.map((c, i) => (
                    <div key={i} className="admin-color-row">
                      <div className="admin-color-preview" style={{ background: c.hex || '#ccc' }} />
                      <input
                        placeholder="Color name"
                        value={c.name}
                        onChange={e => {
                          const cols = [...productForm.colors];
                          cols[i] = { ...cols[i], name: e.target.value };
                          setProductForm(p => ({ ...p, colors: cols }));
                        }}
                      />
                      <input
                        placeholder="#hex"
                        value={c.hex}
                        maxLength={7}
                        onChange={e => {
                          const cols = [...productForm.colors];
                          cols[i] = { ...cols[i], hex: e.target.value };
                          setProductForm(p => ({ ...p, colors: cols }));
                        }}
                      />
                      <input
                        type="color"
                        value={c.hex || '#000000'}
                        onChange={e => {
                          const cols = [...productForm.colors];
                          cols[i] = { ...cols[i], hex: e.target.value };
                          setProductForm(p => ({ ...p, colors: cols }));
                        }}
                        className="admin-color-picker"
                        title="Pick color"
                      />
                      {productForm.colors.length > 1 && (
                        <button className="admin-remove-color" onClick={() => {
                          setProductForm(p => ({ ...p, colors: p.colors.filter((_, j) => j !== i) }));
                        }}>✕</button>
                      )}
                    </div>
                  ))}
                  <button className="admin-add-feature-btn" onClick={() => setProductForm(p => ({ ...p, colors: [...p.colors, { name: '', hex: '' }] }))}>
                    + Add Color
                  </button>
                </div>

                <div className="admin-form-actions">
                  <button className="admin-save-btn" onClick={handleSaveProduct}>
                    {editingProduct ? 'Save Changes' : 'Add Product'}
                  </button>
                  <button className="admin-cancel-btn" onClick={resetForm}>Cancel</button>
                </div>
              </div>
            )}

            {/* Products Table */}
            {productsLoading ? (
              <p style={{ padding: '2rem' }}>Loading products...</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Sale</th>
                      <th>Rating</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id}>
                        <td><img src={p.img} alt={p.title} className="admin-product-thumb" /></td>
                        <td className="admin-product-title">{p.title}</td>
                        <td><span className="admin-tag">{p.category}</span></td>
                        <td>{p.price}</td>
                        <td>{p.sale ? <span className="admin-sale-badge">SALE</span> : '—'}</td>
                        <td>⭐ {p.rating}</td>
                        <td>
                          <div className="admin-actions">
                            <button className="admin-edit-btn" onClick={() => handleEditClick(p)}>Edit</button>
                            <button className="admin-delete-btn" onClick={() => handleDeleteProduct(p.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {tab === 'orders' && (
          <div>
            <div className="admin-toolbar">
              <h1>Orders <span>({orders.length})</span></h1>
              <button className="admin-refresh-btn" onClick={fetchOrders}>↻ Refresh</button>
            </div>
            {ordersLoading ? (
              <p style={{ padding: '2rem' }}>Loading orders...</p>
            ) : orders.length === 0 ? (
              <div className="admin-empty"><span>🧾</span><p>No orders yet</p></div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id}>
                        <td><strong>#{o.id}</strong></td>
                        <td>{new Date(o.created_at).toLocaleDateString()}</td>
                        <td>
                          <div style={{ fontSize: '0.8rem' }}>
                            <div>{o.shipping_address?.name || '—'}</div>
                            <div style={{ color: 'var(--grey-400)' }}>{o.shipping_address?.email || ''}</div>
                          </div>
                        </td>
                        <td>
                          {(o.items || []).map((item, i) => (
                            <div key={i} className="admin-order-item">{item.title} × {item.qty}</div>
                          ))}
                        </td>
                        <td><strong>${o.total}</strong></td>
                        <td>
                          <span className="admin-status-badge" style={{ background: statusColors[o.status] || '#86868b' }}>
                            {o.status}
                          </span>
                        </td>
                        <td>
                          <select value={o.status} onChange={e => handleUpdateOrderStatus(o.id, e.target.value)} className="admin-status-select">
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminPage;