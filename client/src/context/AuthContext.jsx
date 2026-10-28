import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hms_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('hms_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get('/auth/me')
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem('hms_user', JSON.stringify(res.data.user));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('hms_token', res.data.token);
      localStorage.setItem('hms_user', JSON.stringify(res.data.user));
      return res.data;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('hms_token', res.data.token);
      localStorage.setItem('hms_user', JSON.stringify(res.data.user));
      return res.data;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('hms_token');
    localStorage.removeItem('hms_user');
  };

  const switchDemoRole = async (email, password) => {
    return login(email, password);
  };

  const role = user?.role || 'guest';
  const roleHelpers = {
    isAdmin: role === 'admin',
    isDoctor: role === 'doctor',
    isReceptionist: role === 'receptionist',
    isPharmacist: role === 'pharmacist',
    isLabTech: role === 'lab_technician',
    isAccountant: role === 'accountant',
    isPatient: role === 'patient',
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        role,
        ...roleHelpers,
        login,
        register,
        logout,
        switchDemoRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

