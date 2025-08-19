import { NextApiResponse } from 'next';
import { AuthenticatedRequest, ApiHandler } from './auth';

export const withMethods = (allowedMethods: string[]) => {
  return (handler: ApiHandler) => {
    return async (req: AuthenticatedRequest, res: NextApiResponse) => {
      if (!req.method || !allowedMethods.includes(req.method)) {
        res.setHeader('Allow', allowedMethods.join(', '));
        return res.status(405).json({
          success: false,
          error: 'Method not allowed',
          message: `Method ${req.method} not allowed. Allowed methods: ${allowedMethods.join(', ')}`
        });
      }

      return handler(req, res);
    };
  };
};