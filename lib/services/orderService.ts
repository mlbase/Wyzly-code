import { prisma } from '../prisma';
import { boxService } from './boxService';
import type { PrismaClient } from '@prisma/client';

export interface CreateOrderData {
  userId: number;
  boxId: number;
  quantity: number;
  paymentMethod?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export const orderService = {
  async create(orderData: CreateOrderData) {
    const { userId, boxId, quantity, paymentMethod = 'mock' } = orderData;

    // Use boxService to validate purchase capability
    const box = await prisma.box.findUnique({
      where: { id: boxId },
      include: {
        restaurant: {
          select: { id: true, name: true }
        }
      }
    });

    if (!box) {
      throw new Error('Box not found');
    }

    // Validate purchase possibility using boxService
    await boxService.canBePurchased(boxId, quantity);

    const totalPrice = box.price.toNumber() * quantity;

    // Use transaction for atomicity
    return prisma.$transaction(async (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => {
      // Create order
      const order = await tx.order.create({
        data: {
          userId,
          boxId,
          quantity,
          totalPrice,
          status: 'pending'
        }
      });

      // Process payment
      const paymentResult = await this.processPayment(totalPrice, paymentMethod);
      
      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment failed');
      }

      // Create payment record
      await tx.payment.create({
        data: {
          orderId: order.id,
          amount: totalPrice,
          status: 'completed',
          method: paymentMethod,
          transactionId: paymentResult.transactionId
        }
      });

      // Update order status
      const confirmedOrder = await tx.order.update({
        where: { id: order.id },
        data: { status: 'confirmed' }
      });

      // Update inventory
      await tx.box.update({
        where: { id: boxId },
        data: { quantity: { decrement: quantity } }
      });

      // Track inventory change
      await tx.inventoryCommand.create({
        data: {
          type: 'decrease',
          boxId,
          quantity,
          previousQuantity: box.quantity
        }
      });

      return confirmedOrder;
    });
  },


  async processPayment(_amount: number, method: string): Promise<PaymentResult> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (method === 'mock') {
      const success = Math.random() > 0.05; // 95% success rate
      
      if (success) {
        return {
          success: true,
          transactionId: `mock_txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
        };
      } else {
        return {
          success: false,
          error: 'Payment failed - insufficient funds or card declined'
        };
      }
    }
    
    return {
      success: true,
      transactionId: `${method}_txn_${Date.now()}`
    };
  },

  async findById(id: number) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        box: {
          include: {
            restaurant: {
              select: { id: true, name: true }
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
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });
  },

  async updateStatus(orderId: number, status: string, userId: number) {
    // Verify ownership - only order owner can update status
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId
      }
    });

    if (!order) {
      throw new Error('Order not found or unauthorized');
    }

    return prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        box: {
          include: {
            restaurant: {
              select: { id: true, name: true }
            }
          }
        },
        payment: {
          select: {
            status: true,
            method: true
          }
        }
      }
    });
  },

  async findByUserId(userId: number, filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const where: any = { userId };
    
    if (filters?.status) {
      where.status = filters.status;
    }

    const skip = filters?.page && filters?.limit ? (filters.page - 1) * filters.limit : 0;
    const take = filters?.limit || 20;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          box: {
            include: {
              restaurant: {
                select: { id: true, name: true }
              }
            }
          },
          payment: {
            select: {
              status: true,
              method: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.order.count({ where })
    ]);

    return {
      orders,
      pagination: {
        page: filters?.page || 1,
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    };
  },

  async createBulk(userId: number, items: { boxId: number, quantity: number }[]) {
    const orders = [];
    for (const item of items) {
      const order = await this.create({
        userId,
        boxId: item.boxId,
        quantity: item.quantity,
      });
      orders.push(order);
    }
    return orders;
  }
};