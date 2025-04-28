// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoginForm from './Login/LoginForm';
import Dashboard from './User/Dashboard';
import Usuarios from './User/Users';
import Currency from './Currency/Currency';
import Country from './Country/Country';
import Layout from './Components/Layout';
import ProtectedRoute from './Auth/ProtectedRoute';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        {/* Ruta pública de login */}
        <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />

        {/* Ruta protegida con layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} /> {/* Ruta "/" */}
          <Route path="usuarios" element={<Usuarios />} /> {/* Ruta "/usuarios" */}
          <Route path="currency" element={<Currency />} /> {/* Ruta "/currency" */}
          <Route path="country" element={<Country />} /> {/* Ruta "/country" */}
        </Route>

        {/* Fallback a login o dashboard */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
