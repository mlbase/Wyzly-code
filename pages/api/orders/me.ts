import { NextApiResponse } from 'next';
import { withCustomerAuth, AuthenticatedRequestWithUser } from '../../../lib/middleware';
import { prisma } from '../../../lib/prisma';

async function handler(req: AuthenticatedRequestWithUser, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const userId = req.user.id;

    // Fetch all orders for the user with related data
    const orders = await prisma.order.findMany({
      where: {
        userId: userId
      },
      include: {
        box: {
          include: {
            restaurant: {
              select: {
                id: true,
                name: true,
                phoneNumber: true
              }
            }
          }
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            method: true,
            transactionId: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Group orders by restaurant and date for better presentation
    const groupedOrders = orders.reduce((groups: any[], order) => {
      const orderDate = order.createdAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0];
      const restaurantId = order.box?.restaurant?.id;
      
      // Find existing group for same restaurant and date
      let existingGroup = groups.find(group => 
        group.restaurantId === restaurantId && 
        group.orderDate === orderDate &&
        group.status === order.status &&
        group.isCancelled === order.isCancelled
      );

      if (!existingGroup) {
        existingGroup = {
          id: `group_${orderDate}_${restaurantId}_${Date.now()}`,
          restaurantId,
          restaurantName: order.box?.restaurant?.name || 'Unknown Restaurant',
          restaurantPhone: order.box?.restaurant?.phoneNumber,
          orderDate,
          status: order.status,
          isCancelled: order.isCancelled,
          items: [],
          totalAmount: 0,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        };
        groups.push(existingGroup);
      }

      // Add order item to group
      existingGroup.items.push({
        id: order.id,
        boxId: order.boxId,
        boxTitle: order.box?.title || 'Unknown Item',
        boxImage: order.box?.image,
        quantity: order.quantity,
        unitPrice: Number(order.totalPrice) / order.quantity,
        totalPrice: Number(order.totalPrice),
        payment: order.payment
      });

      existingGroup.totalAmount += Number(order.totalPrice);

      return groups;
    }, []);

    // Calculate summary statistics
    const totalOrders = orders.length;
    const activeOrders = orders.filter(order => 
      !order.isCancelled && 
      ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
    ).length;
    const completedOrders = orders.filter(order => 
      order.status === 'delivered' && !order.isCancelled
    ).length;
    const cancelledOrders = orders.filter(order => order.isCancelled).length;

    return res.status(200).json({
      success: true,
      data: {
        orders: groupedOrders,
        summary: {
          totalOrders,
          activeOrders,
          completedOrders,
          cancelledOrders
        }
      }
    });

  } catch (error) {
    console.error('Get user orders error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
}

export default withCustomerAuth()(handler);