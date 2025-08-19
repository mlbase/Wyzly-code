import { PrismaClient } from '@prisma/client';
import { withRestaurantAuth, AuthenticatedRequest } from '../../../../lib/middleware';

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequest, res: any) {
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

    const boxId = parseInt(req.query.id as string);
    if (isNaN(boxId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid box ID'
      });
    }

    // Verify box belongs to this restaurant
    const box = await prisma.box.findFirst({
      where: {
        id: boxId,
        restaurantId: restaurant.id
      }
    });

    if (!box) {
      return res.status(404).json({
        success: false,
        error: 'Box not found or does not belong to your restaurant'
      });
    }

    if (req.method === 'PATCH') {
      // Update box
      const { title, price, quantity, image, isAvailable } = req.body;

      // Validate input
      const updates: any = {};
      if (title !== undefined) {
        if (typeof title !== 'string' || title.trim().length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Title must be a non-empty string'
          });
        }
        updates.title = title.trim();
      }

      if (price !== undefined) {
        const numPrice = parseFloat(price);
        if (isNaN(numPrice) || numPrice < 0) {
          return res.status(400).json({
            success: false,
            error: 'Price must be a valid positive number'
          });
        }
        updates.price = numPrice;
      }

      if (quantity !== undefined) {
        const numQuantity = parseInt(quantity);
        if (isNaN(numQuantity) || numQuantity < 0) {
          return res.status(400).json({
            success: false,
            error: 'Quantity must be a valid non-negative integer'
          });
        }
        updates.quantity = numQuantity;
      }

      if (image !== undefined) {
        if (typeof image !== 'string') {
          return res.status(400).json({
            success: false,
            error: 'Image must be a string URL'
          });
        }
        updates.image = image.trim() || null;
      }

      if (isAvailable !== undefined) {
        if (typeof isAvailable !== 'boolean') {
          return res.status(400).json({
            success: false,
            error: 'isAvailable must be a boolean'
          });
        }
        updates.isAvailable = isAvailable;
      }

      updates.updatedAt = new Date();

      // Log inventory change if quantity is being updated
      if (quantity !== undefined && quantity !== box.quantity) {
        await prisma.$transaction(async (tx) => {
          // Update the box
          const updatedBox = await tx.box.update({
            where: { id: boxId },
            data: updates,
            include: {
              restaurant: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          });

          // Log inventory command
          await tx.inventoryCommand.create({
            data: {
              type: quantity > box.quantity ? 'increase' : 'decrease',
              boxId: boxId,
              quantity: Math.abs(quantity - box.quantity),
              previousQuantity: box.quantity
            }
          });

          return updatedBox;
        });
      } else {
        // Update without inventory logging
        await prisma.box.update({
          where: { id: boxId },
          data: updates
        });
      }

      const updatedBox = await prisma.box.findUnique({
        where: { id: boxId },
        include: {
          restaurant: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      return res.status(200).json({
        success: true,
        data: {
          box: updatedBox,
          message: 'Box updated successfully'
        }
      });

    } else if (req.method === 'DELETE') {
      // Delete box
      // Check if there are any active orders for this box
      const activeOrders = await prisma.order.findMany({
        where: {
          boxId: boxId,
          isCancelled: false,
          status: {
            not: 'completed'
          }
        }
      });

      if (activeOrders.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Cannot delete box with ${activeOrders.length} active order(s). Please complete or cancel them first.`
        });
      }

      await prisma.box.delete({
        where: { id: boxId }
      });

      return res.status(200).json({
        success: true,
        data: {
          message: 'Box deleted successfully'
        }
      });

    } else {
      return res.status(405).json({ 
        success: false, 
        error: 'Method not allowed' 
      });
    }

  } catch (error) {
    console.error('Box CRUD API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  } finally {
    await prisma.$disconnect();
  }
}

export default withRestaurantAuth()(handler);