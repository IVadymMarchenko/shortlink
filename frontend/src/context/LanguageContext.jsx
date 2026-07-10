import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  uk: {
    errors: {
      slugTooShort: "Закінчення посилання має бути не коротшим за 3 символи!", // <-- ДОДАЛИ ЦЕЙ РЯДОК
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
      features: {
        f1: "До 50 коротких посилань на місяць",
        f2: "Базова статистика (тільки кліки)",
        f3: "Стандартний домен cleanlink.com",
        f4: "Кастомні домени",
        f5: "Детальна аналітика по країнах",
        f6: "Безлімітне створення посилань",
        f7: "Детальна статистика та графіки",
        f8: "1 кастомний домен",
        f9: "API інтеграція (Django)",
        f10: "Підтримка 24/7",
        f11: "Усе з тарифу Про",
        f12: "Безлімітні кастомні домени",
        f13: "Повний експорт даних (CSV/JSON)",
        f14: "Командний доступ (до 5 слотів)",
        f15: "SLA та пріоритетна підтримка"
      }
    }
  },
  en: {
    errors: {
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
      features: {
        f1: "Up to 50 short links per month",
        f2: "Basic statistics (clicks only)",
        f3: "Standard domain cleanlink.com",
        f4: "Custom domains",
        f5: "Detailed analytics by country",
        f6: "Unlimited link creation",
        f7: "Detailed statistics and charts",
        f8: "1 custom domain",
        f9: "API integration (Django)",
        f10: "24/7 Support",
        f11: "Everything from Pro plan",
        f12: "Unlimited custom domains",
        f13: "Full data export (CSV/JSON)",
        f14: "Team access (漏 up to 5 slots)",
        f15: "SLA and priority support"
      }
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