import React, { useState, useEffect } from 'react';
import styles from './Pricing.module.css';
import { useLang } from '../../context/LanguageContext';
import api from '../../api';

export default function Pricing({ onPurchase, currentPlanSlug }) {
  const { t, lang, currentLang } = useLang(); 
  const [plans, setPlans] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const userPlanSlug = currentPlanSlug ? currentPlanSlug.toLowerCase() : 'free';
  const activeLang = lang || currentLang || localStorage.getItem('cleanlink_lang') || 'en';

  /* ВСЕ ТЕКСТЫ ОБЪЯВЛЕНЫ В ОДНОМ МЕСТЕ */
  const activeText = t('pricing.active', activeLang === 'uk' ? 'Поточний план' : 'Current Plan');
  const purchaseText = t('pricing.purchaseBtn', activeLang === 'uk' ? 'Обрати тариф' : 'Select Plan');
  const includedText = t('pricing.included', activeLang === 'uk' ? 'Включено' : 'Included');

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
    const planPrice = parseFloat(plan.price);
    if (planPrice === 0 || plan.slug.toLowerCase() === userPlanSlug) return;
    setSelectedPlan(plan);
  };

  const handleExecutePayment = async () => {
    if (!selectedPlan || !onPurchase) return;
    setIsSubmitting(true);
    await onPurchase(selectedPlan.slug); 
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
          const dSlug = plan.slug.toLowerCase(); 
          const isCurrent = userPlanSlug === dSlug;

          const planPrice = parseFloat(plan.price);
          const isFreePlan = planPrice === 0;
          const isDisabled = isFreePlan || isCurrent;

          const btnText = isCurrent ? activeText : (isFreePlan ? includedText : purchaseText);

          const features = [
            ...(plan.features || []).map(text => ({ text, isAvailable: true })),
            ...(plan.features_disabled || []).map(text => ({ text, isAvailable: false }))
          ];

          return (
            <div 
              key={plan.id}
              className={`${styles.pricingCard} ${plan.is_featured ? styles.pricingCardFeatured : ''} ${isDisabled ? styles.cardDisabled : ''}`}
            >
              {plan.is_featured && <div className={styles.badgePopular}>{t('pricing.popularBadge')}</div>}
              
              <div className={styles.pricingHeader}>
                <h4>{plan.name}</h4>
                <div className={styles.price}>${planPrice.toFixed(0)}<span>{t('pricing.perMonth')}</span></div>
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
                className={plan.is_featured ? styles.btnPlanFeatured : styles.btnPlan}
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