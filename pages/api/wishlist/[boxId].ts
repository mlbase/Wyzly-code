import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequestWithUser } from '../../../lib/middleware';
import dbConnect from '../../../lib/mongodb';
import Wishlist, { IWishlistItem } from '../../../lib/models/Wishlist';

interface WishlistItemRequest extends AuthenticatedRequestWithUser {
  query: {
    boxId: string;
  };
  body: {
    priority?: 'low' | 'medium' | 'high';
    notes?: string;
    quantity?: number;
  };
}

async function handler(req: AuthenticatedRequestWithUser, res: NextApiResponse) {
  await dbConnect();

  const userId = req.user.id;
  const boxId = parseInt(req.query.boxId as string);

  if (isNaN(boxId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid boxId'
    });
  }

  switch (req.method) {
    case 'DELETE':
      return handleRemoveFromWishlist(userId, boxId, res);
    
    case 'PATCH':
      return handleUpdateWishlistItem(userId, boxId, req.body, res);
    
    default:
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
  }
}

async function handleRemoveFromWishlist(userId: number, boxId: number, res: NextApiResponse) {
  try {
    const wishlist = await Wishlist.findByUserId(userId);
    
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        error: 'Wishlist not found'
      });
    }

    // Check if item exists
    const itemExists = wishlist.items.some((item: IWishlistItem) => item.boxId === boxId);
    
    if (!itemExists) {
      return res.status(404).json({
        success: false,
        error: 'Item not found in wishlist'
      });
    }

    await wishlist.removeItem(boxId);

    return res.status(200).json({
      success: true,
      data: {
        wishlist: {
          userId: wishlist.userId,
          items: wishlist.items,
          itemCount: wishlist.items.length,
          updatedAt: wishlist.updatedAt
        },
        message: 'Item removed from wishlist successfully'
      }
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to remove item from wishlist'
    });
  }
}

async function handleUpdateWishlistItem(
  userId: number, 
  boxId: number, 
  body: { priority?: 'low' | 'medium' | 'high'; notes?: string; quantity?: number },
  res: NextApiResponse
) {
  try {
    const { priority, notes, quantity } = body;

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
    if (quantity !== undefined && (quantity < 1 || !Number.isInteger(quantity))) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be a positive integer'
      });
    }

    const wishlist = await Wishlist.findByUserId(userId);
    
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        error: 'Wishlist not found'
      });
    }

    const itemIndex = wishlist.items.findIndex((item: IWishlistItem) => item.boxId === boxId);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Item not found in wishlist'
      });
    }

    // Update item properties
    if (priority !== undefined) {
      wishlist.items[itemIndex].priority = priority;
    }
    if (notes !== undefined) {
      wishlist.items[itemIndex].notes = notes;
    }
    if (quantity !== undefined) {
      wishlist.items[itemIndex].quantity = quantity;
    }

    await wishlist.save();

    return res.status(200).json({
      success: true,
      data: {
        wishlist: {
          userId: wishlist.userId,
          items: wishlist.items,
          itemCount: wishlist.items.length,
          updatedAt: wishlist.updatedAt
        },
        message: 'Wishlist item updated successfully'
      }
    });
  } catch (error) {
    console.error('Update wishlist item error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update wishlist item'
    });
  }
}

export default withAuth()(handler);