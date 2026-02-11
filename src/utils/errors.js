export function normalizeError(error) {
  if (!error) {
    return 'Неизвестная ошибка'
  }

  if (error.response) {
    const status = error.response.status
    const data = error.response.data

    switch (status) {
      case 401:
        return 'Неверный API key или доступ запрещен'
      case 403:
        return 'Недостаточно прав для выполнения операции'
      case 404:
        return 'Ресурс не найден'
      case 422:
        if (data && data.errors) {
          return formatRedmineErrors(data.errors)
        }
        return 'Некорректные данные'
      case 500:
      case 502:
      case 503:
        return 'Ошибка сервера Redmine. Попробуйте позже'
      default:
        if (data && data.errors) {
          return formatRedmineErrors(data.errors)
        }
        return `Ошибка HTTP ${status}`
    }
  }

  if (error.request) {
    return 'Не удалось связаться с сервером Redmine. Проверьте URL и сеть'
  }

  if (error.message) {
    if (error.message.includes('Unexpected token') && error.message.includes('is not valid JSON')) {
      return 'Сервер вернул HTML вместо JSON. Проверьте URL Redmine — возможно, указан неверный адрес или порт. Убедитесь, что это сервер Redmine, а не приложение Kanban.'
    }
    return error.message
  }

  return 'Неизвестная ошибка'
}

function formatRedmineErrors(errors) {
  let message
  if (Array.isArray(errors)) {
    message = errors.join('; ')
  } else if (typeof errors === 'object') {
    message = Object.entries(errors)
      .map(([field, messages]) => {
        const messageStr = Array.isArray(messages) ? messages.join(', ') : messages
        return `${field}: ${messageStr}`
      })
      .join('; ')
  } else {
    message = String(errors)
  }

  const emptyObjectHint = 'Объект не может быть пустым'
  const cannotBeEmptyHint = 'cannot be empty'
  if (
    message?.includes(emptyObjectHint) ||
    message?.toLowerCase().includes(cannotBeEmptyHint)
  ) {
    return `${message} Проверьте настройки проекта: возможно, есть обязательные пользовательские поля.`
  }

  return message
}

export class RedmineError extends Error {
  constructor(message, originalError = null) {
    super(message)
    this.name = 'RedmineError'
    this.originalError = originalError
  }
}
