# API Specification

Complete API documentation for the Wyzly Food Delivery Platform.

## Base URL
- Development: `http://localhost:3000`
- Production: `https://your-domain.vercel.app`

## Authentication
All protected endpoints require JWT authentication via `Authorization` header or HTTP-only cookie.

## Response Format
All API responses follow this structure:
```typescript
{
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}
```

---

## 🔐 Authentication APIs

### POST `/api/auth/login`
User authentication endpoint.

**Request:**
```typescript
{
  email: string;
  password: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    token: string;
    user: {
      id: number;
      email: string;
      username: string;
      role: string;
    }
  }
}
```

**Example:**
```bash
curl -X POST /api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### POST `/api/auth/logout`
User logout endpoint.

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

---

## 🏪 Restaurant APIs

### GET `/api/restaurants`
Get all restaurants.

**Response:**
```typescript
{
  success: boolean;
  data: {
    restaurants: Restaurant[];
  }
}
```

### GET `/api/restaurants/[id]`
Get restaurant by ID with its boxes.

**Response:**
```typescript
{
  success: boolean;
  data: {
    restaurant: Restaurant & {
      boxes: Box[];
    }
  }
}
```

---

## 📦 Box (Food Item) APIs

### GET `/api/boxes`
Get all boxes with optional filtering.

**Query Parameters:**
- `restaurantId?: number` - Filter by restaurant
- `available?: boolean` - Filter by availability

**Response:**
```typescript
{
  success: boolean;
  data: {
    boxes: Box[];
  }
}
```

### POST `/api/boxes/by-ids`
Get multiple boxes by their IDs.

**Request:**
```typescript
{
  boxIds: number[];
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    boxes: Box[];
  }
}
```

---

## 📋 Order APIs

### GET `/api/orders/me`
Get current user's orders with grouping and statistics.

**Response:**
```typescript
{
  success: boolean;
  data: {
    orders: Order[];
    groupedOrders: {
      [restaurantName: string]: {
        [date: string]: Order[];
      }
    };
    stats: {
      total: number;
      active: number;
      completed: number;
      cancelled: number;
    }
  }
}
```

### POST `/api/orders/bulk`
Create multiple orders in a single request.

**Request:**
```typescript
{
  items: Array<{
    boxId: number;
    quantity: number;
  }>;
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    orders: Order[];
    summary: {
      totalItems: number;
      totalAmount: number;
      orderIds: number[];
    }
  }
}
```

### POST `/api/orders/create`
Create a single order.

**Request:**
```typescript
{
  boxId: number;
  quantity: number;
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    order: Order;
    message: string;
  }
}
```

### DELETE `/api/orders/[id]/cancel`
Cancel an order by ID.

**Response:**
```typescript
{
  success: boolean;
  data: {
    order: Order;
    message: string;
  }
}
```

---

## ❤️ Wishlist APIs

### GET `/api/wishlist`
Get user's wishlist (basic format).

**Response:**
```typescript
{
  success: boolean;
  data: {
    wishlist: {
      userId: number;
      items: WishlistItem[];
      itemCount: number;
      createdAt: Date | null;
      updatedAt: Date | null;
    }
  }
}
```

### GET `/api/wishlist/populated`
Get user's wishlist with populated box and restaurant data.

**Response:**
```typescript
{
  success: boolean;
  data: {
    wishlist: {
      userId: number;
      items: PopulatedWishlistItem[];
      itemCount: number;
      availableCount: number;
      unavailableCount: number;
      groupedItems: {
        available: PopulatedWishlistItem[];
        unavailable: PopulatedWishlistItem[];
      }
    }
  }
}
```

**PopulatedWishlistItem Interface:**
```typescript
interface PopulatedWishlistItem {
  boxId: number;
  addedAt: string;
  priority: 'low' | 'medium' | 'high';
  notes: string;        // Sentinel value: empty string
  quantity: number;
  box: {
    id: number;
    title: string;
    price: number;
    quantity: number;
    image: string;      // Sentinel value: empty string
    isAvailable: boolean;
    restaurant: {
      id: number;       // Sentinel value: -1 for unknown
      name: string;
      description: string; // Sentinel value: empty string
      phoneNumber: string; // Sentinel value: empty string
    };
  };
}
```

### POST `/api/wishlist`
Add item to wishlist.

**Request:**
```typescript
{
  boxId: number;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
  quantity?: number;
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    wishlist: Wishlist;
    message: string;
  }
}
```

### POST `/api/wishlist/sync`
Sync local wishlist items with server.

**Request:**
```typescript
{
  localItems: Array<{
    boxId: number;
    priority: 'low' | 'medium' | 'high';
    notes?: string;
    quantity: number;
  }>;
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    wishlist: Wishlist;
    message: string;
    syncedItemsCount: number;
    mergedItemsCount: number;
  }
}
```

### PATCH `/api/wishlist/[boxId]`
Update wishlist item by box ID.

**Request:**
```typescript
{
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
  quantity?: number;
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    wishlist: Wishlist;
    message: string;
  }
}
```

### DELETE `/api/wishlist/[boxId]`
Remove item from wishlist by box ID.

**Response:**
```typescript
{
  success: boolean;
  data: {
    wishlist: Wishlist;
    message: string;
  }
}
```

### DELETE `/api/wishlist`
Clear entire wishlist.

**Response:**
```typescript
{
  success: boolean;
  data: {
    message: string;
  }
}
```

---

## 📰 Feed API

### GET `/api/feed`
Get paginated feed of available boxes.

**Query Parameters:**
- `page?: number` - Page number (default: 1)
- `limit?: number` - Items per page (default: 12)

**Response:**
```typescript
{
  success: boolean;
  data: {
    boxes: Box[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    }
  }
}
```

---

## 👨‍💼 Admin APIs

### GET `/api/admin/orders`
Get all orders (admin only).

**Response:**
```typescript
{
  success: boolean;
  data: {
    orders: Order[];
  }
}
```

### DELETE `/api/admin/orders/[id]/cancel`
Cancel order as admin.

**Response:**
```typescript
{
  success: boolean;
  data: {
    order: Order;
    message: string;
  }
}
```

---

## 🏪 Restaurant Management APIs

### GET `/api/restaurant/boxes`
Get boxes for restaurant owner.

**Response:**
```typescript
{
  success: boolean;
  data: {
    boxes: Box[];
  }
}
```

### POST `/api/restaurant/boxes/create`
Create new box (restaurant owner only).

**Request:**
```typescript
{
  title: string;
  price: number;
  quantity: number;
  image?: string;
  restaurantId: number;
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    box: Box;
    message: string;
  }
}
```

### PATCH `/api/restaurant/boxes/[id]`
Update box (restaurant owner only).

**Request:**
```typescript
{
  title?: string;
  price?: number;
  quantity?: number;
  image?: string;
  isAvailable?: boolean;
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    box: Box;
    message: string;
  }
}
```

---

## 🔒 Authentication Middleware

All protected endpoints use the `withAuth` middleware which:
1. Validates JWT token from Authorization header or cookie
2. Attaches user data to `req.user`
3. Returns 401 for invalid/missing tokens

**Usage:**
```typescript
export default withAuth()(handler);
```

---

## ❌ Error Handling

### Common Error Responses

**400 Bad Request:**
```typescript
{
  success: false;
  error: "Validation error message"
}
```

**401 Unauthorized:**
```typescript
{
  success: false;
  error: "Authentication required"
}
```

**403 Forbidden:**
```typescript
{
  success: false;
  error: "Insufficient permissions"
}
```

**404 Not Found:**
```typescript
{
  success: false;
  error: "Resource not found"
}
```

**500 Internal Server Error:**
```typescript
{
  success: false;
  error: "Internal server error"
}
```

---

## 🧪 Testing APIs

### Using cURL
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Get restaurants
curl -X GET http://localhost:3000/api/restaurants \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Add to wishlist
curl -X POST http://localhost:3000/api/wishlist \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"boxId":1,"priority":"high","quantity":2}'
```

### Using JavaScript/Fetch
```javascript
// Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'password' })
});

// Get populated wishlist
const wishlistResponse = await fetch('/api/wishlist/populated', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## 📊 Rate Limiting

Currently no rate limiting is implemented, but consider adding:
- 100 requests per minute for general endpoints
- 10 requests per minute for authentication endpoints
- 500 requests per minute for feed/search endpoints

## 🔄 API Versioning

All APIs are currently v1. Future versions should use:
- URL versioning: `/api/v2/restaurants`
- Header versioning: `Accept: application/vnd.wyzly.v2+json`