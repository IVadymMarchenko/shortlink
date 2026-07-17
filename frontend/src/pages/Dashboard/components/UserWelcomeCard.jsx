// src/pages/Dashboard/components/UserWelcomeCard.jsx
import React from 'react';
import { useLang } from '../../../context/LanguageContext';

export default function UserWelcomeCard({ user, styles }) {
  
  const { t, lang } = useLang(); 
  
  if (!user) return null;

  const isPremiumUser = user.is_default_free === false;

  
  const currentPlanName = lang === 'en' ? user.plan_name_en : user.plan_name_uk;

  return (
    <div className={`${styles.card} ${styles.welcomeCard}`}>
      <div>
        <h2 className={styles.welcomeTitle}>
          {t('dashboard.welcome')}, {user.username || user.name || 'User'}! 👋
        </h2>
        <p className={styles.welcomeEmail}>
          {user.email}
        </p>
      </div>
      
      {/* Выводим строго данные из базы данных на нужном языке */}
      <div className={`${styles.planBadge} ${isPremiumUser ? styles.planBadgePro : ''}`}>
        {currentPlanName || t('dashboard.planFree')}
      </div>
    </div>
  );
}