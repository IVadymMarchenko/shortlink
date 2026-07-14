import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  uk: {
    errors: {
      requiredField: "Це поле є обов'язковим.",
      invalidEmail: "Введіть коректну адресу електронної пошти.",
      passwordTooShort: "Пароль занадто короткий.",
      userNotFound: "Неправильний email або пароль.",
      emailAlreadyExists: "Користувач з таким email вже зареєстрований.",
      googleAuthError: "Помилка авторизації через Google. Спробуйте пізніше.",
      googleCancelError: "Не вдалося увійти через акаунт Google.",
      fallbackError: "Щось пішло не так. Спробуйте пізніше.",
      slugTooShort: "Закінчення посилання має бути не коротшим за 3 символи!",
      "urlRequired": "Це поле є обов'язковим для заповнення",
      "urlInvalid": "Введіть коректну URL-адресу (наприклад, https://example.com)",
      slugInvalidChars: 'Дозволені лише латинські літери (A-Z), цифри, \"-\" та \"_\"',
      paymentSuccess: "Оплата успішна! Тариф оновлено.",
      paymentError: "Помилка при проведенні оплати",
      deleteConfirm: "Ви впевнені, що хочете видалити це посилання та всю його статистику?",
      deleteError: "Не вдалося видалити посилання",
      serverError: "Помилка з'єднання з сервером",
      slugInvalidChars: "Дозволені лише латинські літери (A-Z), цифри, \"-\" та \"_\"",
      slugAlreadyTaken: "Ця назва вже зайнята",
      invalidUrlFormat: "Некоректний формат URL",
      limitReached: "Перевищено ліміт посилань вашого тарифу"
    },
    auth: {
      tabLogin: "Вхід",
      loadingText: "Завантаження...",
      tabRegister: "Реєстрація",
      titleLogin: "Раді поверненню",
      titleRegister: "Створити акаунт",
      subtitleLogin: "Увійдіть до особистого кабінету",
      subtitleRegister: "Зареєструйтесь для роботи з посиланнями",
      labelName: "Ім'я",
      placeholderName: "Вадим",
      labelEmail: "Email",
      labelPassword: "Пароль",
      placeholderPassword: "Мінімум 6 символів",
      btnLogin: "Увійти",
      btnRegister: "Зареєструватися",
      or: "або",
      btnGoogle: "Увійти через Google",
      enterEmail: "Введіть email",
      invalidEmail: "Некоректний формат email",
      enterPassword: "Введіть пароль",
      enterName: "Введіть ваше ім'я",
      shortName: "Ім'я має бути не коротшим за 2 символи",
      shortPassword: "Пароль має бути не меншим за 6 символів"
    },
    dashboard: {
      "graphsLockedTitle": "Детальна аналітика заблокована",
      "graphsLockedDesc": "Перейдіть на PRO тариф, щоб бачити графіки, географію кліків та пристрої вашої аудиторії.",
      "btnUpgrade": "Оновити тариф 🚀",
      statsTitle: "Статистика посилання",
      totalClicks: "Всього переходів",
      uniqueClicks: "Унікальні кліки",
      topLocation: "Топ локація",
      weeklyDynamics: "Динаміка кліків за тиждень",
      topCountries: "Топ країн",
      devices: "Пристрої",
      loadingAnalytics: "Завантаження аналітики...",
      noData: "Немає даних",
      clicks: "Кліки",
      pc: "ПК / Ноутбуки",
      mobile: "Смартфони",
      local: "Локальні / Невідомо",
      planPro: "👑 PRO",
      planFree: "⚡ FREE",
      createdLabel: "Створено",
      deleteLabel: "Видалити",
      welcome: "Привіт",
      title: "Скоротити нове посилання",
      longUrlLabel: "Ваше довге посилання (наприклад, з Розетки):",
      customSlugLabel: "Власне закінчення посилання (необов'язково):",
      proBadge: "ПІДПИСКА PRO",
      placeholderLong: "https://rozetka.com.ua/...",
      placeholderSlugFree: "Доступно тільки на тарифному плані PRO",
      placeholderSlugPro: "наприклад: rozetka-sale",
      btnCreate: "Створити посилання",
      myLinks: "Мої посилання",
      searchPlaceholder: "Пошук посилання...",
      sortNewest: "Спочатку нові",
      sortClicks: "За кліками (популярні)",
      clicksLabel: "кліків",
      showMore: "Показати ще",
      notFound: "Посилання не знайдені",
      readyLabel: "Готово! Ваше коротке посилання:",
      downloadPng: "Скачати PNG"
    },

    // ДОБАВИЛИ ТАРИФЫ
    pricing: {
      active: "Поточний план",
      purchaseBtn: "Обрати тариф",
      included: "Включено",
      mainTitle: "Тарифні плани",
      popularBadge: "Популярний",
      perMonth: "/міс",
      alertSuccess: "Успішний перехід на тариф",
      alertCharged: "Списано",
      modal: {
        title: "Підключення тарифу",
        redirectText: "Ви переходите на тариф",
        notice: "Після підтвердження ви будете перенаправлені на шлюз оплати. На бекенді Django ми підключимо Stripe/WayForPay, а поки імітуємо платіж.",
        btnPay: "Оплатити"
      },
      plans: {
        base: {
          title: "Базовий",
          desc: "Для особистого використання та старту",
          btn: "Поточний тариф"
        },
        pro: {
          title: "Професійний",
          desc: "Для блогерів та проєктів, що ростуть",
          btn: "Перейти на Про"
        },
        business: {
          title: "Бізнес",
          desc: "Для команд, брендів та великих навантажень",
          btn: "Купити Бізнес"
        }
      },
    }
  },
  en: {
    errors: {
      requiredField: "This field is required.",
      invalidEmail: "Enter a valid email address.",
      passwordTooShort: "Password is too short.",
      userNotFound: "Incorrect email or password.",
      emailAlreadyExists: "A user with this email already exists.",
      googleAuthError: "Google authentication failed. Please try again later.",
      googleCancelError: "Failed to sign in with Google account.",
      fallbackError: "Something went wrong. Please try again later.",
      slugTooShort: "Custom slug must be at least 3 characters long",
      "urlRequired": "This field is required",
      "urlInvalid": "Please enter a valid URL (e.g., https://example.com)",
      slugInvalidChars: 'Only Latin letters (A-Z), numbers, \"-\" and \"_\" are allowed',
      paymentSuccess: "Payment successful! Plan updated.",
      paymentError: "Payment processing error",
      deleteConfirm: "Are you sure you want to delete this link and all its statistics?",
      deleteError: "Failed to delete link",
      serverError: "Server connection error",
      slugInvalidChars: "Only Latin letters (A-Z), numbers, \"-\" and \"_\" are allowed",
      slugAlreadyTaken: "This slug is already taken",
      invalidUrlFormat: "Invalid URL format",
      limitReached: "Plan link limit reached"
    },
    auth: {
      tabLogin: "Sign In",
      loadingText: "Loading...",
      tabRegister: "Sign Up",
      titleLogin: "Welcome Back",
      titleRegister: "Create Account",
      subtitleLogin: "Log in to your personal dashboard",
      subtitleRegister: "Register to start managing your links",
      labelName: "Name",
      placeholderName: "Vadym",
      labelEmail: "Email",
      labelPassword: "Password",
      placeholderPassword: "Minimum 6 characters",
      btnLogin: "Sign In",
      btnRegister: "Sign Up",
      or: "or",
      btnGoogle: "Sign In with Google",
      enterEmail: "Email is required",
      invalidEmail: "Invalid email format",
      enterPassword: "Password is required",
      enterName: "Name is required",
      shortName: "Name must be at least 2 characters",
      shortPassword: "Password must be at least 6 characters"
    },
    dashboard: {
      "graphsLockedTitle": "Detailed Analytics Locked",
      "graphsLockedDesc": "Upgrade to PRO to view charts, click geography, and audience devices.",
      "btnUpgrade": "Upgrade Plan 🚀",
      statsTitle: "Link Statistics",
      totalClicks: "Total Clicks",
      uniqueClicks: "Unique Clicks",
      topLocation: "Top Location",
      weeklyDynamics: "Click Dynamics for the Week",
      topCountries: "Top Countries",
      devices: "Devices",
      loadingAnalytics: "Loading analytics...",
      noData: "No data",
      clicks: "Clicks",
      pc: "PC / Laptops",
      mobile: "Smartphones",
      local: "Local / Unknown",
      planPro: "👑 PRO",
      planFree: "⚡ FREE",
      createdLabel: "Created",
      deleteLabel: "Delete",
      welcome: "Hello",
      title: "Shorten a new link",
      longUrlLabel: "Your long link (e.g., from Amazon):",
      customSlugLabel: "Custom link ending (optional):",
      proBadge: "PRO SUBSCRIPTION",
      placeholderLong: "https://amazon.com/...",
      placeholderSlugFree: "Available only on PRO plan",
      placeholderSlugPro: "e.g., amazon-sale",
      btnCreate: "Create link",
      myLinks: "My links",
      searchPlaceholder: "Search links...",
      sortNewest: "Newest first",
      sortClicks: "By clicks (popular)",
      clicksLabel: "clicks",
      showMore: "Show more",
      notFound: "No links found",
      readyLabel: "Ready! Your short link:",
      downloadPng: "Download PNG"
    },
    // ТАРИФЫ НА АНГЛИЙСКОМ
    pricing: {
      active: "Current Plan",
      purchaseBtn: "Select Plan",
      included: "Included",
      mainTitle: "Pricing Plans",
      popularBadge: "Popular",
      perMonth: "/mo",
      alertSuccess: "Successfully upgraded to",
      alertCharged: "Charged",
      modal: {
        title: "Plan Activation",
        redirectText: "You are switching to",
        notice: "After confirmation, you will be redirected to the payment gateway. On the Django backend, we will integrate Stripe/WayForPay, but for now, we simulate the payment.",
        btnPay: "Pay"
      },
      plans: {
        base: {
          title: "Base Plan",
          desc: "For personal use and getting started",
          btn: "Current Plan"
        },
        pro: {
          title: "Professional",
          desc: "For bloggers and growing projects",
          btn: "Upgrade to Pro"
        },
        business: {
          title: "Business",
          desc: "For teams, brands, and high traffic",
          btn: "Buy Business"
        }
      },
    }
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('cleanlink_lang') || 'uk';
  });

  useEffect(() => {
    localStorage.setItem('cleanlink_lang', lang);
  }, [lang]);

  const t = (path) => {
    const keys = path.split('.');
    let result = translations[lang];

    for (const key of keys) {
      if (result && result[key] !== undefined) {
        result = result[key];
      } else {
        return path;
      }
    }
    return result;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);