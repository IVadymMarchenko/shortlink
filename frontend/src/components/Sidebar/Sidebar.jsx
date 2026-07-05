import React from 'react';
import { Link2, CreditCard, LogOut } from 'lucide-react';
import styles from "./Sidebar.module.css"; 
import { useLang } from '../../context/LanguageContext'; // 1. Импортируем хук

export default function Sidebar({ activeTab, setActiveTab, onLogout }) {
  const { lang } = useLang(); // 2. Достаем текущий язык ('uk' или 'en')

  // Локальный словарь для элементов сайдбара
  const menuTranslations = {
    uk: {
      links: 'Мої посилання',
      billing: 'Тарифи',
      logout: 'Вийти'
    },
    en: {
      links: 'My Links',
      billing: 'Pricing',
      logout: 'Log Out'
    }
  };

  const tMenu = menuTranslations[lang];

  // Массив пунктов меню использует переведенные строки
  const menuItems = [
    { id: 'links', label: tMenu.links, icon: <Link2 size={20} /> },
    { id: 'billing', label: tMenu.billing, icon: <CreditCard size={20} /> },
  ];

  console.log("LOAD SIDEBAR");

  return (
    <aside className={styles.sidebar}>
    
      {/* Навигация */}
      <nav className={styles.sidebarMenu}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`${styles.sidebarItem} ${activeTab === item.id ? styles.active : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            {item.icon}
            <span className={styles.itemLabel}>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Кнопка выхода в самом низу */}
      <div className={styles.sidebarFooter}>
        <button 
          type="button" 
          className={`${styles.sidebarItem} ${styles.logoutBtn}`} 
          onClick={onLogout}
        >
          <LogOut size={20} />
          <span className={styles.itemLabel}>{tMenu.logout}</span>
        </button>
      </div>
    </aside>
  );
}