import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(100, 'El título no puede exceder 100 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').max(1000, 'La descripción no puede exceder 1000 caracteres'),
  date: z.string().refine((date) => new Date(date) > new Date(), 'La fecha debe ser futura'),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido'),
  location: z.string().min(5, 'La ubicación debe tener al menos 5 caracteres'),
  category: z.enum(['music', 'sports', 'technology', 'food', 'art', 'business', 'education', 'other']),
  capacity: z.number().min(1, 'La capacidad debe ser al menos 1').max(10000, 'La capacidad no puede exceder 10,000'),
  price: z.number().min(0, 'El precio no puede ser negativo'),
  image_url: z.string().url('URL de imagen inválida').optional(),
});

export const updateEventSchema = createEventSchema.partial();

export const eventFilterSchema = z.object({
  category: z.string().optional(),
  location: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  price_max: z.number().optional(),
  search: z.string().optional(),
});