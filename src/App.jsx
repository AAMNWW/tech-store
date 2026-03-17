import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import Header from './components/Header';
import PromoBanner from './components/PromoBanner';
import Cart from './components/Cart';
import Footer from './components/Footer';
import Toast from './components/Toast';
import BackToTop from './components/BackToTop';
import Loader from './components/Loader';
import Home from './pages/Home';
import ProductPage from './pages/ProductPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/ProtectedRoute';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import './styles/index.css';


function StoreContent() {
  const { toast, hideToast } = useStore();
  const [loaded, setLoaded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleHomeClick = () => setSelectedCategory('All');
  const handleCategorySelect = (cat) => setSelectedCategory(cat);

  if (!loaded) return <Loader />;

  return (
    <div>
      <PromoBanner />
      <Header
        onHomeClick={handleHomeClick}
        onCategorySelect={handleCategorySelect}
      />
      <Routes>
  <Route path="/"
    element={<><Home selectedCategory={selectedCategory} /><Footer onCategorySelect={handleCategorySelect} /></>}
  />
  <Route path="/products"
    element={<><Home selectedCategory={selectedCategory} scrollToProducts={true} /><Footer onCategorySelect={handleCategorySelect} /></>}
  />
  <Route path="/product/:id" element={<ProductPage />} />
  <Route path="/about"       element={<><AboutPage /><Footer onCategorySelect={handleCategorySelect} /></>} />
  <Route path="/contact"     element={<><ContactPage /><Footer onCategorySelect={handleCategorySelect} /></>} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/signup" element={<SignupPage />} />
  <Route path="/checkout" element={<CheckoutPage />} />
  <Route path="/orders" element={<OrdersPage />} />
  <Route path="/profile" element={<ProfilePage />} />
  <Route path="/admin" element={
  <ProtectedRoute adminOnly={true}>
    <AdminPage />
  </ProtectedRoute>
} />
</Routes>
      <Cart />
      <BackToTop />
      {toast && <Toast message={toast} onClose={hideToast} />}
    </div>
  );
}
function App() {
  return (
    <StoreProvider>
      <StoreContent />
    </StoreProvider>
  );
}

export default App;