import React from 'react';
import { Check, Copy, BarChart2, Trash2 } from 'lucide-react';
import { useLang } from '../../../context/LanguageContext';

export default function LinksList({ 
  filteredAndSortedLinks, visibleCount, setVisibleCount, copiedLinkId, 
  handleCopyExisting, setActiveStatsLink, handleDelete, currentLang, styles 
}) {
  const { t } = useLang();
  const domain = "127.0.0.1:8000";

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.split('T')[0];
  };

  if (filteredAndSortedLinks.length === 0) {
    return <div className={styles.emptyState}>{t('dashboard.notFound')}</div>;
  }

  return (
    <div className={styles.linksList}>
      {filteredAndSortedLinks.slice(0, visibleCount).map(link => (
        <div key={link.id} className={styles.linkItem}>
          <div>
            <div className={styles.linkTitle}>{domain}/{link.short_code}</div>
            <div className={styles.linkUrl}>{link.original_url}</div>
            <span className={styles.linkDate}>
              {currentLang === 'uk' ? 'Створено' : 'Created'}: {formatDate(link.created_at)}
            </span>
          </div>
          <div className={styles.linkStats}>
            <div className={styles.clicksCount}>
              <div className={styles.clicksNum}>{link.clicks_count}</div>
              <div className={styles.clicksLabel}>{t('dashboard.clicksLabel')}</div>
            </div>

            <button className={styles.btnIcon} title="Copy" onClick={() => handleCopyExisting(link)}>
              {copiedLinkId === link.id ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
            </button>

            <button className={`${styles.btnIcon} ${styles.btnIconStats}`} title="Stats" onClick={() => setActiveStatsLink(link)}>
              <BarChart2 size={18} />
            </button>

            <button className={styles.btnIcon} style={{ color: '#ef4444' }} title={currentLang === 'uk' ? 'Видалити' : 'Delete'} onClick={() => handleDelete(link.id)}>
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}

      {filteredAndSortedLinks.length > visibleCount && (
        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <button
            type="button"
            className={styles.btnDownloadQr}
            style={{ padding: '0.6rem 2.5rem', fontSize: '0.9rem', margin: '0 auto' }}
            onClick={() => setVisibleCount(prev => prev + 5)}
          >
            {t('dashboard.showMore')}
          </button>
        </div>
      )}
    </div>
  );
}