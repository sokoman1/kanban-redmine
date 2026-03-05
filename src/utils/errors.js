export function normalizeError(error) {
  if (!error) {
    return 'Unknown error'
  }

  if (error.response) {
    const status = error.response.status
    const data = error.response.data

    switch (status) {
      case 401:
        return 'Invalid API key or access denied'
      case 403:
        return 'Insufficient permissions for this operation'
      case 404:
        return 'Resource not found'
      case 422:
        if (data && data.errors) {
          return formatRedmineErrors(data.errors)
        }
        return 'Invalid data'
      case 500:
      case 502:
      case 503:
        return 'Redmine server error. Try again later'
      default:
        if (data && data.errors) {
          return formatRedmineErrors(data.errors)
        }
        return `HTTP error ${status}`
    }
  }

  if (error.request) {
    return 'Could not reach Redmine server. Check URL and network'
  }

  if (error.message) {
    if (error.message.includes('Unexpected token') && error.message.includes('is not valid JSON')) {
      return 'Server returned HTML instead of JSON. Check Redmine URL — wrong address or port, or this may be the Kanban app instead of Redmine.'
    }
    return error.message
  }

  return 'Unknown error'
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

  const emptyObjectHint = 'Object cannot be empty'
  const emptyObjectHintRu = 'Объект не может быть пустым'
  const cannotBeEmptyHint = 'cannot be empty'
  if (
    message?.includes(emptyObjectHint) ||
    message?.includes(emptyObjectHintRu) ||
    message?.toLowerCase().includes(cannotBeEmptyHint)
  ) {
    return `${message} Check project settings: there may be required custom fields.`
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
