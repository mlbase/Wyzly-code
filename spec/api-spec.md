# Wyzly API Specification

## Overview
RESTful API for Wyzly Box food ordering system with role-based access control.

**Base URL:** `/api`  
**Authentication:** JWT Bearer tokens  
**Content-Type:** `application/json`

---

## Authentication

### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password",
  "role": "customer" | "restaurant" | "admin"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "username",
      "role": "customer"
    },
    "token": "jwt_token_here"
  }
}
```

### POST /api/auth/logout
Logout current user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET /api/auth/me
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "role": "customer",
    "phone_number": "+1-555-0001",
    "created_at": "2025-08-18T10:00:00Z"
  }
}
```

---

## Users Management

### POST /api/users
Create new user (registration).

**Request Body:**
```json
{
  "email": "new@example.com",
  "username": "newuser",
  "password": "password",
  "role": "customer",
  "phone_number": "+1-555-0001",
  "age": 25,
  "gender": "male",
  "address": "123 Main St"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "email": "new@example.com",
    "username": "newuser",
    "role": "customer"
  }
}
```

### GET /api/users
List all users (Admin only).

**Headers:** `Authorization: Bearer <token>`  
**Query Parameters:**
- `role`: Filter by role (optional)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "email": "user@example.com",
        "username": "username",
        "role": "customer",
        "created_at": "2025-08-18T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

## Restaurants

### GET /api/restaurants
Get all restaurants.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Pasta Palace",
      "phone_number": "+1-555-1001",
      "description": "Authentic Italian cuisine...",
      "owner_id": 2,
      "created_at": "2025-08-18T10:00:00Z"
    }
  ]
}
```

### GET /api/restaurants/:id
Get restaurant by ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Pasta Palace",
    "phone_number": "+1-555-1001",
    "description": "Authentic Italian cuisine...",
    "owner": {
      "id": 2,
      "username": "pasta_palace_owner"
    },
    "boxes": [
      {
        "id": 1,
        "title": "Classic Spaghetti Carbonara Box",
        "price": 15.99,
        "quantity": 25,
        "is_available": true
      }
    ]
  }
}
```

### POST /api/restaurants
Create restaurant (Restaurant owner only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "New Restaurant",
  "phone_number": "+1-555-0000",
  "description": "Great food here!"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "name": "New Restaurant",
    "phone_number": "+1-555-0000",
    "description": "Great food here!",
    "owner_id": 2
  }
}
```

---

## Boxes (Food Items)

### GET /api/boxes
Get all available boxes.

**Query Parameters:**
- `restaurant_id`: Filter by restaurant (optional)
- `available`: Filter by availability (optional)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "boxes": [
      {
        "id": 1,
        "title": "Classic Spaghetti Carbonara Box",
        "price": 15.99,
        "quantity": 25,
        "image": "/images/carbonara-box.jpg",
        "restaurant_id": 1,
        "is_available": true,
        "restaurant": {
          "id": 1,
          "name": "Pasta Palace"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 12,
      "totalPages": 1
    }
  }
}
```

### GET /api/boxes/:id
Get box by ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Classic Spaghetti Carbonara Box",
    "price": 15.99,
    "quantity": 25,
    "image": "/images/carbonara-box.jpg",
    "restaurant_id": 1,
    "is_available": true,
    "restaurant": {
      "id": 1,
      "name": "Pasta Palace",
      "phone_number": "+1-555-1001"
    }
  }
}
```

### POST /api/boxes
Create new box (Restaurant owner only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "New Delicious Box",
  "price": 12.99,
  "quantity": 50,
  "image": "/images/new-box.jpg",
  "restaurant_id": 1,
  "is_available": true
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 13,
    "title": "New Delicious Box",
    "price": 12.99,
    "quantity": 50,
    "image": "/images/new-box.jpg",
    "restaurant_id": 1,
    "is_available": true
  }
}
```

### PUT /api/boxes/:id
Update box (Restaurant owner only). quantity can`t changed by this api use inventorycommand api

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Updated Box Name",
  "price": 14.99,
  "quantity": 30,
  "is_available": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Updated Box Name",
    "price": 14.99,
    "quantity": 30,
    "is_available": true
  }
}
```

### POST /api/boxes/by-ids
Get multiple boxes by IDs (Public access).

**Request Body:**
```json
{
  "boxIds": [1, 5, 8, 12]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "boxes": [
      {
        "id": 1,
        "title": "Classic Spaghetti Carbonara Box",
        "price": 15.99,
        "quantity": 25,
        "image": "/images/carbonara-box.jpg",
        "isAvailable": true,
        "restaurant": {
          "id": 1,
          "name": "Pasta Palace",
          "description": "Authentic Italian cuisine...",
          "phoneNumber": "+1-555-1001"
        }
      }
    ],
    "requestedCount": 4,
    "foundCount": 1
  }
}
```

