// src/utils/getErrorMessage.ts

/**
 * Извлекает человекочитаемое сообщение из пойманной ошибки.
 *
 * Заменяет повторявшийся по всему проекту приём `catch (err: any) { ... err.message || 'Запасной текст' }`,
 * который вынуждал типизировать ошибку как `any`. Поведение сохранено один-в-один:
 * берётся свойство `message`, если это непустая строка, иначе — запасной текст.
 */
export const getErrorMessage = (err: unknown, fallback: string): string => {
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const { message } = err as { message?: unknown };
    if (typeof message === 'string' && message !== '') {
      return message;
    }
  }
  return fallback;
};