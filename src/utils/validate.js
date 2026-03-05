import { z } from 'zod'

export const authSettingsSchema = z.object({
  baseUrl: z.string()
    .url('Invalid URL')
    .refine(url => !url.endsWith('/'), 'URL must not end with /'),
  apiKey: z.string()
    .min(10, 'API key must be at least 10 characters')
})

export const createIssueSchema = z.object({
  subject: z.string()
    .min(1, 'Subject is required')
    .max(255, 'Subject cannot exceed 255 characters'),
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
