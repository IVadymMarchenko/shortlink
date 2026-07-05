import React from 'react';
import { Sun, Moon, Globe, Link2 } from 'lucide-react';
import styles from './Header.module.css';
import { useLang } from '../../context/LanguageContext'; // 1. Импортируем наш контекст

export default function Header({ theme, toggleTheme, onLogout }) {
  // 2. Достаем текущий язык (lang) и функцию изменения (setLang)
  const { lang, setLang } = useLang();

  // Словарик для элементов самой шапки
  const headerTranslations = {
    uk: { logo: 'CleanLink', logout: 'Вийти' },
    en: { logo: 'CleanLink', logout: 'Logout' }
  };

  // Функция циклического переключения: uk -> en -> uk
  const handleToggleLang = () => {
    setLang(lang === 'uk' ? 'en' : 'uk');
  };

  console.log('Load HEADER');

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* ЛОГОТИП */}
        <div className={styles.logoGroup}>
          <Link2 className={styles.logoIcon} size={24} />
          <span className={styles.logoText}>{headerTranslations[lang].logo}</span>
        </div>

        {/* НАСТРОЙКИ И ВЫХОД */}
        <div className={styles.controls}>
          {/* Переключатель языка */}
          <button className={styles.controlBtn} onClick={handleToggleLang} title="Змінити мову / Change language">
            <Globe size={18} />
            <span className={styles.langText}>{lang.toUpperCase()}</span>
          </button>

          {/* Переключатель темы */}
          <button className={styles.controlBtn} onClick={toggleTheme} title="Переключити тему">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Кнопка Выйти (раскомментируй при необходимости) */}
          {/* <button className={styles.logoutBtn} onClick={onLogout}>
            {headerTranslations[lang].logout}
          </button> 
          */}
        </div>
      </div>
    </header>
  );
}