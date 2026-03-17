import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDark = () => setDarkMode(prev => !prev);

  const fetchRole = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    if (!error && data) setRole(data.role);
    else setRole('user');
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchRole(session.user.id);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchRole(session.user.id);
      else setRole(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  };

  const fetchProducts = async () => {
  setProductsLoading(true);
  const { data, error } = await supabase.from('products').select('*');
  if (error) {
    console.error('Error fetching products:', error);
  } else {
    const normalized = data.map(p => ({
      ...p,
      originalPrice: p.original_price,
      colors: typeof p.colors === 'string' ? JSON.parse(p.colors) : p.colors,
      reviews: typeof p.reviews === 'string' ? JSON.parse(p.reviews) : (p.reviews || []),
    }));
    setProducts(normalized);
  }
  setProductsLoading(false);
};

useEffect(() => {
  fetchProducts();
}, []);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(i => i.title === product.title && i.selectedColor === product.selectedColor);
      if (exists) {
        return prev.map(i =>
          i.title === product.title && i.selectedColor === product.selectedColor
            ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  // ✅ back in the right place
  const removeFromCart = (title) => setCart(prev => prev.filter(i => i.title !== title));

  const clearCart = () => setCart([]);

  const updateQty = (title, qty) => {
    if (qty < 1) { removeFromCart(title); return; }
    setCart(prev => prev.map(i => i.title === title ? { ...i, qty } : i));
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const hideToast = () => setToast(null);

  return (
    <StoreContext.Provider value={{
      products, productsLoading,
      cart, cartOpen, setCartOpen, cartCount,
      addToCart, removeFromCart, updateQty, clearCart,
      toast, showToast, hideToast,
      darkMode, toggleDark,
      searchQuery, setSearchQuery,
      user, role, authLoading, logout, fetchProducts,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}