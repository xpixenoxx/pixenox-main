import * as z from 'zod'

export const themeUpdateSchema = z.record(z.string(), z.string())
