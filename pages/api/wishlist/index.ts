import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequestWithUser } from '../../../lib/middleware';
import dbConnect from '../../../lib/mongodb';
import Wishlist from '../../../lib/models/Wishlist';

interface WishlistRequest extends AuthenticatedRequestWithUser {
  body: {
    boxId?: number;
    priority?: 'low' | 'medium' | 'high';
    notes?: string;
    quantity?: number;
  };
}

async function handler(req: WishlistRequest, res: NextApiResponse) {
  await dbConnect();

  const userId = req.user.id;

  switch (req.method) {
    case 'GET':
      return handleGetWishlist(userId, res);
    
    case 'POST':
      return handleAddToWishlist(userId, req.body, res);
    
    case 'DELETE':
      return handleClearWishlist(userId, res);
    
    default:
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
  }
}

async function handleGetWishlist(userId: number, res: NextApiResponse) {
  try {
    const wishlist = await Wishlist.findByUserId(userId);
    
    if (!wishlist) {
      return res.status(200).json({
        success: true,
        data: {
          wishlist: {
            userId,
            items: [],
            itemCount: 0,
            createdAt: null,
            updatedAt: null
          }
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        wishlist: {
          userId: wishlist.userId,
          items: wishlist.items,
          itemCount: wishlist.items.length,
          createdAt: wishlist.createdAt,
          updatedAt: wishlist.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch wishlist'
    });
  }
}

async function handleAddToWishlist(
  userId: number, 
  body: { boxId?: number; priority?: 'low' | 'medium' | 'high'; notes?: string; quantity?: number }, 
  res: NextApiResponse
) {
  try {
    const { boxId, priority = 'medium', notes, quantity = 1 } = body;

    if (!boxId || typeof boxId !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Valid boxId is required'
      });
    }

    // Validate priority
    if (priority && !['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({
        success: false,
        error: 'Priority must be low, medium, or high'
      });
    }

    // Validate notes length
    if (notes && notes.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Notes cannot exceed 500 characters'
      });
    }

    // Validate quantity
    if (quantity && (quantity < 1 || !Number.isInteger(quantity))) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be a positive integer'
      });
    }

    const wishlist = await Wishlist.createOrUpdateWishlist(userId, boxId, priority, notes, quantity);

    return res.status(200).json({
      success: true,
      data: {
        wishlist: {
          userId: wishlist.userId,
          items: wishlist.items,
          itemCount: wishlist.items.length,
          updatedAt: wishlist.updatedAt
        },
        message: 'Item added to wishlist successfully'
      }
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to add item to wishlist'
    });
  }
}

async function handleClearWishlist(userId: number, res: NextApiResponse) {
  try {
    const wishlist = await Wishlist.findByUserId(userId);
    
    if (!wishlist) {
      return res.status(200).json({
        success: true,
        data: {
          message: 'Wishlist was already empty'
        }
      });
    }

    await wishlist.clearWishlist();

    return res.status(200).json({
      success: true,
      data: {
        message: 'Wishlist cleared successfully'
      }
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to clear wishlist'
    });
  }
}

export default withAuth()(handler);