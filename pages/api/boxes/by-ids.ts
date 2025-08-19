import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

interface BoxesByIdsRequest extends NextApiRequest {
  body: {
    boxIds: number[];
  };
}

export default async function handler(req: BoxesByIdsRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { boxIds } = req.body;

    // Validate input
    if (!Array.isArray(boxIds)) {
      return res.status(400).json({
        success: false,
        error: 'boxIds must be an array'
      });
    }

    if (boxIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: { boxes: [] }
      });
    }

    // Validate all boxIds are numbers
    const invalidIds = boxIds.filter(id => typeof id !== 'number' || !Number.isInteger(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'All boxIds must be valid integers'
      });
    }

    // Limit the number of IDs to prevent abuse
    if (boxIds.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 100 box IDs allowed per request'
      });
    }

    // Fetch boxes with restaurant information
    const boxes = await prisma.box.findMany({
      where: {
        id: {
          in: boxIds
        }
      },
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
      orderBy: {
        id: 'asc'
      }
    });

    // Transform data for frontend
    const transformedBoxes = boxes.map((box: any) => ({
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
        requestedCount: boxIds.length,
        foundCount: transformedBoxes.length
      }
    });

  } catch (error) {
    console.error('Fetch boxes by IDs error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}