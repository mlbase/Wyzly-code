import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequestWithUser } from '../../../lib/middleware';
import { orderService } from '../../../lib/services/orderService';

interface CreateOrderRequest extends AuthenticatedRequestWithUser {
  body: {
    items: { boxId: number, quantity: number }[];
  };
}

async function handler(req: CreateOrderRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const userId = req.user.id;
    const { items } = req.body;
    const orders = await orderService.createBulk(userId, items);
    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create order' });
  }
}

export default withAuth()(handler);