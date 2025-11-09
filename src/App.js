import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import Auth from './components/Auth';
import Dashboard from './components/dashboard';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <Routes>
      {/* Login / Signup */}
      <Route
        path="/login"
        element={!session ? <Auth /> : <Navigate to="/dashboard" replace />}
      />

      {/* Dashboard */}
      <Route
        path="/dashboard/*"
        element={session ? <Dashboard session={session} /> : <Navigate to="/login" replace />}
      />

      {/* Default route */}
      <Route
        path="/"
        element={session ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
      />

      {/* 404 fallback */}
      <Route
        path="*"
        element={<div className="text-center mt-20 text-red-500 text-xl">Page Not Found</div>}
      />
    </Routes>
  );
}

export default App;
