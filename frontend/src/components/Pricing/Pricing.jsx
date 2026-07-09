import React, { useState } from 'react';
import styles from './Pricing.module.css';
import { useLang } from '../../context/LanguageContext';

export default function Pricing({ onPurchase, currentPlanSlug }) {
  // Достаем функцию t и текущий язык (lang/currentLang) напрямую из твоего хука контекста
  const { t, lang, currentLang } = useLang(); 
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); 

  // Сравниваем slug в нижнем регистре (безопасное сравнение)
  const userPlanSlug = currentPlanSlug ? currentPlanSlug.toLowerCase() : 'free';

  // Определяем точную строку активного языка (берем из контекста, либо из localStorage как запасной вариант)
  const activeLang = lang || currentLang || localStorage.getItem('cleanlink_lang') || 'en';

  // Функция для динамического перевода кнопки "Активен"
  const getActiveBtnText = () => {
    const translated = t('pricing.active');
    
    // Если ты уже добавил ключ 'pricing.active' в JSON-файлы, используем его
    if (translated && translated !== 'pricing.active') {
      return translated;
    }
    
    // Если ключа в файлах локализации пока нет, переводим по коду активного языка напрямую
    if (activeLang === 'uk') return 'Активний';
    if (activeLang === 'ru') return 'Активен';
    return 'Active'; // Для английского и всех остальных
  };

  const activeText = getActiveBtnText();

  const plans = [
    {
      id: 'free', 
      title: t('pricing.plans.base.title'),
      price: '$0',
      desc: t('pricing.plans.base.desc'),
      features: [
        { text: t('pricing.features.f1'), isAvailable: true },
        { text: t('pricing.features.f2'), isAvailable: true },
        { text: t('pricing.features.f3'), isAvailable: true },
        { text: t('pricing.features.f4'), isAvailable: false },
        { text: t('pricing.features.f5'), isAvailable: false },
      ],
      btnText: userPlanSlug === 'free' ? activeText : t('pricing.plans.base.btn'),
      isFeatured: false,
      disabled: userPlanSlug === 'free' || userPlanSlug === 'popular' || userPlanSlug === 'pro'
    },
    {
      id: 'popular', 
      title: t('pricing.plans.pro.title'), 
      price: '$5', 
      desc: t('pricing.plans.pro.desc'),
      features: [
        { text: t('pricing.features.f6'), isAvailable: true },
        { text: t('pricing.features.f7'), isAvailable: true },
        { text: t('pricing.features.f8'), isAvailable: true },
        { text: t('pricing.features.f9'), isAvailable: true },
        { text: t('pricing.features.f10'), isAvailable: true },
      ],
      btnText: userPlanSlug === 'popular' ? activeText : t('pricing.plans.pro.btn'),
      isFeatured: true, 
      disabled: userPlanSlug === 'popular'
    },
    {
      id: 'pro', 
      title: t('pricing.plans.business.title'), 
      price: '$10', 
      desc: t('pricing.plans.business.desc'),
      features: [
        { text: t('pricing.features.f11'), isAvailable: true },
        { text: t('pricing.features.f12'), isAvailable: true },
        { text: t('pricing.features.f13'), isAvailable: true },
        { text: t('pricing.features.f14'), isAvailable: true },
        { text: t('pricing.features.f15'), isAvailable: true },
      ],
      btnText: userPlanSlug === 'pro' ? activeText : t('pricing.plans.business.btn'),
      isFeatured: false,
      disabled: userPlanSlug === 'pro'
    }
  ];

  const handleSelectPlan = (plan) => {
    if (plan.disabled) return;
    setSelectedPlan(plan);
  };

  const handleExecutePayment = async () => {
    if (!selectedPlan || !onPurchase) return;
    setIsSubmitting(true);
    
    await onPurchase(selectedPlan.id);
    
    setIsSubmitting(false);
    setSelectedPlan(null);
  };

  return (
    <div className={styles.pricingWrapper}>
      <h2 className={styles.title}>{t('pricing.mainTitle')}</h2>
      
      <div className={styles.pricingGrid}>
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`${styles.pricingCard} ${plan.isFeatured ? styles.pricingCardFeatured : ''} ${plan.disabled ? styles.cardDisabled : ''}`}
          >
            {plan.isFeatured && <div className={styles.badgePopular}>{t('pricing.popularBadge')}</div>}
            
            <div className={styles.pricingHeader}>
              <h4>{plan.title}</h4>
              <div className={styles.price}>{plan.price}<span>{t('pricing.perMonth')}</span></div>
              <p>{plan.desc}</p>
            </div>

            <ul className={styles.featuresList}>
              {plan.features.map((feature, idx) => (
                <li key={idx} className={!feature.isAvailable ? styles.disabled : ''}>
                  {feature.isAvailable ? '✓' : '✗'} {feature.text}
                </li>
              ))}
            </ul>

            <button 
              type="button" 
              className={plan.isFeatured ? styles.btnPlanFeatured : styles.btnPlan}
              disabled={plan.disabled}
              onClick={() => handleSelectPlan(plan)}
            >
              {plan.btnText}
            </button>
          </div>
        ))}
      </div>

      {/* УНИВЕРСАЛЬНОЕ МОДАЛЬНОЕ ОКНО ОПЛАТЫ */}
      {selectedPlan && (
        <div className={styles.modalOverlay} onClick={() => setSelectedPlan(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>{t('pricing.modal.title')}</h3>
            <p>{t('pricing.modal.redirectText')} <strong>{selectedPlan.title}</strong>.</p>
            
            <div className={styles.modalActionBox}>
              <p className={styles.modalNotice}>
                {t('pricing.modal.notice')}
              </p>
              
              <button 
                className={styles.btnConfirm} 
                onClick={handleExecutePayment}
                disabled={isSubmitting}
              >
                {isSubmitting 
                  ? '...' 
                  : `${t('pricing.modal.btnPay')} ${selectedPlan.price}`}
              </button>
            </div>
            
            <button className={styles.btnClose} onClick={() => setSelectedPlan(null)}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}