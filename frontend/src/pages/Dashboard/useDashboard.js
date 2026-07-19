// src/pages/Dashboard/useDashboard.js
import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { validateLinkForm } from './form_validation';
import { useLang } from '../../context/LanguageContext';
import { linksService } from '../../linksService';

const DOMAIN = import.meta.env.VITE_SHORT_LINK_DOMAIN || "127.0.0.1:8000";

export function useDashboard(user) {
  const { t } = useLang();
  const location = useLocation();

  // --- СОСТОЯНИЕ (STATES) ---
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(false); 
  const [longUrl, setLongUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [copiedLinkId, setCopiedLinkId] = useState(null);
  const [errors, setErrors] = useState({ longUrl: '', customSlug: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [visibleCount, setVisibleCount] = useState(5);
  const [activeStatsLink, setActiveStatsLink] = useState(null);

  // --- ВЫЧИСЛЯЕМЫЕ СВОЙСТВА (MEMO) ---
  const activeTab = useMemo(() => {
    if (location.pathname.includes('/billing')) return 'billing';
    return 'links';
  }, [location.pathname]);

  const userPlan = useMemo(() => {
    return user?.plan_slug ? user.plan_slug.toLowerCase() : 'free';
  }, [user?.plan_slug]);

  const filteredAndSortedLinks = useMemo(() => {
    const lowerSearch = searchQuery.toLowerCase();
    return links
      .filter(link => {
        const shortCode = link.short_code ? link.short_code.toLowerCase() : '';
        const fullShort = `${DOMAIN}/${shortCode}`;
        const originalUrl = link.original_url ? link.original_url.toLowerCase() : '';
        return fullShort.includes(lowerSearch) || originalUrl.includes(lowerSearch);
      })
      .sort((a, b) => {
        if (sortBy === 'clicks') return b.clicks_count - a.clicks_count;
        return b.id - a.id;
      });
  }, [links, searchQuery, sortBy]);

  // --- ЭФФЕКТЫ (ПОЛЛИНГ ВМЕСТО SSE) ---

  // 1. Первичная загрузка при входе на страницу
  useEffect(() => {
    if (user?.id) {
      fetchUserLinks();
    }
  }, [user?.id]);

  // 2. Фоновое обновление кликов каждые 7 секунд (без вызова лоадера)
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      linksService.getAllLinks()
        .then(data => setLinks(data))
        .catch(err => console.error("Ошибка фонового обновления кликов:", err));
    }, 7000); 

    return () => clearInterval(interval);
  }, [user?.id]);

  // --- МЕТОДЫ УПРАВЛЕНИЯ И ВАЛИДАЦИИ ---
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setVisibleCount(5);
  };

  const handleSlugChange = (val) => {
    setCustomSlug(val);
    if (/[^a-zA-Z0-9-_]/.test(val)) {
      setErrors(prev => ({ ...prev, customSlug: 'slugInvalidChars' }));
    } else {
      setErrors(prev => ({ ...prev, customSlug: '' }));
    }
  };

  const handleCopyGenerated = () => {
    navigator.clipboard.writeText(generatedLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCopyExisting = (link) => {
    const fullUrl = `${DOMAIN}/${link.short_code}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLinkId(link.id);
    setTimeout(() => setCopiedLinkId(null), 2000);
  };

  // --- API ЗАПРОСЫ ---
  const fetchUserLinks = async () => {
    setIsLoading(true);
    try {
      const data = await linksService.getAllLinks();
      setLinks(data); 
    } catch (err) {
      console.error("Ошибка при загрузке ссылок:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanPurchase = async (planSlug) => {
    try {
      const data = await linksService.purchasePlan(planSlug);
      if (data.status === 'success') {
        alert(t('errors.paymentSuccess'));
        window.location.reload(); 
      }
    } catch (err) {
      console.error("Ошибка при оплате:", err);
      alert(t('errors.paymentError'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors: validationErrors } = validateLinkForm(longUrl, customSlug, userPlan);
    if (!isValid) { setErrors(validationErrors); return; }
    if (errors.customSlug) return; 

    try {
      const newLink = await linksService.createLink(longUrl.trim(), customSlug.trim());
      setLinks(prevLinks => [newLink, ...prevLinks]);
      setGeneratedLink(`${DOMAIN}/${newLink.short_code}`);
      setLongUrl(''); setCustomSlug(''); setIsCopied(false); setVisibleCount(5);
    } catch (apiError) {
      setErrors(prev => ({
        ...prev,
        longUrl: apiError.longUrl || prev.longUrl,
        customSlug: apiError.customSlug || prev.customSlug
      }));
    }
  };

  const handleDelete = async (linkId) => {
    const confirmDelete = window.confirm(t('errors.deleteConfirm'));
    if (!confirmDelete) return;
    try {
      await linksService.deleteLink(linkId);
      setLinks(prevLinks => prevLinks.filter(link => link.id !== linkId));
    } catch (err) {
      console.error("Ошибка при удалении ссылки:", err);
      alert(t('errors.deleteError'));
    }
  };

  return {
    activeTab,
    userPlan,
    isLoading,
    longUrl,
    setLongUrl,
    customSlug,
    handleSlugChange,
    errors,
    setErrors,
    generatedLink,
    isCopied,
    copiedLinkId,
    searchQuery,
    sortBy,
    setSortBy,
    visibleCount,
    setVisibleCount,
    activeStatsLink,
    setActiveStatsLink,
    filteredAndSortedLinks,
    handlePlanPurchase,
    handleSubmit,
    handleDelete,
    handleCopyGenerated,
    handleCopyExisting,
    handleSearchChange,
    shortLinkDomain: DOMAIN
  };
}