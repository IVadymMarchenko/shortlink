import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useLang } from '../../../context/LanguageContext';

export default function LinksFilterControls({ searchQuery, handleSearchChange, sortBy, setSortBy, setVisibleCount, styles }) {
  const { t } = useLang();

  return (
    <div className={styles.filterSection}>
      <h3 className={styles.title} style={{ margin: 0 }}>{t('dashboard.myLinks')}</h3>
      <div className={styles.filterControls}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder={t('dashboard.searchPlaceholder')}
            value={searchQuery}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.sortBox}>
          <SlidersHorizontal size={16} className={styles.sortIcon} />
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setVisibleCount(5); }}
            className={styles.sortSelect}
          >
            <option value="newest">{t('dashboard.sortNewest')}</option>
            <option value="clicks">{t('dashboard.sortClicks')}</option>
          </select>
        </div>
      </div>
    </div>
  );
}