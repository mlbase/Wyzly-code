import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { withAdminAuth, AuthenticatedRequestWithUser } from '../../../lib/middleware';

type OrderWithRelations = {
  id: number;
  quantity: number;
  totalPrice: Decimal;
  status: string;
  isCancelled: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
  user: {
    id: number;
    username: string;
    email: string;
  } | null;
  box: {
    id: number;
    title: string;
    price: Decimal;
    restaurant: {
      id: number;
      name: string;
    } | null;
  } | null;
  payment: {
    id: number;
    status: string;
    method: string;
  }[];
  cancelOrders: {
    id: number;
    reason: string | null;
    isApproved: boolean | null;
    createdAt: Date | null;
  }[];
};

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequestWithUser, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {

    // Fetch all orders with related data
    const orders: OrderWithRelations[] = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        box: {
          include: {
            restaurant: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        payment: {
          select: {
            id: true,
            status: true,
            method: true
          }
        },
        cancelOrders: {
          select: {
            id: true,
            reason: true,
            isApproved: true,
            createdAt: true
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
        orders,
        totalCount: orders.length,
        activeCount: orders.filter((o: OrderWithRelations) => !o.isCancelled).length,
        cancelledCount: orders.filter((o: OrderWithRelations) => o.isCancelled).length,
        totalRevenue: orders
          .filter((o: OrderWithRelations) => !o.isCancelled)
          .reduce((sum: number, o: OrderWithRelations) => sum + Number(o.totalPrice), 0)
      }
    });

  } catch (error) {
    console.error('Admin orders API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  } finally {
    await prisma.$disconnect();
  }
}

export default withAdminAuth()(handler);