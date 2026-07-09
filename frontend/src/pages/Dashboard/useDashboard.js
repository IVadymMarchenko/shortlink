// src/pages/Dashboard/useDashboard.js
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateLinkForm } from './form_validation';
import { useLang } from '../../context/LanguageContext';
import api from '../../api';

// Базовый домен для коротких ссылок (берется из .env или используется локальный)
const DOMAIN = import.meta.env.VITE_SHORT_LINK_DOMAIN || "127.0.0.1:8000";

export function useDashboard(user, initialTab) {
  // --- ПОДКЛЮЧЕНИЕ СИСТЕМНЫХ ХУКОВ ---
  const { t } = useLang(); // Функция локализации текстов и ошибок
  const navigate = useNavigate(); // Навигация между страницами (Dashboard / Billing)

  // --- СОСТОЯНИЕ (STATES) ---
  const [links, setLinks] = useState([]); // Список всех ссылок пользователя
  const [longUrl, setLongUrl] = useState(''); // Ввод длинного URL в форме
  const [customSlug, setCustomSlug] = useState(''); // Ввод кастомного хвоста ссылки
  const [generatedLink, setGeneratedLink] = useState(''); // Последняя успешно созданная короткая ссылка
  const [isCopied, setIsCopied] = useState(false); // Статус копирования только что созданной ссылки
  const [copiedLinkId, setCopiedLinkId] = useState(null); // ID существующей ссылки, которую скопировали прямо сейчас
  const [errors, setErrors] = useState({ longUrl: '', customSlug: '' }); // Ошибки валидации полей формы
  const [searchQuery, setSearchQuery] = useState(''); // Текст поискового запроса по ссылкам
  const [sortBy, setSortBy] = useState('newest'); // Режим сортировки ('newest' или 'clicks')
  const [visibleCount, setVisibleCount] = useState(5); // Количество отображаемых ссылок (пагинация "Показать еще")
  const [activeTab, setActiveTab] = useState(initialTab); // Текущая активная вкладка на панели
  const [activeStatsLink, setActiveStatsLink] = useState(null); // Ссылка, для которой сейчас открыта статистика

  // --- ВЫЧИСЛЯЕМЫЕ СВОЙСТВА (MEMO) ---
  // Определяем тарифный план пользователя на основе данных с бэкенда
  const userPlan = useMemo(() => {
    if (!user || !user.plan_name) return 'free';
    const plan = user.plan_name.toLowerCase();
    if (plan.includes('pro')) return 'pro';
    if (plan.includes('popular')) return 'popular';
    return 'free';
  }, [user]);

  // Фильтрация и сортировка ссылок (оптимизировано: поиск приведен к нижнему регистру до цикла)
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
        return b.id - a.id; // Сортировка по ID (сначала новые)
      });
  }, [links, searchQuery, sortBy]);

  // --- СИНХРОНИЗАЦИЯ ЭФФЕКТОВ (EFFECTS) ---
  // Синхронизируем состояние активного таба при изменении внешнего параметра initialTab
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Автоматически загружаем ссылки пользователя, как только объект user успешно получен
  useEffect(() => {
    if (user) {
      fetchUserLinks();
    }
  }, [user]);

  // --- МЕТОДЫ УПРАВЛЕНИЯ ИНТЕРФЕЙСОМ ---
  // Переключение вкладок панели и редирект пользователя на соответствующий роут
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'billing') {
      navigate('/billing');
    } else {
      navigate('/dashboard');
    }
  };

  // Изменение поискового запроса (сбрасывает пагинацию на начальные 5 элементов)
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setVisibleCount(5);
  };

  // --- ВЗАИМОДЕЙСТВИЕ С БУФЕРОМ ОБМЕНА (COPY) ---
  // Копирование только что сгенерированной ссылки из модального окна / верхнего блока
  const handleCopyGenerated = () => {
    navigator.clipboard.writeText(generatedLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // Сброс анимации "Скопировано" через 2 сек
  };

  // Копирование ссылки из списка уже существующих элементов
  const handleCopyExisting = (link) => {
    const fullUrl = `${DOMAIN}/${link.short_code}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLinkId(link.id);
    setTimeout(() => setCopiedLinkId(null), 2000); // Сброс статуса конкретной ссылки через 2 сек
  };

  // --- API ЗАПРОСЫ (БЭКЕНД) ---
  // Получение списка всех созданных ссылок текущего пользователя
  const fetchUserLinks = async () => {
    try {
      const response = await api.get('/links/links/');
      setLinks(response.data);
    } catch (err) {
      console.error("Ошибка при загрузке ссылок:", err);
    }
  };

  // Имитация покупки платного тарифа (Fake Payment)
  const handlePlanPurchase = async (planSlug) => {
    try {
      const response = await api.post('/pay/fake-payment/', { plan_slug: planSlug });
      if (response.data.status === 'success') {
        alert(t('errors.paymentSuccess'));
        window.location.reload(); // Перезагружаем страницу для обновления данных юзера
      }
    } catch (err) {
      console.error("Ошибка при оплате:", err);
      alert(t('errors.paymentError'));
    }
  };

  // Создание новой короткой ссылки (Валидация -> Запрос -> Обработка ошибок)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Фронтенд валидация на пустые поля или ограничения тарифа
    const { isValid, errors: validationErrors } = validateLinkForm(longUrl, customSlug, userPlan);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    // 2. Проверка кастомного хвоста на запрещенные спецсимволы
    if (customSlug && /[^a-zA-Z0-9-_]/.test(customSlug)) {
      setErrors(prev => ({ ...prev, customSlug: 'errors.slugInvalidChars' }));
      return;
    }

    setErrors({ longUrl: '', customSlug: '' }); // Очищаем старые ошибки перед отправкой

    try {
      // 3. Отправка данных на бэкенд Django
      const response = await api.post('/links/create/', {
        original_url: longUrl.trim(),
        short_code: customSlug.trim() || undefined
      });

      const newLink = response.data;
      setLinks(prevLinks => [newLink, ...prevLinks]); // Добавляем новую ссылку в начало списка
      setGeneratedLink(`${DOMAIN}/${newLink.short_code}`); // Формируем готовый URL для отображения

      // Очищаем поля ввода формы
      setLongUrl('');
      setCustomSlug('');
      setIsCopied(false);
      setVisibleCount(5);
    } catch (err) {
      console.error("Ошибка при создании ссылки:", err);
      if (err.response) {
        const statusCode = err.response.status;
        const errorData = err.response.data;

        // Обработка ошибки 403 Forbidden (достигнут лимит тарифного плана)
        if (statusCode === 403) {
          setErrors(prev => ({
            ...prev,
            longUrl: errorData.detail || 'errors.limitReached'
          }));
          return;
        }

        // Обработка ошибок 400 Bad Request (занятый слаг или невалидный URL)
        if (statusCode === 400) {
          if (errorData.short_code) {
            const serverError = Array.isArray(errorData.short_code) ? errorData.short_code[0] : errorData.short_code;
            setErrors(prev => ({
              ...prev,
              customSlug: serverError === "slug_already_taken" ? 'errors.slugAlreadyTaken' : serverError
            }));
          }
          if (errorData.original_url) {
            setErrors(prev => ({ ...prev, longUrl: 'errors.invalidUrlFormat' }));
          }
        }
      } else {
        // Ошибка, если бэкенд полностью недоступен (нет сети)
        setErrors(prev => ({ ...prev, longUrl: 'errors.serverError' }));
      }
    }
  };

  // Удаление ссылки и всей привязанной к ней статистики
  const handleDelete = async (linkId) => {
    const confirmDelete = window.confirm(t('errors.deleteConfirm'));
    if (!confirmDelete) return;

    try {
      await api.delete(`/links/${linkId}/delete/`);
      setLinks(prevLinks => prevLinks.filter(link => link.id !== linkId)); // Убираем из стейта удаленный элемент
    } catch (err) {
      console.error("Ошибка при удалении ссылки:", err);
      alert(t('errors.deleteError'));
    }
  };

  // Возвращаем методы и стейты для деструктуризации в компоненте Dashboard
  return {
    activeTab,
    userPlan,
    longUrl,
    setLongUrl,
    customSlug,
    setCustomSlug,
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
    handleTabChange,
    handleSubmit,
    handleDelete,
    handleCopyGenerated,
    handleCopyExisting,
    handleSearchChange,
    shortLinkDomain: DOMAIN
  };
}