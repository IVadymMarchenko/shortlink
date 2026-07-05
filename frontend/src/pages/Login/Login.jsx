import React, { useState } from 'react';
import styles from './Login.module.css';
import Input from '../../ui/Input/Input';
import { validateLoginForm, validateRegisterForm } from './login_validation';
import { useLang } from '../../context/LanguageContext'; // 1. Импортируем наш хук

export default function Login({ onLogin }) {
  const { t } = useLang(); // 2. Достаем функцию перевода t
  
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Хранилище точечных ошибок для каждого инпута
  const [errors, setErrors] = useState({});
  // Стейт для триггера анимации тряски карточки
  const [isError, setIsError] = useState(false);

  // Хэндлер переключения табов: очищаем поля и сбрасываем прошлые ошибки
  const handleTabChange = (isLogin) => {
    setIsLoginTab(isLogin);
    setEmail('');
    setPassword('');
    setName('');
    setErrors({});
    setIsError(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let result;

    if (isLoginTab) {
      result = validateLoginForm(email, password);
    } else {
      result = validateRegisterForm(name, email, password);
    }

    // Если валидация провалилась
    if (!result.isValid) {
      setErrors(result.errors); // Записываем ключи ошибок (например, 'auth.enterEmail')
      setIsError(true);         // Включаем анимацию тряски
      setTimeout(() => setIsError(false), 500);
      return;
    }

    setErrors({});

    if (isLoginTab) {
      console.log('Вход в Django:', { email, password });
    } else {
      console.log('Регистрация в Django:', { name, email, password });
    }
    
    onLogin();
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.card} ${isError ? styles.shake : ''}`}>
        
        {/* ВКЛАДКИ */}
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${isLoginTab ? styles.activeTab : ''}`}
            onClick={() => handleTabChange(true)}
          >
            {t('auth.tabLogin')}
          </button>
          <button 
            className={`${styles.tab} ${!isLoginTab ? styles.activeTab : ''}`}
            onClick={() => handleTabChange(false)}
          >
            {t('auth.tabRegister')}
          </button>
        </div>

        <h2 className={styles.title}>
          {isLoginTab ? t('auth.titleLogin') : t('auth.titleRegister')}
        </h2>
        <p className={styles.subtitle}>
          {isLoginTab ? t('auth.subtitleLogin') : t('auth.subtitleRegister')}
        </p>

        {/* ФОРМА */}
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          
          {/* Поле Имя с плавным CSS переходом */}
          <div className={`${styles.nameFieldContainer} ${!isLoginTab ? styles.showName : ''}`}>
            <Input 
              type="text"
              label={t('auth.labelName')}
              placeholder={t('auth.placeholderName')}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
              }}
              required={!isLoginTab}
              error={errors.name ? t(errors.name) : ''} // 3. Обязательно переводим ключ ошибки
            />
          </div>

          <Input 
            type="email"
            label={t('auth.labelEmail')}
            placeholder="vadym@gmail.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
            }}
            required
            error={errors.email ? t(errors.email) : ''} // 3. Обязательно переводим ключ ошибки
          />

          <Input 
            type="password"
            label={t('auth.labelPassword')}
            placeholder={t('auth.placeholderPassword')}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
            }}
            required
            error={errors.password ? t(errors.password) : ''} // 3. Обязательно переводим ключ ошибки
          />

          <button type="submit" className={styles.btnSubmit}>
            {isLoginTab ? t('auth.btnLogin') : t('auth.btnRegister')}
          </button>
        </form>

        <div className={styles.divider}>
          <span>{t('auth.or')}</span>
        </div>

        <button className={styles.btnGoogle} onClick={onLogin}>
          <img 
            className={styles.googleIcon} 
            src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" 
            alt="Google"
            width="20"
            height="20" 
          />
          {t('auth.btnGoogle')}
        </button>

      </div>
    </div>
  );
}