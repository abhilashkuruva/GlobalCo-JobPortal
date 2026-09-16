import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api'; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [loading, setLoading] = useState(false);

  // Initialize user state from local storage on mount
  useEffect(() => {
    if (token) {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== 'undefined') {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error("Failed to parse stored user", err);
        logout();
      }
    }
  }, []);

  const login = async (usernameOrEmail, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { 
        username: usernameOrEmail, 
        email: usernameOrEmail, 
        password 
      });
      const data = res.data;
      
      // Standardize role prefix removal
      const rawRole = data.role || (data.user && data.user.role) || "";
      const normalizedRole = rawRole.replace("ROLE_", "");
      
      const userData = data.user || {
        username: data.username || usernameOrEmail,
        email: data.email,
        fullName: data.fullName || data.username || usernameOrEmail,
        role: normalizedRole
      };

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('role', normalizedRole);
      
      setToken(data.token);
      setUser(userData);
      setRole(normalizedRole);
      
      return { ...data, role: normalizedRole, user: userData };
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', payload);
      const data = res.data;
      if (data.token) {
        const rawRole = data.role || (data.user && data.user.role) || payload.role || "";
        const normalizedRole = rawRole.replace("ROLE_", "");
        const userData = data.user || {
          username: data.username || payload.username,
          email: data.email || payload.email,
          fullName: payload.fullName,
          role: normalizedRole
        };
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('role', normalizedRole);
        setToken(data.token);
        setUser(userData);
        setRole(normalizedRole);
      }
      return data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerCandidate = async (formData) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/candidate/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const data = res.data;
      if (data.token) {
        const rawRole = data.role || (data.user && data.user.role) || "ROLE_CANDIDATE";
        const normalizedRole = rawRole.replace("ROLE_", "");
        const userData = data.user || {
          username: data.username,
          email: data.email,
          fullName: data.fullName,
          role: normalizedRole
        };
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('role', normalizedRole);
        setToken(data.token);
        setUser(userData);
        setRole(normalizedRole);
      }
      return data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerRecruiter = async (formData) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/recruiter/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (fields) => {
    setUser(prev => {
      const updated = { ...prev, ...fields };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, role, loading, login, register, registerCandidate, registerRecruiter, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};