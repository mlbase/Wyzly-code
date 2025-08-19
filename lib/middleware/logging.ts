import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from './auth';

// Generic handler type that works with any request type
type GenericHandler = (req: any, res: NextApiResponse) => Promise<void> | void;

export const withLogging = (handler: GenericHandler) => {
  return async (req: NextApiRequest | AuthenticatedRequest, res: NextApiResponse) => {
    const start = Date.now();
    const { method, url } = req;
    
    // Safely check for user info
    const userInfo = (req as AuthenticatedRequest).user 
      ? `User: ${(req as AuthenticatedRequest).user!.id}(${(req as AuthenticatedRequest).user!.role})`
      : 'Anonymous';

    console.log(`[${new Date().toISOString()}] ${method} ${url} - ${userInfo}`);

    try {
      await handler(req, res);
      const duration = Date.now() - start;
      console.log(`[${new Date().toISOString()}] ${method} ${url} - ${res.statusCode} - ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - start;
      console.error(`[${new Date().toISOString()}] ${method} ${url} - ERROR - ${duration}ms:`, error);
      throw error;
    }
  };
};