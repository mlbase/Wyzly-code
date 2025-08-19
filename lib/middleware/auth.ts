import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: number;
    email: string;
    role: string;
    username: string;
  };
}

export interface AuthenticatedRequestWithUser extends NextApiRequest {
  user: {
    id: number;
    email: string;
    role: string;
    username: string;
  };
}

export type ApiHandler = (
  req: AuthenticatedRequestWithUser,
  res: NextApiResponse
) => Promise<void> | void;

export const withAuth = (allowedRoles?: string[]) => {
  return (handler: ApiHandler) => {
    return async (req: AuthenticatedRequest, res: NextApiResponse) => {
      try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return res.status(401).json({
            success: false,
            error: 'Unauthorized',
            message: 'Token required'
          });
        }

        // Verify JWT token
        const secret = process.env.JWT_SECRET;
        if (!secret) {
          throw new Error('JWT_SECRET environment variable is not set');
        }
        
        const decoded = jwt.verify(token, secret) as any;
        if (!decoded || typeof decoded !== 'object') {
          throw new Error('Invalid token payload');
        }
        
        req.user = {
          id: decoded.id || decoded.userId,
          email: decoded.email,
          role: decoded.role,
          username: decoded.username
        };

        // Check role permissions
        if (allowedRoles && req.user && !allowedRoles.includes(req.user.role)) {
          return res.status(403).json({
            success: false,
            error: 'Forbidden',
            message: 'Insufficient permissions'
          });
        }

        return handler(req as AuthenticatedRequestWithUser, res);
      } catch (error) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Invalid or expired token'
        });
      }
    };
  };
};

// Specific role helpers
export const withCustomerAuth = () => withAuth(['customer']);
export const withRestaurantAuth = () => withAuth(['restaurant']);
export const withAdminAuth = () => withAuth(['admin']);
export const withAnyAuth = () => withAuth(); // Any authenticated user