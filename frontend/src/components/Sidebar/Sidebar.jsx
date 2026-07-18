// src/components/Sidebar/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom'; 
import { Link2, CreditCard, LogOut } from 'lucide-react'; 
import styles from "./Sidebar.module.css"; 
import { useLang } from '../../context/LanguageContext'; 

export default function Sidebar({ onLogout }) { 
  const { t } = useLang(); // Твой глобальный переводчик

  // Убираем костыли: теперь t() чисто берет данные из словаря
  const linksLabel = t('dashboard.myLinks');
  const billingLabel = t('pricing.mainTitle');
  const logoutLabel = t('auth.logout');

  const menuItems = [
    { path: '/dashboard', label: linksLabel, icon: <Link2 size={20} /> },
    { path: '/billing', label: billingLabel, icon: <CreditCard size={20} /> },
  ];

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
          <span className={styles.itemLabel}>{logoutLabel}</span>
        </button>
      </div>
    </aside>
  );
}