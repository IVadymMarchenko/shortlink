
import api from "./api";


const ENDPOINTS = {
  GET_LINKS: '/links/links/',
  CREATE_LINK: '/links/create/',
  DELETE_LINK: (id) => `/links/${id}/delete/`,
  FAKE_PAYMENT: '/pay/fake-payment/',
};

// 2. Создаем сервис с методами. Хуки будут вызывать методы, а не ковырять URL.
export const linksService = {
  /**
   * Получить все ссылки пользователя
   */
  async getAllLinks() {
    const response = await api.get(ENDPOINTS.GET_LINKS);
    return response.data;
  },

  /**
   * Создать новую короткую ссылку
   * @param {string} originalUrl 
   * @param {string} [shortCode] - необязательный кастомный хвост
   */
  async createLink(originalUrl, shortCode) {
    try {
      const response = await api.post('/links/create/', {
        original_url: originalUrl,
        short_code: shortCode || undefined
      });
      return response.data;
    } catch (err) {
      // Создаем структурированный объект ошибки для хука
      const apiError = { longUrl: '', customSlug: '' };

      if (err.response) {
        const statusCode = err.response.status;
        const errorData = err.response.data;

        if (statusCode === 403) {
          apiError.longUrl = errorData.detail || 'errors.limitReached';
        } else if (statusCode === 400) {
          if (errorData.short_code) {
            const serverError = Array.isArray(errorData.short_code) ? errorData.short_code[0] : errorData.short_code;
            apiError.customSlug = serverError === "slug_already_taken" ? 'errors.slugAlreadyTaken' : serverError;
          }
          if (errorData.original_url) {
            apiError.longUrl = 'errors.invalidUrlFormat';
          }
        }
      } else {
        apiError.longUrl = 'errors.serverError';
      }

      // Пробрасываем обработанный объект ошибок дальше в хук
      throw apiError;
    }
  },

  /**
   * Удалить ссылку по её ID
   * @param {number|string} linkId 
   */
  async deleteLink(linkId) {
    const response = await api.delete(ENDPOINTS.DELETE_LINK(linkId));
    return response.data;
  },

  /**
   * Имитация покупки тарифного плана
   * @param {string} planSlug 
   */
  async purchasePlan(planSlug) {
    const response = await api.post(ENDPOINTS.FAKE_PAYMENT, { 
      plan_slug: planSlug 
    });
    return response.data;
  }
};