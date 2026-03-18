import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const isFirstLoad = useRef(true);

  // ✅ Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Dark mode
  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDark = () => setDarkMode(prev => !prev);

  // ✅ Save cart to Supabase for logged in users
  const saveCartToSupabase = async (cartData, userId) => {
    if (!userId) return;
    await supabase
      .from('profiles')
      .update({ cart: cartData })
      .eq('id', userId);
  };

  // ✅ Save cart to Supabase whenever cart changes (for logged in users)
  useEffect(() => {
    if (isFirstLoad.current) return;
    if (user) {
      saveCartToSupabase(cart, user.id);
    }
  }, [cart, user]);

  const fetchRole = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    if (!error && data) setRole(data.role);
    else setRole('user');
  };

  // ✅ Load and merge cart on login
  const loadAndMergeCart = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('cart')
      .eq('id', userId)
      .single();

    const savedCart = data?.cart || [];
    const guestCart = JSON.parse(localStorage.getItem('cart') || '[]');

    if (savedCart.length === 0 && guestCart.length === 0) return;

    // Merge guest cart + saved cart
    const merged = [...savedCart];
    guestCart.forEach(guestItem => {
      const exists = merged.find(
        i => i.title === guestItem.title && i.selectedColor === guestItem.selectedColor
      );
      if (exists) {
        // Add guest qty to saved qty
        exists.qty += guestItem.qty;
      } else {
        // Add new guest item
        merged.push(guestItem);
      }
    });

    setCart(merged);
    isFirstLoad.current = false;
  };

  // Auth state listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user.id);
        loadAndMergeCart(session.user.id);
      } else {
        isFirstLoad.current = false;
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user.id);
        loadAndMergeCart(session.user.id);
      } else {
        setRole(null);
        setCart([]); // ✅ clear cart on logout
        localStorage.removeItem('cart');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setCart([]); // ✅ clear cart on logout
    localStorage.removeItem('cart');
  };

  // Fetch products
  const fetchProducts = async () => {
    setProductsLoading(true);
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.error('Error fetching products:', error);
    } else {
     const normalized = data.map(p => ({
  ...p,
  originalPrice: p.original_price,
  img: p.img || (Array.isArray(p.images) ? p.images[0] : ''),  // ✅ fallback
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
      products, productsLoading, fetchProducts,
      cart, cartOpen, setCartOpen, cartCount,
      addToCart, removeFromCart, updateQty, clearCart,
      toast, showToast, hideToast,
      darkMode, toggleDark,
      searchQuery, setSearchQuery,
      user, role, authLoading, logout,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}