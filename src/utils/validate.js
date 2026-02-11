import { z } from 'zod'

export const authSettingsSchema = z.object({
  baseUrl: z.string()
    .url('Некорректный URL')
    .refine(url => !url.endsWith('/'), 'URL не должен заканчиваться на /'),
  apiKey: z.string()
    .min(10, 'API key должен содержать минимум 10 символов')
})

export const createIssueSchema = z.object({
  subject: z.string()
    .min(1, 'Тема обязательна')
    .max(255, 'Тема не может быть длиннее 255 символов'),
  description: z.string().optional(),
  trackerId: z.number().int().positive().optional()
})

export function validateAuthSettings(data) {
  try {
    return {
      success: true,
      data: authSettingsSchema.parse(data)
    }
  } catch (error) {
    return {
      success: false,
      errors: error.errors.reduce((acc, err) => {
        acc[err.path[0]] = err.message
        return acc
      }, {})
    }
  }
}

export function validateCreateIssue(data) {
  try {
    return {
      success: true,
      data: createIssueSchema.parse(data)
    }
  } catch (error) {
    return {
      success: false,
      errors: error.errors.reduce((acc, err) => {
        acc[err.path[0]] = err.message
        return acc
      }, {})
    }
  }
}
