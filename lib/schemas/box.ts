import { z } from 'zod';

export const createBoxSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  price: z.number().min(0, 'Price must be positive'),
  quantity: z.number().int().min(0, 'Quantity must be non-negative'),
  image: z.string().url().optional(),
  restaurant_id: z.number().int().positive(),
  is_available: z.boolean().optional()
});

export const updateBoxSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  price: z.number().min(0).optional(),
  image: z.string().url().optional(),
  is_available: z.boolean().optional()
});

export const boxQuerySchema = z.object({
  restaurant_id: z.string().transform(Number).optional(),
  available: z.enum(['true', 'false']).optional(),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional()
});