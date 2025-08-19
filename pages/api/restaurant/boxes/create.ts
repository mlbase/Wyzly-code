import { PrismaClient } from '@prisma/client';
import { withRestaurantAuth, AuthenticatedRequest } from '../../../../lib/middleware';

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequest, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    // Get the restaurant owned by this user
    const restaurant = await prisma.restaurant.findFirst({
      where: { ownerId: req.user!.id }
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant not found for this user'
      });
    }

    const { title, price, quantity, image, isAvailable = true } = req.body;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Title is required and must be a non-empty string'
      });
    }

    if (price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        error: 'Price is required'
      });
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({
        success: false,
        error: 'Price must be a valid positive number'
      });
    }

    if (quantity === undefined || quantity === null) {
      return res.status(400).json({
        success: false,
        error: 'Quantity is required'
      });
    }

    const numQuantity = parseInt(quantity);
    if (isNaN(numQuantity) || numQuantity < 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be a valid non-negative integer'
      });
    }

    // Validate optional fields
    if (image !== undefined && typeof image !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Image must be a string URL'
      });
    }

    if (isAvailable !== undefined && typeof isAvailable !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'isAvailable must be a boolean'
      });
    }

    // Create the box using transaction to log initial inventory
    const newBox = await prisma.$transaction(async (tx) => {
      // Create the box
      const box = await tx.box.create({
        data: {
          title: title.trim(),
          price: numPrice,
          quantity: numQuantity,
          image: image?.trim() || null,
          isAvailable: isAvailable,
          restaurantId: restaurant.id
        },
        include: {
          restaurant: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      // Log initial inventory if quantity > 0
      if (numQuantity > 0) {
        await tx.inventoryCommand.create({
          data: {
            type: 'increase',
            boxId: box.id,
            quantity: numQuantity,
            previousQuantity: 0
          }
        });
      }

      return box;
    });

    return res.status(201).json({
      success: true,
      data: {
        box: newBox,
        message: 'Box created successfully'
      }
    });

  } catch (error) {
    console.error('Create box API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  } finally {
    await prisma.$disconnect();
  }
}

export default withRestaurantAuth()(handler);