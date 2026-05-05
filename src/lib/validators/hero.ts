import * as z from 'zod'

export const heroSchema = z.object({
  headline: z.string().min(1, 'Headline is required'),
  headline_color: z.string().optional(),
  subheadline: z.string().optional().or(z.literal('')),
  subheadline_color: z.string().optional(),
  cta_text: z.string().optional().or(z.literal('')),
  cta_url: z.string().optional().or(z.literal('')),
  cta_bg_color: z.string().optional(),
  cta_hover_bg_color: z.string().optional(),
  cta_text_color: z.string().optional(),
  cta_border_radius: z.string().optional(),
  bg_type: z.enum(['gradient', 'image', 'video']).optional(),
  bg_gradient_start: z.string().optional(),
  bg_gradient_end: z.string().optional(),
  bg_image_url: z.string().url().optional().or(z.literal('')),
  bg_video_url: z.string().url().optional().or(z.literal('')),
})
