import { NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { withCustomerAuth, AuthenticatedRequestWithUser } from '../../../lib/middleware';

interface OrderItem {
  boxId: number;
  quantity: number;
}

interface ProcessedOrderGroup {
  restaurantId: number;
  restaurantName: string;
  items: {
    boxId: number;
    boxTitle: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  totalAmount: number;
}

async function handler(req: AuthenticatedRequestWithUser, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { items = [], paymentMethod = 'mock' } = req.body || {};
    const userId = req.user.id;

    // Validate input
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Items array is required and cannot be empty'
      });
    }

    // Validate each item
    for (const item of items) {
      if (!item.boxId || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Each item must have a valid boxId and quantity > 0'
        });
      }
    }

    // Start transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Fetch all boxes with restaurant info
      const boxIds = items.map(item => item.boxId);
      const boxes = await tx.box.findMany({
        where: {
          id: { in: boxIds },
          isAvailable: true
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

      // Check if all boxes exist and are available
      if (boxes.length !== boxIds.length) {
        const foundBoxIds = boxes.map(box => box.id);
        const missingBoxIds = boxIds.filter(id => !foundBoxIds.includes(id));
        throw new Error(`Boxes not found or unavailable: ${missingBoxIds.join(', ')}`);
      }

      // Check stock availability
      const stockErrors: string[] = [];
      for (const item of items) {
        const box = boxes.find(b => b.id === item.boxId);
        if (!box) continue;
        
        if (box.quantity < item.quantity) {
          stockErrors.push(`${box.title}: requested ${item.quantity}, available ${box.quantity}`);
        }
      }

      if (stockErrors.length > 0) {
        throw new Error(`Insufficient stock: ${stockErrors.join('; ')}`);
      }

      // Group items by restaurant
      const restaurantGroups = new Map<number, ProcessedOrderGroup>();
      
      for (const item of items) {
        const box = boxes.find(b => b.id === item.boxId)!;
        const restaurantId = box.restaurant?.id || 0;
        
        if (!restaurantGroups.has(restaurantId)) {
          restaurantGroups.set(restaurantId, {
            restaurantId,
            restaurantName: box.restaurant?.name || 'Unknown Restaurant',
            items: [],
            totalAmount: 0
          });
        }
        
        const group = restaurantGroups.get(restaurantId)!;
        const itemTotal = Number(box.price) * item.quantity;
        
        group.items.push({
          boxId: box.id,
          boxTitle: box.title,
          quantity: item.quantity,
          unitPrice: Number(box.price),
          totalPrice: itemTotal
        });
        
        group.totalAmount += itemTotal;
      }

      // Create orders for each restaurant group
      const createdOrders: any[] = [];
      const createdPayments: any[] = [];
      const inventoryCommands: any[] = [];

      for (const [restaurantId, group] of Array.from(restaurantGroups.entries())) {
        // Create individual orders for each item in the group
        for (const item of group.items) {
          const order = await tx.order.create({
            data: {
              userId,
              boxId: item.boxId,
              quantity: item.quantity,
              totalPrice: item.totalPrice,
              status: 'pending'
            }
          });
          
          createdOrders.push({
            ...order,
            boxTitle: item.boxTitle,
            restaurantName: group.restaurantName
          });

          // Create payment for this order
          const payment = await tx.payment.create({
            data: {
              orderId: order.id,
              amount: item.totalPrice,
              status: 'completed', // Assume successful payment for now
              method: paymentMethod,
              transactionId: `txn_${Date.now()}_${order.id}`
            }
          });
          
          createdPayments.push(payment);

          // Decrease box quantity
          const box = boxes.find(b => b.id === item.boxId)!;
          const previousQuantity = box.quantity;
          const newQuantity = previousQuantity - item.quantity;

          await tx.box.update({
            where: { id: item.boxId },
            data: { 
              quantity: newQuantity,
              isAvailable: newQuantity > 0
            }
          });

          // Create inventory command for tracking
          const inventoryCommand = await tx.inventoryCommand.create({
            data: {
              type: 'decrease',
              boxId: item.boxId,
              quantity: item.quantity,
              previousQuantity
            }
          });
          
          inventoryCommands.push(inventoryCommand);
        }
      }

      // Update order status to confirmed after successful payment
      await tx.order.updateMany({
        where: {
          id: { in: createdOrders.map(o => o.id) }
        },
        data: {
          status: 'confirmed'
        }
      });

      return {
        orders: createdOrders,
        payments: createdPayments,
        restaurantGroups: Array.from(restaurantGroups.values()),
        inventoryCommands,
        totalOrdersCreated: createdOrders.length,
        totalAmount: Array.from(restaurantGroups.values()).reduce((sum, group) => sum + group.totalAmount, 0)
      };
    });

    return res.status(201).json({
      success: true,
      message: 'Bulk order created successfully',
      data: {
        orders: result.orders,
        payments: result.payments,
        restaurantGroups: result.restaurantGroups,
        summary: {
          totalOrders: result.totalOrdersCreated,
          totalAmount: result.totalAmount,
          restaurants: result.restaurantGroups.length,
          paymentMethod
        }
      }
    });

  } catch (error) {
    console.error('Bulk order creation error:', error);
    
    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('Insufficient stock')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to create bulk order'
    });
  }
}

export default withCustomerAuth()(handler);