import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Copy, BarChart2, PlusCircle, Check, Download, Search, SlidersHorizontal, Crown } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import styles from './Dashboard.module.css';
import Input from '../../ui/Input/Input';
import Sidebar from '../../components/Sidebar/Sidebar';
import Pricing from '../../components/Pricing/Pricing';
import LinkStatsModal from '../../components/LinkStatsModal/LinkStatsModal';
import { downloadQRCode } from './downloadQr';
import { validateLinkForm } from './form_validation';
import { useLang } from '../../context/LanguageContext';
import api from '../../api';

export default function Dashboard({ onLogout, user }) {
  const { t } = useLang(); 
  const currentLang = localStorage.getItem('cleanlink_lang') || 'uk';

  const [links, setLinks] = useState([]);
  const [longUrl, setLongUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [copiedLinkId, setCopiedLinkId] = useState(null);

  const [errors, setErrors] = useState({ longUrl: '', customSlug: '' });

  const userPlan = useMemo(() => {
    if (!user || !user.plan_name) return 'free';
    const plan = user.plan_name.toLowerCase();
    return plan.includes('pro') ? 'pro' : 'free';
  }, [user]);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [visibleCount, setVisibleCount] = useState(5);
  const [activeTab, setActiveTab] = useState('links');
  const [activeStatsLink, setActiveStatsLink] = useState(null);

  const qrRef = useRef(null);

  // ЗАГРУЗКА ССЫЛОК С БЭКЕНДА
  const fetchUserLinks = async () => {
    try {
      const response = await api.get('/links/links/');
      setLinks(response.data); 
    } catch (err) {
      console.error("Ошибка при загрузке ссылок:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserLinks();
    }
  }, [user]);

  // ОБНОВЛЕНО: ОТПРАВКА ССЫЛКИ НА СВЕЖИЙ ЭНДПОИНТ И КОНТРОЛЬ ЛИМИТОВ
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { isValid, errors: validationErrors } = validateLinkForm(longUrl, customSlug, userPlan);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setErrors({ longUrl: '', customSlug: '' });

    try {
      // Отправка на эндпоинт ShortLinkCreateView (/api/links/create/)
      const response = await api.post('/links/create/', {
        original_url: longUrl.trim(),
        short_code: customSlug.trim() || undefined 
      });

      const newLink = response.data;
      setLinks(prevLinks => [newLink, ...prevLinks]);

      const domain = "127.0.0.1:8000"; 
      setGeneratedLink(`${domain}/${newLink.short_code}`);
      
      setLongUrl('');
      setCustomSlug('');
      setIsCopied(false);
      setVisibleCount(5); 
    } catch (err) {
      console.error("Ошибка при создании ссылки:", err);
      
      if (err.response) {
        const statusCode = err.response.status;
        const errorData = err.response.data;

        // Лимиты подписки исчерпаны (403 Forbidden)
        if (statusCode === 403) {
          setErrors(prev => ({
            ...prev,
            longUrl: errorData.detail || (currentLang === 'uk' ? "Перевищено ліміт посилань вашого тарифу" : "Plan link limit reached")
          }));
          return;
        }

        // Ошибки валидации сериализатора (400 Bad Request)
        if (statusCode === 400) {
          if (errorData.short_code) {
            setErrors(prev => ({
              ...prev,
              customSlug: "slug_already_taken" 
            }));
          }
          if (errorData.original_url) {
            setErrors(prev => ({
              ...prev,
              longUrl: "invalid_url_format"
            }));
          }
        }
      } else {
        setErrors(prev => ({
          ...prev,
          longUrl: currentLang === 'uk' ? "Помилка з'єднання з сервером" : "Server connection error"
        }));
      }
    }
  };

  const handleCopyGenerated = () => {
    navigator.clipboard.writeText(generatedLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCopyExisting = (link) => {
    const domain = "127.0.0.1:8000";
    const fullUrl = `${domain}/${link.short_code}`; 
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
        const domain = "127.0.0.1:8000";
        const shortCode = link.short_code ? link.short_code.toLowerCase() : '';
        const fullShort = `${domain}/${shortCode}`;
        const originalUrl = link.original_url ? link.original_url.toLowerCase() : '';
        return fullShort.includes(searchQuery.toLowerCase()) || originalUrl.includes(searchQuery.toLowerCase());
      })
      .sort((a, b) => {
        if (sortBy === 'clicks') {
          return b.clicks_count - a.clicks_count;
        }
        return b.id - a.id;
      });
  }, [links, searchQuery, sortBy]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.split('T')[0];
  };

  return (
    <div className={styles.layout}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />

      <main className={styles.mainContent}>
        {activeTab === 'links' && (
          <>
            {/* БЛОК ИНФОРМАЦИИ О ПОЛЬЗОВАТЕЛЕ */}
            {user && (
              <div style={{ 
                marginBottom: '1.5rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                background: 'var(--card-bg, #ffffff)',
                padding: '1.2rem 1.5rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                border: '1px solid var(--border-color, #e2e8f0)'
              }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-color, #1a202c)' }}>
                    {currentLang === 'uk' ? 'Привіт' : 'Hello'}, {user.username || user.name || 'User'}! 👋
                  </h2>
                  <p style={{ margin: '0.2rem 0 0 0', opacity: 0.7, fontSize: '0.9rem' }}>{user.email}</p>
                </div>
                <div style={{ 
                  padding: '0.4rem 1rem', 
                  borderRadius: '20px', 
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  letterSpacing: '0.5px',
                  background: userPlan === 'pro' ? 'linear-gradient(135deg, #eab308, #ca8a04)' : '#3b82f6',
                  color: '#fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {userPlan === 'pro' ? '👑 PRO' : '⚡ FREE'}
                </div>
              </div>
            )}

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
                  error={errors.longUrl ? (errors.longUrl.includes(' ') ? errors.longUrl : t(errors.longUrl)) : ''}
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
                  error={errors.customSlug ? t(errors.customSlug) : ''}
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
                  {filteredAndSortedLinks.slice(0, visibleCount).map(link => {
                    const domain = "127.0.0.1:8000";
                    return (
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
                    );
                  })}

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