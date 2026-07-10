/**
 * Проверяет, является ли строка корректным URL-адресом с протоколом http/https.
 * @param {string} url 
 * @returns {boolean}
 */
export const isValidUrl = (url) => {
  if (!url) return false;
  try {
    const parsedUrl = new URL(url.trim());
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

/**
 * Валидирует форму сокращения ссылки.
 * Возвращает КЛЮЧИ переводов для мультиязычности.
 * * @param {string} longUrl - Длинная оригинальная ссылка
 * @param {string} customSlug - Желаемое окончание ссылки
 * @param {string} userPlan - Текущий тариф пользователя ('free' или 'pro')
 * @returns {Object} { isValid: boolean, errors: { longUrl: string, customSlug: string } }
 */
export const validateLinkForm = (longUrl, customSlug, userPlan) => {
  const errors = { longUrl: '', customSlug: '' };
  let isValid = true;

  // 1. Валидация длинной ссылки
  if (!longUrl || !longUrl.trim()) {
    errors.longUrl = 'errors.urlRequired'; 
    isValid = false;
  } else if (!isValidUrl(longUrl)) {
    errors.longUrl = 'errors.urlInvalid'; 
    isValid = false;
  }

  // 2. Валидация кастомного окончания (только для PRO)
  if (userPlan !== 'free' && customSlug && customSlug.trim()) {
    const trimmedSlug = customSlug.trim();
    const slugRegex = /^[a-zA-Z0-9-_]+$/;

    if (!slugRegex.test(trimmedSlug)) {
      errors.customSlug = 'errors.slugInvalidChars'; 
      isValid = false;
    } else if (trimmedSlug.length < 3) {
      errors.customSlug = 'errors.slugTooShort'; 
      isValid = false;
    }
  }

  return { isValid, errors };
};