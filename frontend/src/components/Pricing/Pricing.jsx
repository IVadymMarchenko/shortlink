import React, { useState } from 'react';
import styles from './Pricing.module.css';
import { useLang } from '../../context/LanguageContext'; // 1. Импортируем хук

export default function Pricing() {
  const { t } = useLang(); // 2. Инициализируем t()
  const [selectedPlan, setSelectedPlan] = useState(null);
  console.log("LOAD PRICING")

  // Переводы берутся динамически по id фич и планов
  const plans = [
    {
      id: 'base',
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
      btnText: t('pricing.plans.base.btn'),
      isFeatured: false,
      disabled: true
    },
    {
      id: 'pro',
      title: t('pricing.plans.pro.title'),
      price: '$9',
      desc: t('pricing.plans.pro.desc'),
      features: [
        { text: t('pricing.features.f6'), isAvailable: true },
        { text: t('pricing.features.f7'), isAvailable: true },
        { text: t('pricing.features.f8'), isAvailable: true },
        { text: t('pricing.features.f9'), isAvailable: true },
        { text: t('pricing.features.f10'), isAvailable: true },
      ],
      btnText: t('pricing.plans.pro.btn'),
      isFeatured: true,
      disabled: false
    },
    {
      id: 'business',
      title: t('pricing.plans.business.title'),
      price: '$29',
      desc: t('pricing.plans.business.desc'),
      features: [
        { text: t('pricing.features.f11'), isAvailable: true },
        { text: t('pricing.features.f12'), isAvailable: true },
        { text: t('pricing.features.f13'), isAvailable: true },
        { text: t('pricing.features.f14'), isAvailable: true },
        { text: t('pricing.features.f15'), isAvailable: true },
      ],
      btnText: t('pricing.plans.business.btn'),
      isFeatured: false,
      disabled: false
    }
  ];

  const handleSelectPlan = (plan) => {
    if (plan.disabled) return;
    setSelectedPlan(plan);
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
                onClick={() => alert(`${t('pricing.alertSuccess')} ${selectedPlan.title}! ${t('pricing.alertCharged')} ${selectedPlan.price}`)}
              >
                {t('pricing.modal.btnPay')} {selectedPlan.price}
              </button>
            </div>
            
            <button className={styles.btnClose} onClick={() => setSelectedPlan(null)}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}