import { NextApiResponse } from 'next';
import { z, ZodSchema } from 'zod';
import { AuthenticatedRequestWithUser, ApiHandler } from './auth';

export const withValidation = (schema: {
  body?: ZodSchema;
  query?: ZodSchema;
}) => {
  return (handler: ApiHandler) => {
    return async (req: AuthenticatedRequestWithUser, res: NextApiResponse) => {
      try {
        // Validate request body
        if (schema.body) {
          const result = schema.body.safeParse(req.body);
          if (!result.success) {
            return res.status(400).json({
              success: false,
              error: 'Validation failed',
              details: result.error.flatten().fieldErrors
            });
          }
          req.body = result.data;
        }

        // Validate query parameters
        if (schema.query) {
          const result = schema.query.safeParse(req.query);
          if (!result.success) {
            return res.status(400).json({
              success: false,
              error: 'Invalid query parameters',
              details: result.error.flatten().fieldErrors
            });
          }
          req.query = result.data as any;
        }

        return handler(req, res);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: error instanceof Error ? error.message : 'Unknown validation error'
        });
      }
    };
  };
};