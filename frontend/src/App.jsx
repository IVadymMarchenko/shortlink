import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import api from './api'; 

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null); 
  const [lang, setLang] = useState('ru');
  const [loading, setLoading] = useState(true); 

  const navigate = useNavigate(); // Хук для безопасной смены URL

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  // === ФУНКЦИЯ ЗАГРУЗКИ ПРОФИЛЯ ===
  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/dashboard/info/'); 
      setUser(response.data); 
      setIsAuthenticated(true);
      
      // Если пользователь обновил страницу, будучи на главной '/', перекидываем в дашборд
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

  // Функция вызывается ПОСЛЕ успешного ввода пароля в Login.jsx
  const handleLoginSuccess = async () => {
    await fetchUserProfile(); // Загружаем данные юзера
    navigate('/dashboard');   // Перенаправляем на урл /dashboard
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
      navigate('/', { replace: true }); // Возвращаем на логин
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
          {/* ГЛАВНАЯ СТРАНИЦА (ФОРМА ВХОДА) */}
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

          {/* ЗАЩИЩЕННАЯ СТРАНИЦА ДАШБОРДА */}
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? (
                <Dashboard lang={lang} user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />

          {/* НА СЛУЧАЙ ЛЕВЫХ УРЛОВ (404) — КИДАЕМ НА ГЛАВНУЮ */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer lang={lang} />
    </div>
  );
}