import React from 'react';
import styles from './Footer.module.css';

export default function Footer({ lang }) {
  // Словарь для перевода футера
  const t = {
    ru: {
      rights: 'Все права защищены.',
      docs: 'Документация API',
      support: 'Поддержка'
    },
    en: {
      rights: 'All rights reserved.',
      docs: 'API Docs',
      support: 'Support'
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.copy}>
          &copy; 2026 CleanLink. {t[lang].rights}
        </div>
        <div className={styles.links}>
          <a href="#docs" className={styles.link}>{t[lang].docs}</a>
          <a href="#support" className={styles.link}>{t[lang].support}</a>
        </div>
      </div>
    </footer>
  );
}