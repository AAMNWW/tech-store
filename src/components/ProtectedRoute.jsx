import React from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, role, authLoading } = useStore();

  if (authLoading) return (
    <div style={{ padding: '4rem', textAlign: 'center' }}>
      <p>Loading...</p>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && role !== 'admin') return <Navigate to="/" replace />;

  return children;
}

export default ProtectedRoute;