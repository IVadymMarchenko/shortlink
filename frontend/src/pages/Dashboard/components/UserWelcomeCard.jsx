import React from 'react';
import { useLang } from '../../../context/LanguageContext'; // Выходим из components/Dashboard/components/ вверх до src

export default function UserWelcomeCard({ user, userPlan, styles }) {
  const { t } = useLang();
  if (!user) return null;

  return (
    <div className={styles.card} style={{
      marginBottom: '1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.2rem 1.5rem',
    }}>
      <div>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-main)' }}>
          {t('dashboard.welcome')}, {user.username || user.name || 'User'}! 👋
        </h2>
        <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {user.email}
        </p>
      </div>
      <div style={{
        padding: '0.4rem 1rem',
        borderRadius: '20px',
        fontWeight: 'bold',
        fontSize: '0.85rem',
        letterSpacing: '0.5px',
        background: userPlan === 'pro' || userPlan === 'popular' ? 'linear-gradient(135deg, #eab308, #ca8a04)' : '#3b82f6',
        color: '#ffffff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        flexShrink: 0
      }}>
        {userPlan === 'pro' || userPlan === 'popular' ? '👑 PRO' : '⚡ FREE'}
      </div>
    </div>
  );
}