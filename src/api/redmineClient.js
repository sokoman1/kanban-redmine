import { RedmineError, normalizeError } from '../utils/errors'

const REQUEST_TIMEOUT = 30000

function normalizeUrl(url) {
  return url?.replace(/\/$/, '') || ''
}

function getEffectiveBaseUrl(baseUrl) {
  const proxyTarget = import.meta.env.VITE_REDMINE_PROXY_TARGET
  if (!import.meta.env.DEV || !proxyTarget) {
    return baseUrl
  }
  if (normalizeUrl(baseUrl) === normalizeUrl(proxyTarget)) {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    return `${origin}/redmine-api`
  }
  return baseUrl
}

export function createRedmineClient(baseUrl, apiKey) {
  if (!baseUrl || !apiKey) {
    throw new RedmineError('Не указаны baseUrl или apiKey')
  }

  const effectiveBaseUrl = getEffectiveBaseUrl(baseUrl)
  const base = effectiveBaseUrl.replace(/\/$/, '')

  async function request(endpoint, options = {}) {
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    const url = `${base}${path}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'X-Redmine-API-Key': apiKey,
          'Content-Type': 'application/json',
          ...options.headers
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      const contentType = response.headers.get('content-type') || ''
      const isJson = contentType.includes('application/json')

      if (!response.ok) {
        const errorData = isJson ? await response.json().catch(() => ({})) : {}
        throw {
          response: {
            status: response.status,
            data: errorData
          }
        }
      }

      if (response.status === 204) {
        return null
      }

      if (!isJson) {
        const text = await response.text()
        if (text.trim().startsWith('<')) {
          throw new RedmineError(
            'Сервер вернул HTML вместо JSON. Проверьте URL Redmine — возможно, указан неверный адрес или порт. Убедитесь, что это сервер Redmine, а не приложение Kanban.'
          )
        }
        throw new RedmineError('Сервер вернул неожиданный формат ответа')
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)

      if (error.name === 'AbortError') {
        throw new RedmineError('Превышено время ожидания запроса')
      }

      const message = normalizeError(error)
      throw new RedmineError(message, error)
    }
  }

  return {
    get: (endpoint) => request(endpoint, { method: 'GET' }),
    post: (endpoint, data) => request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    patch: (endpoint, data) => request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
    put: (endpoint, data) => request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (endpoint) => request(endpoint, { method: 'DELETE' })
  }
}
