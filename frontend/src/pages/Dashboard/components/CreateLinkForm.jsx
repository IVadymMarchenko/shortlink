// src/pages/Dashboard/components/CreateLinkForm.jsx
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Crown, Check, Copy, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Input from '../../../ui/Input/Input'; 
import { downloadQRCode } from '../downloadQr'; 
import { useLang } from '../../../context/LanguageContext';

export default function CreateLinkForm({ 
  handleSubmit, 
  longUrl, 
  setLongUrl, 
  errors, 
  setErrors, 
  customSlug, 
  handleSlugChange, 
  isCustomSlugAllowed,
  generatedLink, 
  isCopied, 
  handleCopyGenerated, 
  styles 
}) {
  const { t } = useLang();
  const qrRef = useRef(null);

const formatError = (errorKey) => {
    if (!errorKey) return '';
    if (errorKey.includes(' ')) return errorKey;
    
    // ИСПРАВЛЕНО: если бэкенд уже прислал "errors.что-то", используем как есть
    const finalKey = errorKey.startsWith('errors.') ? errorKey : `errors.${errorKey}`;
    return t(finalKey);
  };

  return (
    <div className={styles.card}>
      <h3>{t('dashboard.title')}</h3>
      
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
          error={formatError(errors.longUrl)}
          className={styles.formInputSpacing}
        />
        
        <Input
          type="text"
          label={
            <div className={styles.labelWrapper}>
              <span>{t('dashboard.customSlugLabel')}</span>
              {/* Показываем кнопку PRO, только если кастомный слаг НЕ разрешен */}
              {!isCustomSlugAllowed && (
                <Link to="/billing" className={styles.proBadgeBtn}>
                  <Crown size={12} fill="currentColor" /> {t('dashboard.proBadge')}
                </Link>
              )}
            </div>
          }
          placeholder={!isCustomSlugAllowed ? t('dashboard.placeholderSlugFree') : t('dashboard.placeholderSlugPro')}
          value={customSlug}
          onChange={(e) => handleSlugChange(e.target.value)}
          disabled={!isCustomSlugAllowed} 
          error={formatError(errors.customSlug)}
          className={`${styles.formInputSpacingLast} ${!isCustomSlugAllowed ? styles.inputDisabled : ''}`}
        />
        
        <button type="submit" className={styles.btnPrimary}>
          <PlusCircle size={18} /> {t('dashboard.btnCreate')}
        </button>
      </form>

      {generatedLink && (
        <div className={styles.resultContainer}>
          <div className={styles.resultFlexWrapper}>
            <div className={styles.resultMainSide}>
             
              <span className={styles.resultLabel}>{t('dashboard.readyLabel')}</span>
              <div className={styles.resultBox}>
                <span className={styles.resultText}>{generatedLink}</span>
                <button 
                  // Используем твой стильный класс успешного копирования из CSS модуля
                  className={`${styles.btnIcon} ${isCopied ? styles.btnIconSuccess : ''}`} 
                  onClick={handleCopyGenerated} 
                  type="button"
                >
                  {isCopied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            <div className={styles.qrSection}>
              <div ref={qrRef} className={styles.qrCodeHolder}>
                <QRCodeSVG 
                  value={generatedLink} 
                  size={100} 
                  bgColor="transparent" 
                  fgColor="var(--qr-fg)" 
                  level="H" 
                />
              </div>
              <button 
                type="button" 
                className={styles.btnDownloadQr} 
                onClick={() => downloadQRCode(qrRef, `qr-${customSlug || 'cleanlink'}`)} 
                title={t('dashboard.downloadPng')}
              >
                <Download size={14} /> {t('dashboard.downloadPng')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}