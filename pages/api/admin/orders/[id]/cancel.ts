import { NextApiResponse } from 'next';
import { PrismaClient, Prisma } from '@prisma/client';
import { withAdminAuth, AuthenticatedRequestWithUser } from '../../../../../lib/middleware';

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequestWithUser, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {

    const orderId = parseInt(req.query.id as string);
    if (isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order ID'
      });
    }

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        box: true,
        user: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    if (order.isCancelled) {
      return res.status(400).json({
        success: false,
        error: 'Order is already cancelled'
      });
    }

    // Use transaction to ensure data consistency  
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Update order status to cancelled
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          isCancelled: true,
          status: 'cancelled',
          updatedAt: new Date()
        }
      });

      // Create or update cancel order record
      const existingCancelOrder = await tx.cancelOrder.findFirst({
        where: { orderId: orderId }
      });

      if (existingCancelOrder) {
        // Update existing cancel order to approved
        await tx.cancelOrder.update({
          where: { id: existingCancelOrder.id },
          data: {
            isApproved: true,
            adminId: req.user!.id,
            approvedAt: new Date()
          }
        });
      } else {
        // Create new cancel order record
        await tx.cancelOrder.create({
          data: {
            orderId: orderId,
            userId: order.userId,
            isApproved: true,
            adminId: req.user!.id,
            reason: 'Cancelled by admin',
            approvedAt: new Date()
          }
        });
      }

      // Restore box quantity if needed
      if (order.box) {
        await tx.box.update({
          where: { id: order.boxId! },
          data: {
            quantity: {
              increment: order.quantity
            }
          }
        });

        // Log inventory command
        await tx.inventoryCommand.create({
          data: {
            type: 'increase',
            boxId: order.boxId!,
            quantity: order.quantity,
            previousQuantity: order.box.quantity
          }
        });
      }

      return updatedOrder;
    });

    return res.status(200).json({
      success: true,
      data: {
        order: result,
        message: `Order #${orderId} has been cancelled successfully`
      }
    });

  } catch (error) {
    console.error('Cancel order API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  } finally {
    await prisma.$disconnect();
  }
}

export default withAdminAuth()(handler);