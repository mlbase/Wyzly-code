import { prisma } from '../prisma';
import { InventoryType } from '@prisma/client';

export interface CreateBoxData {
  title: string;
  price: number;
  quantity: number;
  image?: string;
  restaurantId: number;
  isAvailable?: boolean;
}

export interface UpdateBoxData {
  title?: string;
  price?: number;
  image?: string;
  isAvailable?: boolean;
}

export interface InventoryChange {
  type: InventoryType;
  quantity: number;
}

export const boxService = {
  async findAll(filters?: {
    restaurantId?: number;
    available?: boolean;
    page?: number;
    limit?: number;
  }) {
    const where: any = {};
    
    if (filters?.restaurantId) {
      where.restaurantId = filters.restaurantId;
    }
    
    if (filters?.available !== undefined) {
      where.isAvailable = filters.available;
    }

    const skip = filters?.page && filters?.limit ? (filters.page - 1) * filters.limit : 0;
    const take = filters?.limit || 20;

    const [boxes, total] = await Promise.all([
      prisma.box.findMany({
        where,
        skip,
        take,
        include: {
          restaurant: {
            select: { id: true, name: true, phoneNumber: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.box.count({ where })
    ]);

    return {
      boxes,
      pagination: {
        page: filters?.page || 1,
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    };
  },

  async findById(id: number) {
    return prisma.box.findUnique({
      where: { id },
      include: {
        restaurant: {
          select: { id: true, name: true, phoneNumber: true, description: true }
        }
      }
    });
  },

  async create(boxData: CreateBoxData) {
    return prisma.box.create({
      data: {
        ...boxData,
        isAvailable: boxData.quantity > 0 && (boxData.isAvailable !== false)
      },
      include: {
        restaurant: {
          select: { id: true, name: true }
        }
      }
    });
  },

  async update(id: number, updates: UpdateBoxData, userId: number) {
    // Verify ownership - only restaurant owner can update their boxes
    const box = await prisma.box.findFirst({
      where: {
        id,
        restaurant: {
          ownerId: userId
        }
      }
    });

    if (!box) {
      throw new Error('Box not found or unauthorized');
    }

    return prisma.box.update({
      where: { id },
      data: updates,
      include: {
        restaurant: {
          select: { id: true, name: true }
        }
      }
    });
  },

  async delete(id: number, userId: number) {
    // Verify ownership - only restaurant owner can delete their boxes
    const box = await prisma.box.findFirst({
      where: {
        id,
        restaurant: {
          ownerId: userId
        }
      }
    });

    if (!box) {
      throw new Error('Box not found or unauthorized');
    }

    await prisma.box.delete({
      where: { id }
    });
  },

  async updateInventory(boxId: number, change: InventoryChange, userId: number) {
    // Verify ownership - only restaurant owner can update inventory
    const box = await prisma.box.findFirst({
      where: {
        id: boxId,
        restaurant: {
          ownerId: userId
        }
      }
    });

    if (!box) {
      throw new Error('Box not found or unauthorized');
    }

    // Calculate new quantity
    const newQuantity = change.type === InventoryType.INCREASE 
      ? box.quantity + change.quantity
      : box.quantity - change.quantity;

    if (newQuantity < 0) {
      throw new Error('Insufficient quantity for decrease operation');
    }

    // Use transaction to update box and create inventory command
    return prisma.$transaction(async (tx) => {
      // Update box quantity and availability
      const updatedBox = await tx.box.update({
        where: { id: boxId },
        data: {
          quantity: newQuantity,
          isAvailable: newQuantity > 0 && box.isAvailable
        }
      });

      // Create inventory command record
      await tx.inventoryCommand.create({
        data: {
          type: change.type,
          boxId,
          quantity: change.quantity,
          previousQuantity: box.quantity
        }
      });

      return updatedBox;
    });
  },

  async getInventoryHistory(boxId: number, userId: number) {
    // Verify ownership - only restaurant owner can view inventory history
    const box = await prisma.box.findFirst({
      where: {
        id: boxId,
        restaurant: {
          ownerId: userId
        }
      }
    });

    if (!box) {
      throw new Error('Box not found or unauthorized');
    }

    return prisma.inventoryCommand.findMany({
      where: { boxId },
      include: {
        box: {
          select: { title: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async canBePurchased(boxId: number, requestedQuantity: number) {
    const box = await prisma.box.findUnique({
      where: { id: boxId }
    });

    if (!box) {
      throw new Error('Box not found');
    }

    if (!box.isAvailable) {
      throw new Error('Box is not available');
    }

    if (box.quantity < requestedQuantity) {
      throw new Error('Insufficient quantity available');
    }

    return true;
  }
};