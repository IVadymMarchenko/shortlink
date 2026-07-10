// src/pages/Dashboard/components/CreateLinkForm.jsx
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Crown, Check, Copy, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Input from '../../../ui/Input/Input'; 
import { downloadQRCode } from '../downloadQr'; 
import { useLang } from '../../../context/LanguageContext';

export default function CreateLinkForm({ 
  handleSubmit, longUrl, setLongUrl, errors, setErrors, customSlug, handleSlugChange, 
  userPlan, generatedLink, isCopied, handleCopyGenerated, styles 
}) {
  const { t } = useLang();
  const qrRef = useRef(null);

  const formatError = (errorKey) => {
    if (!errorKey) return '';
    return errorKey.includes(' ') ? errorKey : t(errorKey);
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
              {userPlan === 'free' && (
                <Link to="/billing" className={styles.proBadgeBtn}>
                  <Crown size={12} fill="currentColor" /> {t('dashboard.proBadge')}
                </Link>
              )}
            </div>
          }
          placeholder={userPlan === 'free' ? t('dashboard.placeholderSlugFree') : t('dashboard.placeholderSlugPro')}
          value={customSlug}
          onChange={(e) => handleSlugChange(e.target.value)}
          disabled={userPlan === 'free'}
          error={formatError(errors.customSlug)}
          className={`${styles.formInputSpacingLast} ${userPlan === 'free' ? styles.inputDisabled : ''}`}
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