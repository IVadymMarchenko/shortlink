import React, { useState, useEffect } from 'react';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lang, setLang] = useState('ru');

  // 1. При старте проверяем, есть ли сохранённая тема в localStorage. 
  // Если нет — ставим по дефолту 'light'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'light';
  });

  // 2. Синхронизируем тему с тегом <html> и сохраняем её в localStorage при каждом изменении
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleLang = () => {
    setLang(prev => prev === 'ru' ? 'en' : 'ru');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header 
        theme={theme} 
        toggleTheme={toggleTheme} 
        lang={lang} 
        toggleLang={toggleLang}
        onLogout={() => setIsAuthenticated(false)}
      />
      <main style={{ flex: 1 }}>
        {isAuthenticated ? (
          <Dashboard lang={lang} />
        ) : (
          <Login onLogin={() => setIsAuthenticated(true)} lang={lang} />
        )}
      </main>
      <Footer lang={lang} />
    </div>
  );
}