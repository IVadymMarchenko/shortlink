import React, { useState } from 'react';
import styles from './Login.module.css';
import Input from '../../ui/Input/Input';
import { validateLoginForm, validateRegisterForm } from './login_validation';
import { useLang } from '../../context/LanguageContext';
import api from '../../api'; // Импортируем наш настроенный axios

export default function Login({ onLoginSuccess }) { // Изменили проп на onLoginSuccess
  const { t } = useLang();
  
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false); // Стейт блокировки кнопки во время запроса

  const handleTabChange = (isLogin) => {
    setIsLoginTab(isLogin);
    setEmail('');
    setPassword('');
    setName('');
    setErrors({});
    setIsError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    let result;

    if (isLoginTab) {
      result = validateLoginForm(email, password);
    } else {
      result = validateRegisterForm(name, email, password);
    }

    if (!result.isValid) {
      setErrors(result.errors);
      triggerShake();
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      if (isLoginTab) {
        // === ВХОД ===
        // Джанго вернет httpOnly куку с JWT-токеном
        await api.post('/login/', { email, password });
      } else {
        // === РЕГИСТРАЦИЯ ===
        // Сначала регистрируем через твой RegistrView
        await api.post('/register/', { name, email, password });
        // После успешной регистрации сразу логиним пользователя, чтобы он не вводил пароль дважды
        await api.post('/login/', { email, password });
      }
      // Даем браузеру 100мс на сохранение куки в память, прежде чем запрашивать инфо
       setTimeout(() => {
       onLoginSuccess();
       }, 100);
      
      // Вызываем коллбэк, который запросит данные профиля и переключит на Дашборд
      onLoginSuccess();

    } catch (err) {
      triggerShake();
      
      // Обрабатываем ошибки от бэкенда Django
      if (err.response && err.response.data) {
        const data = err.response.data;
        
        if (data.detail) {
          // Если пришла общая ошибка (например, "Неверный пароль")
          setErrors({ global: data.detail });
        } else {
          // Если пришла точечная ошибка по полям (например, {"email": ["User with this email already exists."]})
          const fieldErrors = {};
          Object.keys(data).forEach(key => {
            fieldErrors[key] = Array.isArray(data[key]) ? data[key][0] : data[key];
          });
          setErrors(fieldErrors);
        }
      } else {
        setErrors({ global: 'Что-то пошло не так. Попробуйте позже.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Вынесли тряску в отдельную вспомогательную функцию
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
          <div style={{ color: '#ef4444', textAlign: 'center', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: '500' }}>
            {errors.global}
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
              error={errors.name ? (t(errors.name) || errors.name) : ''}
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
            error={errors.email ? (t(errors.email) || errors.email) : ''}
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
            error={errors.password ? (t(errors.password) || errors.password) : ''}
            disabled={loading}
          />

          <button type="submit" className={styles.btnSubmit} disabled={loading}>
            {loading ? '...' : (isLoginTab ? t('auth.btnLogin') : t('auth.btnRegister'))}
          </button>
        </form>

        <div className={styles.divider}>
          <span>{t('auth.or')}</span>
        </div>

        <button className={styles.btnGoogle} onClick={() => onLoginSuccess()} disabled={loading}>
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