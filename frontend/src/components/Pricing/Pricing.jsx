import React, { useState, useEffect } from 'react';
import styles from './Pricing.module.css';
import { useLang } from '../../context/LanguageContext';
import api from '../../api'; // Твой Axios-клиент

export default function Pricing({ onPurchase, currentPlanSlug }) {
  // ДОБАВЬ ЭТУ СТРОКУ:
  console.log("=== ДЕБАГ ПЛАНА В PRICING === currentPlanSlug пришел как:", currentPlanSlug);
  const { t, lang, currentLang } = useLang(); 
  const [plans, setPlans] = useState([]); // Сюда грузим тарифы из Django
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); 

  // Приводим текущий план юзера к нижнему регистру
  const userPlanSlug = currentPlanSlug ? currentPlanSlug.toLowerCase() : 'free';
  const activeLang = lang || currentLang || localStorage.getItem('cleanlink_lang') || 'en';

  const getActiveBtnText = () => {
    const translated = t('pricing.active');
    if (translated && translated !== 'pricing.active') return translated;
    if (activeLang === 'uk') return 'Поточний план';
    if (activeLang === 'ru') return 'Текущий план';
    return 'Current Plan';
  };

  const activeText = getActiveBtnText();

  // Загружаем данные из API Django
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await api.get('/plans/', {
          headers: { 'Accept-Language': activeLang }
        });
        setPlans(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch plans:", err);
        setError('errors.serverError');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [activeLang]);

  const handleSelectPlan = (plan) => {
    const dSlug = plan.slug.toLowerCase();
    // Если это бесплатный план или текущий план пользователя — модалку не открываем
    if (dSlug === 'free' || dSlug === userPlanSlug) return;
    setSelectedPlan(plan);
  };

  const handleExecutePayment = async () => {
    if (!selectedPlan || !onPurchase) return;
    setIsSubmitting(true);
    await onPurchase(selectedPlan.slug); // Отправляем чистый слаг из базы (free/popular/business)
    setIsSubmitting(false);
    setSelectedPlan(null);
  };

  if (loading) return <div className={styles.pricingLoader}>{t('auth.loadingText')}</div>;
  if (error) return <div className={styles.pricingError}>{t(error)}</div>;

  return (
    <div className={styles.pricingWrapper}>
      <h2 className={styles.title}>{t('pricing.mainTitle')}</h2>
      
      <div className={styles.pricingGrid}>
        {plans.map((plan) => {
          const dSlug = plan.slug.toLowerCase(); // 'free', 'popular', 'business'
          const isCurrent = userPlanSlug === dSlug;
          
          // Логика блокировки кнопок:
          // План free ЗАБЛОКИРОВАН ВСЕГДА. План popular или business заблокирован, только если он текущий.
          const isDisabled = dSlug === 'free' || isCurrent;

          // Динамический текст кнопки: если текущий тариф — пишем "Поточний план", иначе берём из i18n
         // Динамический текст кнопки
          let btnText = '';
          if (isCurrent) {
            btnText = activeText; // Поточний план
          } else if (dSlug === 'free') {
            // Если тариф бесплатный, но юзер уже перешел на платный — убираем с кнопки фразу "Поточний план"
            btnText = activeLang === 'uk' ? 'Включено' : activeLang === 'ru' ? 'Включено' : 'Included';
          } else {
            // Для всех остальных планов берем стандартный текст кнопки из локализации
            btnText = t(`pricing.plans.${dSlug === 'business' ? 'business' : dSlug === 'popular' ? 'pro' : 'base'}.btn`);
          }
          // Собираем фичи из базы
          const features = [
            ...plan.features.map(text => ({ text, isAvailable: true })),
            ...(plan.features_disabled || []).map(text => ({ text, isAvailable: false }))
          ];

          return (
            <div 
              key={plan.id} 
              className={`${styles.pricingCard} ${dSlug === 'popular' ? styles.pricingCardFeatured : ''} ${isDisabled ? styles.cardDisabled : ''}`}
            >
              {dSlug === 'popular' && <div className={styles.badgePopular}>{t('pricing.popularBadge')}</div>}
              
              <div className={styles.pricingHeader}>
                <h4>{plan.name}</h4>
                <div className={styles.price}>${parseFloat(plan.price).toFixed(0)}<span>{t('pricing.perMonth')}</span></div>
                <p>{plan.description}</p>
              </div>

              <ul className={styles.featuresList}>
                {features.map((feature, idx) => (
                  <li key={idx} className={!feature.isAvailable ? styles.disabled : ''}>
                    {feature.isAvailable ? '✓' : '✗'} {feature.text}
                  </li>
                ))}
              </ul>

              <button 
                type="button" 
                className={dSlug === 'popular' ? styles.btnPlanFeatured : styles.btnPlan}
                disabled={isDisabled}
                onClick={() => handleSelectPlan(plan)}
              >
                {btnText}
              </button>
            </div>
          );
        })}
      </div>

      {/* МОДАЛКА ОПЛАТЫ */}
      {selectedPlan && (
        <div className={styles.modalOverlay} onClick={() => setSelectedPlan(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>{t('pricing.modal.title')}</h3>
            <p>{t('pricing.modal.redirectText')} <strong>{selectedPlan.name}</strong>.</p>
            <div className={styles.modalActionBox}>
              <p className={styles.modalNotice}>{t('pricing.modal.notice')}</p>
              <button className={styles.btnConfirm} onClick={handleExecutePayment} disabled={isSubmitting}>
                {isSubmitting ? '...' : `${t('pricing.modal.btnPay')} $${parseFloat(selectedPlan.price).toFixed(0)}`}
              </button>
            </div>
            <button className={styles.btnClose} onClick={() => setSelectedPlan(null)}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}