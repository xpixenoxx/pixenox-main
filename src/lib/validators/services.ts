import * as z from 'zod'

export const servicesCardSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  title_color: z.string().optional(),
  subheading: z.string().optional().or(z.literal('')),
  subheading_color: z.string().optional(),
  description: z.string().optional().or(z.literal('')),
  desc_color: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  page_slug: z.string().min(1, 'Page slug is required'),
  is_visible: z.boolean().optional().default(true),
})

export const servicesLayoutSchema = z.object({
  layout_type: z.enum(['horizontal', 'vertical']).optional(),
  cards_per_row: z.number().int().min(1).max(10).optional(),
})
