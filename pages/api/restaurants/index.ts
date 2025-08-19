import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const restaurants = await prisma.restaurant.findMany({
        include: {
          owner: {
            select: {
              id: true,
              username: true,
              email: true
            }
          },
          _count: {
            select: {
              boxes: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return res.status(200).json({
        success: true,
        data: restaurants
      });
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch restaurants'
      });
    }
  }

  return res.status(405).json({
    success: false,
    error: 'Method not allowed'
  });
}