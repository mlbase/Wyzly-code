import { NextApiResponse } from 'next';
import { withCustomerAuth, AuthenticatedRequestWithUser } from '../../../../lib/middleware';
import { prisma } from '../../../../lib/prisma';

async function handler(req: AuthenticatedRequestWithUser, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const orderId = parseInt(req.query.id as string);
    const userId = req.user.id;
    const { reason = 'Cancelled by customer' } = req.body || {};

    if (isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order ID'
      });
    }

    // Check if order exists and belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: userId
      },
      include: {
        box: true
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

    // Check if order can be cancelled (only pending/confirmed orders can be cancelled)
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot cancel order with status: ${order.status}`
      });
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Update order status to cancelled
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          isCancelled: true,
          status: 'cancelled',
          updatedAt: new Date()
        }
      });

      // Create cancel order record
      await tx.cancelOrder.create({
        data: {
          orderId: orderId,
          userId: userId,
          reason: reason,
          isApproved: false, // Customer cancellation needs approval
          approvedAt: null,
          adminId: null
        }
      });

      // Restore box quantity (since order is cancelled)
      if (order.box) {
        await tx.box.update({
          where: { id: order.boxId! },
          data: {
            quantity: {
              increment: order.quantity
            },
            isAvailable: true // Make it available again
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
        message: `Order #${orderId} has been cancelled and is pending approval`
      }
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to cancel order'
    });
  }
}

export default withCustomerAuth()(handler);