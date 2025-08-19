import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { withRestaurantAuth, AuthenticatedRequest } from '../../../lib/middleware';

const prisma = new PrismaClient();

type BoxWithRelations = {
  id: number;
  title: string;
  price: Decimal;
  quantity: number;
  image: string | null;
  isAvailable: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
  restaurant: {
    id: number;
    name: string;
  } | null;
  _count?: {
    orders: number;
  };
};

async function handler(req: AuthenticatedRequest, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    // Get the restaurant owned by this user
    const restaurant = await prisma.restaurant.findFirst({
      where: { ownerId: req.user!.id },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        description: true
      }
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant not found for this user'
      });
    }

    // Fetch all boxes belonging to this restaurant
    const boxes: BoxWithRelations[] = await prisma.box.findMany({
      where: {
        restaurantId: restaurant.id
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            orders: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        restaurant,
        boxes,
        summary: {
          totalBoxes: boxes.length,
          availableBoxes: boxes.filter((box: BoxWithRelations) => box.isAvailable).length,
          totalStock: boxes.reduce((sum: number, box: BoxWithRelations) => sum + box.quantity, 0),
          averagePrice: boxes.length > 0 
            ? boxes.reduce((sum: number, box: BoxWithRelations) => sum + Number(box.price), 0) / boxes.length
            : 0
        }
      }
    });

  } catch (error) {
    console.error('Restaurant boxes API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  } finally {
    await prisma.$disconnect();
  }
}

export default withRestaurantAuth()(handler);