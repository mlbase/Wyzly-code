import {
  compose,
  withMethods,
  withLogging,
  withErrorHandler,
  AuthenticatedRequestWithUser
} from '../../../lib/middleware';
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/boxes - Get all boxes (public)
const getBoxes = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { 
      page = '1', 
      limit = '20', 
      search, 
      category = 'all' 
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};
    
    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { 
          restaurant: { 
            name: { contains: search, mode: 'insensitive' } 
          } 
        }
      ];
    }

    if (category === 'available') {
      where.isAvailable = true;
      where.quantity = { gt: 0 };
    } else if (category === 'sold-out') {
      where.OR = [
        { isAvailable: false },
        { quantity: { lte: 0 } }
      ];
    }

    // Get boxes with restaurant info
    const [boxes, total] = await Promise.all([
      prisma.box.findMany({
        where,
        include: {
          restaurant: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limitNum,
        skip: offset
      }),
      prisma.box.count({ where })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        boxes,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching boxes:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  } finally {
    await prisma.$disconnect();
  }
};

// Simple handler for this endpoint - only supports GET (public)
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  return getBoxes(req, res);
};

// Apply middleware
export default compose(
  withErrorHandler,
  withLogging,
  withMethods(['GET'])
)(handler);