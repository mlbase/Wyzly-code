import { NextApiResponse } from 'next';
import { AuthenticatedRequest, ApiHandler } from './auth';

export const withErrorHandler = (handler: ApiHandler) => {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error('API Error:', error);

      if (error instanceof Error) {
        // Handle specific error types
        if (error.message.includes('duplicate key')) {
          return res.status(409).json({
            success: false,
            error: 'Conflict',
            message: 'Resource already exists'
          });
        }

        if (error.message.includes('not found')) {
          return res.status(404).json({
            success: false,
            error: 'Not found',
            message: 'Resource not found'
          });
        }
      }

      // Generic server error
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' 
          ? error instanceof Error ? error.message : 'Unknown error'
          : 'Something went wrong'
      });
    }
  };
};