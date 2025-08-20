import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequestWithUser } from '../../../lib/middleware';
import dbConnect from '../../../lib/mongodb';
import Wishlist from '../../../lib/models/Wishlist';

interface SyncRequest extends AuthenticatedRequestWithUser {
  body: {
    localItems: Array<{
      boxId: number;
      priority: 'low' | 'medium' | 'high';
      notes?: string;
      quantity: number;
    }>;
  };
}

async function handler(req: SyncRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  await dbConnect();

  const userId = req.user.id;
  const { localItems = [] } = req.body;

  try {
    // Validate local items
    if (!Array.isArray(localItems)) {
      return res.status(400).json({
        success: false,
        error: 'localItems must be an array'
      });
    }

    // Validate each item
    for (const item of localItems) {
      if (!item.boxId || typeof item.boxId !== 'number') {
        return res.status(400).json({
          success: false,
          error: 'Each item must have a valid boxId'
        });
      }
      
      if (item.priority && !['low', 'medium', 'high'].includes(item.priority)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid priority value'
        });
      }
      
      if (item.quantity && (item.quantity < 1 || !Number.isInteger(item.quantity))) {
        return res.status(400).json({
          success: false,
          error: 'Quantity must be a positive integer'
        });
      }
    }

    // Get existing server wishlist
    let serverWishlist = await Wishlist.findByUserId(userId);
    const serverItems = serverWishlist?.items || [];
    
    // Create map for efficient lookup
    const localItemsMap = new Map(
      localItems.map(item => [item.boxId, item])
    );

    // Merge strategy: 
    // 1. Keep all server items that don't conflict with local
    // 2. For conflicts, local items take precedence (user's recent actions)
    // 3. Add new local items to server

    const mergedItems = [];

    // Add all local items (they take precedence)
    for (const localItem of localItems) {
      mergedItems.push({
        userId,
        boxId: localItem.boxId,
        addedAt: new Date(),
        priority: localItem.priority || 'medium',
        notes: localItem.notes,
        quantity: localItem.quantity || 1
      });
    }

    // Add server items that don't exist in local
    for (const serverItem of serverItems) {
      if (!localItemsMap.has(serverItem.boxId)) {
        mergedItems.push({
          userId,
          boxId: serverItem.boxId,
          addedAt: serverItem.addedAt,
          priority: serverItem.priority,
          notes: serverItem.notes,
          quantity: serverItem.quantity
        });
      }
    }

    // Create or update wishlist with merged items
    if (!serverWishlist) {
      serverWishlist = new Wishlist({
        userId,
        items: mergedItems
      });
    } else {
      serverWishlist.items = mergedItems;
    }

    await serverWishlist.save();

    // Return the final merged wishlist
    return res.status(200).json({
      success: true,
      data: {
        wishlist: {
          userId: serverWishlist.userId,
          items: serverWishlist.items,
          itemCount: serverWishlist.items.length,
          createdAt: serverWishlist.createdAt,
          updatedAt: serverWishlist.updatedAt
        },
        message: 'Wishlist synced successfully',
        syncedItemsCount: localItems.length,
        mergedItemsCount: mergedItems.length
      }
    });

  } catch (error) {
    console.error('Wishlist sync error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to sync wishlist'
    });
  }
}

export default withAuth()(handler);