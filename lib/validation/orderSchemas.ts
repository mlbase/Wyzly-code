import { z } from 'zod';

export const createOrderSchema = z.object({
  boxId: z.number().int().positive('Box ID must be a positive integer'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  paymentMethod: z.enum(['mock', 'credit_card', 'debit_card', 'paypal', 'cash']).optional().default('mock')
});

export type CreateOrderRequest = z.infer<typeof createOrderSchema>;