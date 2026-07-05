import React, { useState, useRef, useMemo } from 'react';
import { mockLinks } from '../../mockData';
import { Copy, BarChart2, PlusCircle, Check, Download, Search, SlidersHorizontal, Crown } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import styles from './Dashboard.module.css';
import Input from '../../ui/Input/Input';
import Sidebar from '../../components/Sidebar/Sidebar';
import Pricing from '../../components/Pricing/Pricing';
import LinkStatsModal from '../../components/LinkStatsModal/LinkStatsModal';
import { downloadQRCode } from './downloadQr';
import { validateLinkForm } from './form_validation';
import { useLang } from '../../context/LanguageContext'; // 1. Импортируем хук

export default function Dashboard({ onLogout }) {
  const { t } = useLang(); // 2. Инициализируем функцию перевода t

  const [links, setLinks] = useState(mockLinks);
  const [longUrl, setLongUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [copiedLinkId, setCopiedLinkId] = useState(null);

  // Стейт для хранения ошибок валидации
  const [errors, setErrors] = useState({ longUrl: '', customSlug: '' });

  // Доступные варианты: 'free' или 'pro'
  const [userPlan, setUserPlan] = useState('free');

  // Стейты для поиска и сортировки
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // СТЕЙТ ДЛЯ ПАГИНАЦИИ
  const [visibleCount, setVisibleCount] = useState(5);

  const [activeTab, setActiveTab] = useState('links');
  const [activeStatsLink, setActiveStatsLink] = useState(null);

  const qrRef = useRef(null);

  
  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Запуск внешней валидации
    const { isValid, errors: validationErrors } = validateLinkForm(longUrl, customSlug, userPlan);

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setErrors({ longUrl: '', customSlug: '' });

    const finalSlug = (userPlan !== 'free' && customSlug.trim())
      ? customSlug.trim().replace(/\s+/g, '-')
      : Math.random().toString(36).substring(2, 8);

    const domain = "cleanlink.com";
    const fullShortUrl = `${domain}/${finalSlug}`;

    const newLink = {
      id: Date.now(),
      long_url: longUrl.trim(),
      custom_domain: domain,
      short_slug: finalSlug,
      created_at: new Date().toISOString().split('T')[0],
      clicks_count: 0
    };

    setLinks([newLink, ...links]);
    setGeneratedLink(fullShortUrl);
    setLongUrl('');
    setCustomSlug('');
    setIsCopied(false);
    setVisibleCount(5); 
  };

  const handleCopyGenerated = () => {
    navigator.clipboard.writeText(generatedLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCopyExisting = (link) => {
    const fullUrl = `${link.custom_domain}/${link.short_slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLinkId(link.id);
    setTimeout(() => setCopiedLinkId(null), 2000);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setVisibleCount(5);
  };

  const filteredAndSortedLinks = useMemo(() => {
    return links
      .filter(link => {
        const fullShort = `${link.custom_domain}/${link.short_slug}`.toLowerCase();
        const originalUrl = link.long_url.toLowerCase();
        return fullShort.includes(searchQuery.toLowerCase()) || originalUrl.includes(searchQuery.toLowerCase());
      })
      .sort((a, b) => {
        if (sortBy === 'clicks') {
          return b.clicks_count - a.clicks_count;
        }
        return b.id - a.id;
      });
  }, [links, searchQuery, sortBy]);

  // Вытаскиваем текущий язык контекста для простых локальных переводов
  const currentLang = localStorage.getItem('cleanlink_lang') || 'uk';

  return (
    <div className={styles.layout}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />

      <main className={styles.mainContent}>
        {activeTab === 'links' && (
          <>
            {/* ФОРМА */}
            <div className={styles.card}>
              <h3 style={{ marginTop: 0 }}>{t('dashboard.title')}</h3>
              <form onSubmit={handleSubmit}>
                <Input
                  type="url"
                  label={t('dashboard.longUrlLabel')}
                  placeholder={t('dashboard.placeholderLong')}
                  value={longUrl}
                  onChange={(e) => {
                    setLongUrl(e.target.value);
                    if (errors.longUrl) setErrors(prev => ({ ...prev, longUrl: '' }));
                  }}
                  required
                  error={errors.longUrl ? t(errors.longUrl) : ''} // Динамический перевод ошибки
                  style={{ marginBottom: '1rem' }}
                />
                <Input
                  type="text"
                  label={
                    <div className={styles.labelWrapper}>
                      <span>{t('dashboard.customSlugLabel')}</span>
                      {userPlan === 'free' && (
                        <button
                          type="button"
                          onClick={() => setActiveTab('billing')}
                          className={styles.proBadgeBtn}
                        >
                          <Crown size={12} fill="#fff" /> {t('dashboard.proBadge')}
                        </button>
                      )}
                    </div>
                  }
                  placeholder={userPlan === 'free' ? t('dashboard.placeholderSlugFree') : t('dashboard.placeholderSlugPro')}
                  value={customSlug}
                  onChange={(e) => {
                    setCustomSlug(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''));
                    if (errors.customSlug) setErrors(prev => ({ ...prev, customSlug: '' }));
                  }}
                  disabled={userPlan === 'free'}
                  error={errors.customSlug ? t(errors.customSlug) : ''} // Динамический перевод ошибки
                  style={{ marginBottom: '1.5rem', opacity: userPlan === 'free' ? 0.65 : 1 }}
                />
                <button type="submit" className={styles.btnPrimary}>
                  <PlusCircle size={18} /> {t('dashboard.btnCreate')}
                </button>
              </form>

              {/* РЕЗУЛЬТАТ */}
              {generatedLink && (
                <div className={styles.resultContainer} style={{ marginTop: '1.5rem' }}>
                  <div className={styles.resultFlexWrapper}>
                    <div className={styles.resultMainSide}>
                      <label className={styles.resultLabel}>{t('dashboard.readyLabel')}</label>
                      <div className={styles.resultBox}>
                        <span className={styles.resultText}>{generatedLink}</span>
                        <button
                          className={`${styles.btnIcon} ${isCopied ? styles.copied : ''}`}
                          onClick={handleCopyGenerated}
                          type="button"
                        >
                          {isCopied ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className={styles.qrSection}>
                      <div ref={qrRef} className={styles.qrCodeHolder}>
                        <QRCodeSVG value={generatedLink} size={100} bgColor={"#ffffff"} fgColor={"#000000"} level={"H"} />
                      </div>
                      <button type="button"
                        className={styles.btnDownloadQr}
                        onClick={() => downloadQRCode(qrRef, `qr-${customSlug || 'cleanlink'}`)}
                        title={t('dashboard.downloadPng')}>
                        <Download size={14} /> {t('dashboard.downloadPng')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ПОИСК И СОРТИРОВКА */}
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

            {/* СПИСОК ССЫЛОК */}
            <div className={styles.linksList}>
              {filteredAndSortedLinks.length > 0 ? (
                <>
                  {filteredAndSortedLinks.slice(0, visibleCount).map(link => (
                    <div key={link.id} className={styles.linkItem}>
                      <div>
                        <div className={styles.linkTitle}>{link.custom_domain}/{link.short_slug}</div>
                        <div className={styles.linkUrl}>{link.long_url}</div>
                        <span className={styles.linkDate}>
                          {currentLang === 'uk' ? 'Створено' : 'Created'}: {link.created_at}
                        </span>
                      </div>
                      <div className={styles.linkStats}>
                        <div className={styles.clicksCount}>
                          <div className={styles.clicksNum}>{link.clicks_count}</div>
                          <div className={styles.clicksLabel}>{t('dashboard.clicksLabel')}</div>
                        </div>

                        <button
                          className={styles.btnIcon}
                          title="Copy"
                          onClick={() => handleCopyExisting(link)}
                        >
                          {copiedLinkId === link.id ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
                        </button>

                        <button
                          className={`${styles.btnIcon} ${styles.btnIconStats}`}
                          title="Stats"
                          onClick={() => setActiveStatsLink(link)}
                        >
                          <BarChart2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* КНОПКА ЗАГРУЗИТЬ ЕЩЕ */}
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
                </>
              ) : (
                <div className={styles.emptyState}>{t('dashboard.notFound')}</div>
              )}
            </div>
          </>
        )}

        {activeTab === 'billing' && <Pricing />}
        

        {activeStatsLink && (
          <LinkStatsModal link={activeStatsLink} onClose={() => setActiveStatsLink(null)} />
        )}
      </main>
    </div>
  );
}