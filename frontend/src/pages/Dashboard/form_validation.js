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
 * @param {string} longUrl - Длинная оригинальная ссылка
 * @param {string} customSlug - Желаемое окончание ссылки
 * @param {string} userPlan - Текущий тариф пользователя ('free' или 'pro')
 * @returns {Object} { isValid: boolean, errors: { longUrl: string, customSlug: string } }
 */
export const validateLinkForm = (longUrl, customSlug, userPlan) => {
  const errors = { longUrl: '', customSlug: '' };
  let isValid = true;

  // 1. Валидация длинной ссылки
  if (!longUrl || !longUrl.trim()) {
    errors.longUrl = 'Это поле обязательно для заполнения';
    isValid = false;
  } else if (!isValidUrl(longUrl)) {
    errors.longUrl = 'Введите корректный URL-адрес (например, https://example.com)';
    isValid = false;
  }

  // 2. Валидация кастомного окончания (только для PRO)
  if (userPlan !== 'free' && customSlug && customSlug.trim()) {
    const trimmedSlug = customSlug.trim();
    // Разрешаем только латиницу, цифры, дефис и нижнее подчеркивание
    const slugRegex = /^[a-zA-Z0-9-_]+$/;

    if (!slugRegex.test(trimmedSlug)) {
      errors.customSlug = 'Разрешены только латинские буквы, цифры, дефисы и "_"';
      isValid = false;
    } else if (trimmedSlug.length < 3) {
      errors.customSlug = 'Окончание должно быть не короче 3 символов';
      isValid = false;
    }
  }

  return { isValid, errors };
};