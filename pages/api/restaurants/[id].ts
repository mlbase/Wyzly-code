import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { id } = req.query;
    const restaurantId = parseInt(id as string, 10);

    if (isNaN(restaurantId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid restaurant ID'
      });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: {
        id: restaurantId
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        boxes: {
          orderBy: [
            { isAvailable: 'desc' }, // Available items first
            { createdAt: 'desc' }
          ]
        }
      }
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant not found'
      });
    }

    // Transform the response to match the expected format
    const transformedRestaurant = {
      id: restaurant.id,
      name: restaurant.name,
      phoneNumber: restaurant.phoneNumber,
      description: restaurant.description,
      ownerId: restaurant.ownerId,
      createdAt: restaurant.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: restaurant.updatedAt?.toISOString() || new Date().toISOString(),
      boxes: restaurant.boxes.map(box => ({
        id: box.id,
        title: box.title,
        price: parseFloat(box.price.toString()),
        quantity: box.quantity,
        image: box.image,
        isAvailable: box.isAvailable && box.quantity > 0,
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          phoneNumber: restaurant.phoneNumber,
          description: restaurant.description
        }
      }))
    };

    return res.status(200).json({
      success: true,
      data: transformedRestaurant
    });
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch restaurant details'
    });
  }
}