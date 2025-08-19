import { NextApiResponse } from 'next';
import { AuthenticatedRequest, ApiHandler } from './auth';

export const withLogging = (handler: ApiHandler) => {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const start = Date.now();
    const { method, url } = req;
    const userInfo = req.user ? `User: ${req.user.id}(${req.user.role})` : 'Anonymous';

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