**Features:**
- **No authentication required** - supports offline wishlist functionality
- **Bulk fetch** - retrieve multiple boxes in single request
- **Rate limited** - maximum 100 box IDs per request
- **Missing box handling** - returns found boxes and reports counts

### DELETE /api/boxes/:id
Delete box (Restaurant owner only).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Box deleted successfully"
}
```

---

## Orders

### GET /api/orders
Get orders (role-based access).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status`: Filter by status (optional)
- `user_id`: Filter by user (Admin only)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 1,
        "user_id": 6,
        "box_id": 1,
        "quantity": 2,
        "total_price": 31.98,
        "status": "completed",
        "created_at": "2025-08-18T10:00:00Z",
        "user": {
          "id": 6,
          "username": "john_doe"
        },
        "box": {
          "id": 1,
          "title": "Classic Spaghetti Carbonara Box",
          "restaurant": {
            "name": "Pasta Palace"
          }
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 4,
      "totalPages": 1
    }
  }
}
```

### POST /api/orders
Create new order (Customer only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "box_id": 1,
  "quantity": 2
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "user_id": 6,
    "box_id": 1,
    "quantity": 2,
    "total_price": 31.98,
    "status": "pending",
    "created_at": "2025-08-18T11:00:00Z"
  }
}
```

### POST /api/orders/bulk
Create bulk order with multiple items (Customer only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "items": [
    { "boxId": 1, "quantity": 2 },
    { "boxId": 5, "quantity": 1 },
    { "boxId": 3, "quantity": 3 }
  ],
  "paymentMethod": "credit_card"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Bulk order created successfully",
  "data": {
    "orders": [
      {
        "id": 10,
        "userId": 6,
        "boxId": 1,
        "quantity": 2,
        "totalPrice": 31.98,
        "status": "confirmed",
        "boxTitle": "Classic Spaghetti Carbonara Box",
        "restaurantName": "Pasta Palace",
        "createdAt": "2025-08-18T11:00:00Z"
      }
    ],
    "payments": [
      {
        "id": 8,
        "orderId": 10,
        "amount": 31.98,
        "status": "completed",
        "method": "credit_card",
        "transactionId": "txn_1692358800000_10",
        "createdAt": "2025-08-18T11:00:00Z"
      }
    ],
    "restaurantGroups": [
      {
        "restaurantId": 1,
        "restaurantName": "Pasta Palace",
        "items": [
          {
            "boxId": 1,
            "boxTitle": "Classic Spaghetti Carbonara Box",
            "quantity": 2,
            "unitPrice": 15.99,
            "totalPrice": 31.98
          }
        ],
        "totalAmount": 31.98
      }
    ],
    "summary": {
      "totalOrders": 3,
      "totalAmount": 67.50,
      "restaurants": 2,
      "paymentMethod": "credit_card"
    }
  }
}
```

**Features:**
- **Transaction Safety**: All operations are atomic - if any step fails, everything rolls back
- **Multi-Restaurant Support**: Automatically groups orders by restaurant
- **Individual Payments**: Creates separate payments for each order item (enables individual cancellation)
- **Stock Management**: Validates availability and decreases quantities automatically
- **Inventory Tracking**: Records all quantity changes for audit trail

**Error Responses:**
- **400**: Invalid items array, insufficient stock, or boxes not found
- **401**: Authentication required
- **500**: Transaction failed or internal server error

### PUT /api/orders/:id/status
Update order status (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "completed"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "completed",
    "updated_at": "2025-08-18T11:00:00Z"
  }
}
```

---

## Inventory Management

