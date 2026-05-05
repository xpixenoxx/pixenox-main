import * as z from 'zod'

export const themeSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  value: z.string().min(1, 'Value is required'),
})

export const brandSchema = z.object({
  logo_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  company_name: z.string().min(1, 'Company Name is required'),
  company_name_color: z.string().optional(),
  favicon_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})
