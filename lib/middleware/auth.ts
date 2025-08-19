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

export type ApiHandler = (
  req: AuthenticatedRequest,
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        req.user = decoded;

        // Check role permissions
        if (allowedRoles && !allowedRoles.includes(req.user.role)) {
          return res.status(403).json({
            success: false,
            error: 'Forbidden',
            message: 'Insufficient permissions'
          });
        }

        return handler(req, res);
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