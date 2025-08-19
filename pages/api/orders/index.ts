import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequestWithUser } from '../../../lib/middleware';
import { orderService } from '../../../lib/services/orderService';

async function handler(req: AuthenticatedRequestWithUser, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const userId = req.user.id;
    const { orders } = await orderService.findByUserId(userId);
    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error('Get orders error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
}

export default withAuth()(handler);