import React, { useRef } from 'react';
import { PlusCircle, Crown, Check, Copy, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Input from '../../../ui/Input/Input'; // Путь к общей ui папке
import { downloadQRCode } from '../downloadQr'; // Скрипт лежит рядом в Dashboard/
import { useLang } from '../../../context/LanguageContext';

export default function CreateLinkForm({ 
  handleSubmit, longUrl, setLongUrl, errors, setErrors, customSlug, setCustomSlug, 
  userPlan, handleTabChange, generatedLink, isCopied, handleCopyGenerated, currentLang, styles 
}) {
  const { t } = useLang();
  const qrRef = useRef(null);

  return (
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
                <button type="button" onClick={() => handleTabChange('billing')} className={styles.proBadgeBtn}>
                  <Crown size={12} fill="#fff" /> {t('dashboard.proBadge')}
                </button>
              )}
            </div>
          }
          placeholder={userPlan === 'free' ? t('dashboard.placeholderSlugFree') : t('dashboard.placeholderSlugPro')}
          value={customSlug}
          onChange={(e) => {
            const val = e.target.value;
            setCustomSlug(val);
            if (/[^a-zA-Z0-9-_]/.test(val)) {
              setErrors(prev => ({ 
                ...prev, 
                customSlug: currentLang === 'uk' 
                  ? 'Дозволені лише латинські літери (A-Z), цифри, "-" та "_"' 
                  : 'Only Latin letters (A-Z), numbers, "-" and "_" are allowed' 
              }));
            } else {
              if (errors.customSlug) setErrors(prev => ({ ...prev, customSlug: '' }));
            }
          }}
          disabled={userPlan === 'free'}
          error={errors.customSlug ? (errors.customSlug.includes(' ') ? errors.customSlug : t(errors.customSlug)) : ''}
          style={{ marginBottom: '1.5rem', opacity: userPlan === 'free' ? 0.65 : 1 }}
        />
        <button type="submit" className={styles.btnPrimary}>
          <PlusCircle size={18} /> {t('dashboard.btnCreate')}
        </button>
      </form>

      {generatedLink && (
        <div className={styles.resultContainer} style={{ marginTop: '1.5rem' }}>
          <div className={styles.resultFlexWrapper}>
            <div className={styles.resultMainSide}>
              <label className={styles.resultLabel}>{t('dashboard.readyLabel')}</label>
              <div className={styles.resultBox}>
                <span className={styles.resultText}>{generatedLink}</span>
                <button className={`${styles.btnIcon} ${isCopied ? styles.copied : ''}`} onClick={handleCopyGenerated} type="button">
                  {isCopied ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            <div className={styles.qrSection}>
              <div ref={qrRef} className={styles.qrCodeHolder}>
                <QRCodeSVG value={generatedLink} size={100} bgColor={"#ffffff"} fgColor={"#000000"} level={"H"} />
              </div>
              <button type="button" className={styles.btnDownloadQr} onClick={() => downloadQRCode(qrRef, `qr-${customSlug || 'cleanlink'}`)} title={t('dashboard.downloadPng')}>
                <Download size={14} /> {t('dashboard.downloadPng')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}