// src/components/Sidebar/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom'; 
import { Link2, CreditCard, LogOut } from 'lucide-react'; 
import styles from "./Sidebar.module.css"; 
import { useLang } from '../../context/LanguageContext'; 

const MENU_TRANSLATIONS = {
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

export default function Sidebar({ onLogout }) { 
  const { lang } = useLang(); 
  const tMenu = MENU_TRANSLATIONS[lang] || MENU_TRANSLATIONS.en;

  const menuItems = [
    { path: '/dashboard', label: tMenu.links, icon: <Link2 size={20} /> },
    { path: '/billing', label: tMenu.billing, icon: <CreditCard size={20} /> },
  ];

  console.log("LOAD SIDEBAR");

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.sidebarMenu}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `${styles.sidebarItem} ${isActive ? styles.active : ''}`
            }
          >
            {item.icon}
            <span className={styles.itemLabel}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

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