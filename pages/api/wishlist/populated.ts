import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequestWithUser } from '../../../lib/middleware';
import dbConnect from '../../../lib/mongodb';
import Wishlist from '../../../lib/models/Wishlist';
import { prisma } from '../../../lib/prisma';

async function handler(req: AuthenticatedRequestWithUser, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  await dbConnect();

  const userId = req.user.id;

  try {
    // Get wishlist from MongoDB
    const wishlist = await Wishlist.findByUserId(userId);
    
    if (!wishlist || wishlist.items.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          wishlist: {
            userId,
            items: [],
            itemCount: 0,
            createdAt: wishlist?.createdAt || null,
            updatedAt: wishlist?.updatedAt || null
          }
        }
      });
    }

    // Get box IDs from wishlist
    const boxIds = wishlist.items.map((item: any) => item.boxId);

    // Fetch box data from PostgreSQL with restaurant information
    const boxes = await prisma.box.findMany({
      where: {
        id: {
          in: boxIds
        }
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            description: true,
            phoneNumber: true
          }
        }
      }
    });

    // Create a map for quick box lookup
    const boxMap = new Map(boxes.map(box => [box.id, box]));

    // Populate wishlist items with box data
    const populatedItems = wishlist.items
      .map((item: any) => {
        const box = boxMap.get(item.boxId);
        
        if (!box) {
          // Box might have been deleted from PostgreSQL, skip this item
          return null;
        }

        return {
          boxId: item.boxId,
          addedAt: item.addedAt,
          priority: item.priority,
          notes: item.notes,
          box: {
            id: box.id,
            title: box.title,
            price: parseFloat(box.price.toString()),
            quantity: box.quantity,
            image: box.image,
            isAvailable: box.isAvailable && box.quantity > 0,
            restaurant: {
              id: box.restaurant?.id,
              name: box.restaurant?.name || 'Unknown Restaurant',
              description: box.restaurant?.description,
              phoneNumber: box.restaurant?.phoneNumber
            }
          }
        };
      })
      .filter(item => item !== null); // Remove items where box was not found

    // Sort items by priority and then by addedAt (most recent first)
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    populatedItems.sort((a: any, b: any) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    });

    // Group items by availability
    const availableItems = populatedItems.filter((item: any) => item.box.isAvailable);
    const unavailableItems = populatedItems.filter((item: any) => !item.box.isAvailable);

    return res.status(200).json({
      success: true,
      data: {
        wishlist: {
          userId: wishlist.userId,
          items: populatedItems,
          itemCount: populatedItems.length,
          availableCount: availableItems.length,
          unavailableCount: unavailableItems.length,
          groupedItems: {
            available: availableItems,
            unavailable: unavailableItems
          },
          createdAt: wishlist.createdAt,
          updatedAt: wishlist.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Get populated wishlist error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch wishlist data'
    });
  }
}

export default withAuth()(handler);