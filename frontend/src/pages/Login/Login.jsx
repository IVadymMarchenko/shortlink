import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import styles from './Login.module.css';
import Input from '../../ui/Input/Input';
import { validateLoginForm, validateRegisterForm } from './login_validation';
import { useLang } from '../../context/LanguageContext';
import api from '../../api';

export default function Login({ onLoginSuccess }) { 
  const { t } = useLang();
  
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false); 

  const handleTabChange = (isLogin) => {
    setIsLoginTab(isLogin);
    setEmail('');
    setPassword('');
    setName('');
    setErrors({});
    setIsError(false);
  };

  // Хелпер для локализации системных ключей или вывода текста от бэкенда «как есть»
  const formatError = (errorKey) => {
    if (!errorKey) return '';
    return errorKey.includes(' ') ? errorKey : t(errorKey);
  };

  // === GOOGLE АВТОРИЗАЦИЯ ===
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setErrors({});
      try {
        await api.post('/auth/google/', { 
          access_token: tokenResponse.access_token 
        });

        setTimeout(() => {
          onLoginSuccess();
        }, 100);
      } catch (err) {
        triggerShake();
        setErrors({ global: 'errors.googleAuthError' });
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      triggerShake();
      setErrors({ global: 'errors.googleCancelError' });
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    // 1. Валидация на фронтенде
    let result = isLoginTab 
      ? validateLoginForm(email, password) 
      : validateRegisterForm(name, email, password);

    if (!result.isValid) {
      setErrors(result.errors);
      triggerShake();
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      // 2. Динамически определяем эндпоинт и тело запроса
      const endpoint = isLoginTab ? '/login/' : '/register/';
      const payload = isLoginTab ? { email, password } : { name, email, password };

      // 3. Отправляем ОДИН запрос вместо старого паровозика
      await api.post(endpoint, payload);
      
      setTimeout(() => {
        onLoginSuccess();
      }, 100);

    } catch (err) {
      triggerShake();
      
      if (err.response?.data) {
        const data = err.response.data;
        if (data.detail) {
          setErrors({ global: data.detail });
        } else {
          const fieldErrors = {};
          Object.keys(data).forEach(key => {
            fieldErrors[key] = Array.isArray(data[key]) ? data[key][0] : data[key];
          });
          setErrors(fieldErrors);
        }
      } else {
        setErrors({ global: 'errors.fallbackError' });
      }
    } finally {
      setLoading(false);
    }
  };

  const triggerShake = () => {
    setIsError(true);
    setTimeout(() => setIsError(false), 500);
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.card} ${isError ? styles.shake : ''}`}>
        
        {/* ВКЛАДКИ */}
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${isLoginTab ? styles.activeTab : ''}`}
            onClick={() => handleTabChange(true)}
            disabled={loading}
          >
            {t('auth.tabLogin')}
          </button>
          <button 
            className={`${styles.tab} ${!isLoginTab ? styles.activeTab : ''}`}
            onClick={() => handleTabChange(false)}
            disabled={loading}
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

        {/* ГЛОБАЛЬНАЯ ОШИБКА ОТ СЕРВЕРА */}
        {errors.global && (
          <div className={styles.globalError}>
            {formatError(errors.global)}
          </div>
        )}

        {/* ФОРМА */}
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          
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
              error={formatError(errors.name)}
              disabled={loading}
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
            error={formatError(errors.email)}
            disabled={loading}
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
            error={formatError(errors.password)}
            disabled={loading}
          />

          <button type="submit" className={styles.btnSubmit} disabled={loading}>
            {loading ? t('auth.loadingText') : (isLoginTab ? t('auth.btnLogin') : t('auth.btnRegister'))}
          </button>
        </form>

        <div className={styles.divider}>
          <span>{t('auth.or')}</span>
        </div>

        <button className={styles.btnGoogle} onClick={() => loginWithGoogle()} disabled={loading}>
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