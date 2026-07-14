// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import api from './api';

// Компонент-обертка для защиты приватных роутов
// Если пользователь не авторизован, он автоматически перенаправляется на страницу логина "/"
function ProtectedRoute({ isAuthenticated, children }) {
  return isAuthenticated ? children : <Navigate to="/" replace />;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState('ru');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/dashboard/info/');
      setUser(response.data);
      setIsAuthenticated(true);

      // Если пользователь зашел на корень "/", но он авторизован — перекидываем в дашборд
      if (window.location.pathname === '/') {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleLoginSuccess = async () => {
    await fetchUserProfile();
    navigate('/dashboard');
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleLang = () => {
    setLang(prev => prev === 'ru' ? 'en' : 'ru');
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout/');
    } catch (e) {
      console.log('Ошибка при логауте на сервере');
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      navigate('/', { replace: true });
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h3>Загрузка...</h3>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        lang={lang}
        toggleLang={toggleLang}
        onLogout={handleLogout}
      />

      <main style={{ flex: 1 }}>
        <Routes>
          {/* ПУБЛИЧНЫЙ РОУТ (ЛОГИН) */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login onLoginSuccess={handleLoginSuccess} lang={lang} />
              )
            }
          />

          {/* ЗАЩИЩЕННЫЙ РОУТ: ОСНОВНОЙ ДАШБОРД */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Dashboard user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          {/* ЗАЩИЩЕННЫЙ РОУТ: СТРАНИЦА ТАРИФОВ */}
          <Route
            path="/billing"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Dashboard user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          {/* Пример на будущее: как легко добавить новый приватный роут */}
          {/* <Route
            path="/settings"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Settings user={user} />
              </ProtectedRoute>
            }
          /> 
          */}

          {/* СЛЕПАЯ ПЕРЕАДРЕСАЦИЯ ДЛЯ ВСЕХ НЕИЗВЕСТНЫХ ССЫЛОК */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}