import mongoose, { Document, Schema, Model } from 'mongoose';

// Interface for Wishlist document
export interface IWishlistItem {
  userId: number; // References PostgreSQL users.id
  boxId: number;  // References PostgreSQL boxes.id
  addedAt: Date;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
  quantity: number; // Desired quantity for this item
}

export interface IWishlist extends Document {
  userId: number;
  items: IWishlistItem[];
  createdAt: Date;
  updatedAt: Date;
  // Instance methods
  addItem(boxId: number, priority?: string, notes?: string, quantity?: number): Promise<IWishlist>;
  removeItem(boxId: number): Promise<IWishlist>;
  clearWishlist(): Promise<IWishlist>;
  getItemsByPriority(priority: string): IWishlistItem[];
}

// Static methods interface
export interface IWishlistModel extends Model<IWishlist> {
  findByUserId(userId: number): Promise<IWishlist | null>;
  createOrUpdateWishlist(userId: number, boxId: number, priority?: string, notes?: string, quantity?: number): Promise<IWishlist>;
}

// Wishlist Item Schema (embedded in Wishlist)
const WishlistItemSchema = new Schema<IWishlistItem>({
  userId: {
    type: Number,
    required: true
  },
  boxId: {
    type: Number,
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  notes: {
    type: String,
    maxlength: 500
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  }
}, { _id: false }); // Disable _id for embedded documents

// Main Wishlist Schema
const WishlistSchema = new Schema<IWishlist>({
  userId: {
    type: Number,
    required: true,
    unique: true, // One wishlist per user
    index: true
  },
  items: [WishlistItemSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
WishlistSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Compound index for efficient queries
WishlistSchema.index({ userId: 1, 'items.boxId': 1 });

// Instance methods
WishlistSchema.methods.addItem = function(boxId: number, priority?: string, notes?: string, quantity?: number) {
  // Check if item already exists
  const existingItem = this.items.find((item: IWishlistItem) => item.boxId === boxId);
  
  if (existingItem) {
    // Update existing item
    existingItem.priority = priority || existingItem.priority;
    existingItem.notes = notes || existingItem.notes;
    existingItem.quantity = quantity || existingItem.quantity;
    existingItem.addedAt = new Date(); // Update timestamp
  } else {
    // Add new item
    this.items.push({
      userId: this.userId,
      boxId,
      addedAt: new Date(),
      priority: priority || 'medium',
      notes,
      quantity: quantity || 1
    });
  }
  
  return this.save();
};

WishlistSchema.methods.removeItem = function(boxId: number) {
  this.items = this.items.filter((item: IWishlistItem) => item.boxId !== boxId);
  return this.save();
};

WishlistSchema.methods.clearWishlist = function() {
  this.items = [];
  return this.save();
};

WishlistSchema.methods.getItemsByPriority = function(priority: string) {
  return this.items.filter((item: IWishlistItem) => item.priority === priority);
};

// Static methods
WishlistSchema.statics.findByUserId = function(userId: number) {
  return this.findOne({ userId });
};

WishlistSchema.statics.createOrUpdateWishlist = async function(userId: number, boxId: number, priority?: string, notes?: string, quantity?: number) {
  let wishlist = await this.findOne({ userId });
  
  if (!wishlist) {
    wishlist = new this({
      userId,
      items: [{
        userId,
        boxId,
        addedAt: new Date(),
        priority: priority || 'medium',
        notes,
        quantity: quantity || 1
      }]
    });
  } else {
    await wishlist.addItem(boxId, priority, notes, quantity);
  }
  
  return wishlist.save();
};

// Export model with proper typing (handle potential re-compilation issues in development)
export default (mongoose.models.Wishlist as IWishlistModel) || mongoose.model<IWishlist, IWishlistModel>('Wishlist', WishlistSchema);