### GET /api/inventory/commands
Get inventory commands (Restaurant owner & Admin).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `box_id`: Filter by box ID (optional)
- `type`: Filter by type (increase/decrease)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "commands": [
      {
        "id": 1,
        "type": "increase",
        "box_id": 1,
        "quantity": 5,
        "previous_quantity": 20,
        "created_at": "2025-08-18T10:00:00Z",
        "box": {
          "title": "Classic Spaghetti Carbonara Box"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

### POST /api/inventory/commands
Create inventory command (Restaurant owner only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "type": "increase",
  "box_id": 1,
  "quantity": 10
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 6,
    "type": "increase",
    "box_id": 1,
    "quantity": 10,
    "previous_quantity": 25,
    "created_at": "2025-08-18T11:00:00Z"
  }
}
```

---

## Payments

### POST /api/payments
Process payment (Customer only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "order_id": 5,
  "amount": 31.98,
  "method": "mock"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "order_id": 5,
    "amount": 31.98,
    "status": "completed",
    "method": "mock",
    "transaction_id": "mock_txn_123456789",
    "created_at": "2025-08-18T11:00:00Z"
  }
}
```

### GET /api/payments/:orderId
Get payment by order ID.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "order_id": 1,
    "amount": 31.98,
    "status": "completed",
    "method": "mock",
    "transaction_id": "mock_txn_123456789",
    "created_at": "2025-08-18T10:00:00Z"
  }
}
```

---

## Cancel Orders

### POST /api/orders/:id/cancel
Request order cancellation (Customer only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "reason": "Changed my mind"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "order_id": 5,
    "user_id": 6,
    "is_approved": false,
    "reason": "Changed my mind",
    "created_at": "2025-08-18T11:00:00Z"
  }
}
```

### PUT /api/cancel-orders/:id/approve
Approve cancellation request (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "is_approved": true,
    "approved_at": "2025-08-18T11:30:00Z"
  }
}
```

---

## Wishlist Management

### GET /api/wishlist/populated
Get user's wishlist with populated box data (Customer only).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "wishlist": {
      "userId": 6,
      "items": [
        {
          "boxId": 1,
          "addedAt": "2025-08-18T10:00:00Z",
          "priority": "medium",
          "notes": "Extra spicy please",
          "quantity": 2,
          "box": {
            "id": 1,
            "title": "Classic Spaghetti Carbonara Box",
            "price": 15.99,
            "quantity": 25,
            "image": "/images/carbonara-box.jpg",
            "isAvailable": true,
            "restaurant": {
              "id": 1,
              "name": "Pasta Palace"
            }
          }
        }
      ],
      "itemCount": 1,
      "availableCount": 1,
      "unavailableCount": 0,
      "groupedItems": {
        "available": [...],
        "unavailable": []
      },
      "createdAt": "2025-08-18T09:00:00Z",
      "updatedAt": "2025-08-18T10:00:00Z"
    }
  }
}
```

### POST /api/wishlist
Add item to wishlist (Customer only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "boxId": 1,
  "priority": "medium",
  "notes": "Extra spicy please",
  "quantity": 2
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Item added to wishlist"
}
```

### PATCH /api/wishlist/:boxId
Update wishlist item (Customer only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "priority": "high",
  "notes": "Changed my mind",
  "quantity": 3
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Wishlist item updated"
}
```

### DELETE /api/wishlist/:boxId
Remove item from wishlist (Customer only).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Item removed from wishlist"
}
```

### DELETE /api/wishlist
Clear entire wishlist (Customer only).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Wishlist cleared"
}
```

### POST /api/wishlist/sync
Sync offline wishlist data with server (Customer only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "localItems": [
    {
      "boxId": 1,
      "addedAt": "2025-08-18T10:00:00Z",
      "priority": "medium",
      "notes": "Extra spicy please",
      "quantity": 2
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Wishlist synced successfully",
  "data": {
    "mergedItemsCount": 1,
    "addedFromLocal": 1,
    "conflictsResolved": 0
  }
}
```

**Features:**
- **Offline Support**: Works without authentication, stores in localStorage
- **Auto-Sync**: Automatically syncs when user logs in
- **Conflict Resolution**: Local items take precedence over server items
- **MongoDB Storage**: Uses MongoDB for frequent add/remove operations
- **Priority Levels**: Support for low, medium, high priority items

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "email": ["Email is required"],
    "password": ["Password must be at least 6 characters"]
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid token or token expired"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Not found",
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "error": "Conflict",
  "message": "Email already exists"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Something went wrong"
}
```

---

## Status Codes Summary

- **200** - OK (Success)
- **201** - Created (Resource created)
- **400** - Bad Request (Validation error)
- **401** - Unauthorized (Authentication required)
- **403** - Forbidden (Insufficient permissions)
- **404** - Not Found (Resource not found)
- **409** - Conflict (Duplicate resource)
- **500** - Internal Server Error (Server error)

---

## Role-Based Permissions

### Customer
- View boxes and restaurants
- Create orders and payments  
- View own order history
- Request order cancellation

### Restaurant Owner
- Manage own restaurant details
- Create, update, delete own boxes
- Manage inventory for own boxes
- View orders for own boxes

### Admin
- View all users, orders, restaurants
- Update order statuses
- Approve cancellation requests
- Access all system data