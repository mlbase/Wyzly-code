import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

interface FeedQuery {
  search?: string;
  category?: 'all' | 'available' | 'sold-out';
  restaurant?: string;
  page?: string;
  limit?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const {
      search,
      category = 'all',
      restaurant,
      page = '1',
      limit = '20'
    } = req.query as FeedQuery;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          restaurant: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ];
    }

    // Category filter
    if (category === 'available') {
      where.isAvailable = true;
      where.quantity = { gt: 0 };
    } else if (category === 'sold-out') {
      where.OR = [
        { isAvailable: false },
        { quantity: { lte: 0 } }
      ];
    }

    // Restaurant filter
    if (restaurant) {
      where.restaurant = {
        name: {
          contains: restaurant,
          mode: 'insensitive'
        }
      };
    }

    // Fetch boxes with restaurant information
    const [boxes, total] = await Promise.all([
      prisma.box.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          restaurant: {
            select: {
              id: true,
              name: true,
              description: true,
              phoneNumber: true
            }
          }
        },
        orderBy: [
          { isAvailable: 'desc' }, // Available items first
          { quantity: 'desc' },    // Higher quantity first
          { createdAt: 'desc' }    // Newer items first
        ]
      }),
      prisma.box.count({ where })
    ]);

    // Transform data for frontend
    const transformedBoxes = boxes.map(box => ({
      id: box.id,
      title: box.title,
      price: parseFloat(box.price.toString()),
      quantity: box.quantity,
      image: box.image,
      isAvailable: box.isAvailable && box.quantity > 0,
      restaurant: {
        id: box.restaurant?.id,
        name: box.restaurant?.name || 'Unknown Restaurant',
        description: box.restaurant?.description,
        phoneNumber: box.restaurant?.phoneNumber
      }
    }));

    return res.status(200).json({
      success: true,
      data: {
        boxes: transformedBoxes,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
          hasMore: pageNum * limitNum < total
        },
        filters: {
          search,
          category,
          restaurant
        }
      }
    });

  } catch (error) {
    console.error('Feed API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' 
        ? error instanceof Error ? error.message : 'Unknown error'
        : 'Something went wrong'
    });
  }
}