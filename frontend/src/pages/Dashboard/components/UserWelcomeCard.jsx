// src/pages/Dashboard/components/UserWelcomeCard.jsx
import React from 'react';
import { useLang } from '../../../context/LanguageContext';

export default function UserWelcomeCard({ user, userPlan, styles }) {
  const { t } = useLang();
  
  if (!user) return null;

  const isPro = userPlan === 'pro' || userPlan === 'popular';

  return (
    /* Скомбинировали базовый класс .card и наш новый .welcomeCard */
    <div className={`${styles.card} ${styles.welcomeCard}`}>
      <div>
        <h2 className={styles.welcomeTitle}>
          {t('dashboard.welcome')}, {user.username || user.name || 'User'}! 👋
        </h2>
        <p className={styles.welcomeEmail}>
          {user.email}
        </p>
      </div>
      
      {/* Динамически добавляем класс золотого градиента, если юзер — PRO */}
      <div className={`${styles.planBadge} ${isPro ? styles.planBadgePro : ''}`}>
        {isPro ? t('dashboard.planPro') : t('dashboard.planFree')}
      </div>
    </div>
  );
}