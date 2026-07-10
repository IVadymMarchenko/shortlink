// src/pages/Dashboard/components/LinksList.jsx
import React from 'react';
import { Check, Copy, BarChart2, Trash2 } from 'lucide-react';
import { useLang } from '../../../context/LanguageContext';

// Читаем домен из env-файла (работает как для Vite, так и для CRA через запасной вариант)
const BASE_SHORT_URL = import.meta.env.VITE_SHORT_LINK_DOMAIN || window.location.host;

export default function LinksList({ 
  filteredAndSortedLinks, 
  visibleCount, 
  setVisibleCount, 
  copiedLinkId, 
  handleCopyExisting, 
  setActiveStatsLink, 
  handleDelete, 
  styles 
}) {
  const { t, lang } = useLang();

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Intl.DateTimeFormat(lang, { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      }).format(new Date(dateStr));
    } catch (_) {
      return dateStr.split('T')[0];
    }
  };

  if (filteredAndSortedLinks.length === 0) {
    return <div className={styles.emptyState}>{t('dashboard.notFound')}</div>;
  }

  return (
    <div className={styles.linksList}>
      {filteredAndSortedLinks.slice(0, visibleCount).map(link => {
        const isCopied = copiedLinkId === link.id;

        return (
          <div key={link.id} className={styles.linkItem}>
            <div>
              <div className={styles.linkTitle}>{BASE_SHORT_URL}/{link.short_code}</div>
              <div className={styles.linkUrl}>{link.original_url}</div>
              <span className={styles.linkDate}>
                {t('dashboard.createdLabel')}: {formatDate(link.created_at)}
              </span>
            </div>
            
            <div className={styles.linkStats}>
              <div className={styles.clicksCount}>
                <div className={styles.clicksNum}>{link.clicks_count}</div>
                <div className={styles.clicksLabel}>{t('dashboard.clicksLabel')}</div>
              </div>

              <button 
                className={`${styles.btnIcon} ${isCopied ? styles.btnIconSuccess : ''}`} 
                title="Copy" 
                onClick={() => handleCopyExisting(link)}
                aria-label="Copy short link"
              >
                {isCopied ? <Check size={18} /> : <Copy size={18} />}
              </button>

              <button 
                className={`${styles.btnIcon} ${styles.btnIconStats}`} 
                title="Stats" 
                onClick={() => setActiveStatsLink(link)}
                aria-label="View statistics"
              >
                <BarChart2 size={18} />
              </button>

              <button 
                className={`${styles.btnIcon} ${styles.btnIconDelete}`} 
                title={t('dashboard.deleteLabel')} 
                onClick={() => handleDelete(link.id)}
                aria-label={t('dashboard.deleteLabel')}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        );
      })}

      {filteredAndSortedLinks.length > visibleCount && (
        <div className={styles.loadMoreWrapper}>
          <button
            type="button"
            className={styles.btnLoadMore}
            onClick={() => setVisibleCount(prev => prev + 5)}
          >
            {t('dashboard.showMore')}
          </button>
        </div>
      )}
    </div>
  );
}