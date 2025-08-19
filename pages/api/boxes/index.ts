import {
  compose,
  withMethods,
  withValidation,
  withRestaurantAuth,
  withLogging,
  withErrorHandler,
  AuthenticatedRequest
} from '../../../lib/middleware';
import { createBoxSchema, boxQuerySchema } from '../../../lib/schemas/box';
import { NextApiResponse } from 'next';

// GET /api/boxes - Get all boxes (public)
const getBoxes = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { page = '1', limit = '20' } = req.query;
  
  // TODO: Implement database query
  const mockBoxes = [
    {
      id: 1,
      title: 'Classic Spaghetti Carbonara Box',
      price: 15.99,
      quantity: 25,
      image: '/images/carbonara-box.jpg',
      restaurant_id: 1,
      is_available: true,
      restaurant: {
        id: 1,
        name: 'Pasta Palace'
      }
    }
  ];

  return res.status(200).json({
    success: true,
    data: {
      boxes: mockBoxes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: 1,
        totalPages: 1
      }
    }
  });
};

// POST /api/boxes - Create new box (Restaurant only)
const createBox = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const boxData = req.body;
  
  // TODO: Implement database creation
  const newBox = {
    id: Date.now(), // Mock ID
    ...boxData,
    created_at: new Date().toISOString()
  };

  return res.status(201).json({
    success: true,
    data: newBox
  });
};

// Main handler with conditional auth
const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    return getBoxes(req, res);
  }
  
  if (req.method === 'POST') {
    return createBox(req, res);
  }
};

// Public handler for GET requests
const publicHandler = compose(
  withErrorHandler,
  withLogging,
  withMethods(['GET']),
  withValidation({ query: boxQuerySchema })
)(getBoxes);

// Protected handler for POST requests
const protectedHandler = compose(
  withErrorHandler,
  withLogging,
  withMethods(['POST']),
  withRestaurantAuth(),
  withValidation({ body: createBoxSchema })
)(createBox);

// Route handler that decides between public/protected
export default async function apiHandler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return publicHandler(req, res);
  } else if (req.method === 'POST') {
    return protectedHandler(req, res);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }
}