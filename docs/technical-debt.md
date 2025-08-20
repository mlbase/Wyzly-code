# Technical Debt

This document identifies technical debt, performance bottlenecks, security vulnerabilities, and optimization opportunities in the Wyzly Food Delivery Platform.

## 🔴 Critical Issues (High Priority)

### 1. Logging and Error Handling Improvements

**Issue**: Excessive console.log/console.error usage throughout the codebase
- **Files**: All API routes, hooks, components (50+ instances)
- **Impact**: Production logs cluttered, no structured logging
- **Risk**: Performance degradation, log storage costs

**Solution**:
```typescript
// Replace console.* with structured logger
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'error' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

### 2. Type Safety Issues

**Issue**: Extensive use of `any` types compromising type safety
- **Location**: API routes, database queries (20+ instances)
- **Examples**: 
  - `const where: any = {}` in feed/boxes APIs
  - `res: any` parameter types
  - `any[]` arrays in bulk operations

**Impact**: 
- Runtime errors not caught at compile time
- Poor developer experience
- Potential data corruption

**Solution**:
```typescript
// Replace with proper types
interface BoxWhereClause {
  isAvailable?: boolean;
  restaurantId?: number;
  title?: {
    contains: string;
    mode: 'insensitive';
  };
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

### 3. Inventory Concurrency Issues (Race Conditions)

**Issue**: Critical race conditions causing overbooking and inventory inconsistencies
- **Location**: `/api/orders/bulk`, `/api/orders/create`, `/api/orders/[id]/cancel`
- **Impact**: 
  - **Overbooking**: Multiple users can order the same item when stock is low
  - **Negative Inventory**: Inventory can go below zero due to race conditions
  - **Overcanceling**: Multiple cancellations can restore more inventory than originally reserved
  - **Data Corruption**: Inconsistent inventory states across concurrent operations

**Current Vulnerable Pattern**:
```typescript
// ❌ Race condition in order creation
const box = await tx.box.findUnique({ where: { id: boxId } });
if (box.quantity < requestedQuantity) {
  throw new Error('Insufficient inventory');
}
// ⚠️ Between this check and update, another transaction could modify inventory
await tx.box.update({
  where: { id: boxId },
  data: { quantity: box.quantity - requestedQuantity }
});
```

**Race Condition Scenarios**:
1. **Overbooking**: User A and B simultaneously order last 2 items, both see quantity=2, both succeed
2. **Cancel Race**: Order cancelled twice simultaneously, restores inventory twice  
3. **Mixed Operations**: Order creation and cancellation happening simultaneously
4. **Negative Stock**: Concurrent operations can drive inventory below zero

**Business Risk**: 
- Customer dissatisfaction from cancelled orders
- Revenue loss from overselling
- Inventory management complexity
- Data integrity issues

### 4. Database Query Optimization

**Issue**: N+1 queries and missing indexes
- **Location**: Order grouping, wishlist population
- **Impact**: Poor performance with large datasets

**Examples**:
```typescript
// ❌ Inefficient - potential N+1 queries
const orders = await prisma.order.findMany({ include: { box: { include: { restaurant: true } } } });

// ✅ Optimized with proper joins and pagination
const orders = await prisma.order.findMany({
  where: { userId },
  include: {
    box: {
      select: {
        id: true,
        title: true,
        price: true,
        restaurant: {
          select: { id: true, name: true }
        }
      }
    }
  },
  orderBy: { createdAt: 'desc' },
  take: 20,
  skip: page * 20
});
```

## 🟡 Medium Priority Issues

### 4. Input Validation Inconsistency

**Issue**: Inconsistent input validation across API endpoints
- **Files**: Most API routes lack comprehensive validation
- **Risk**: Data integrity issues, potential injection attacks

**Current State**:
```typescript
// ❌ Basic validation only
const { boxId, priority, notes, quantity } = req.body;
if (!boxId || typeof boxId !== 'number') {
  return res.status(400).json({ success: false, error: 'Valid boxId is required' });
}
```

**Recommended**:
```typescript
// ✅ Use Zod for comprehensive validation
import { z } from 'zod';

const wishlistItemSchema = z.object({
  boxId: z.number().positive(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  notes: z.string().max(500).optional(),
  quantity: z.number().int().min(1).max(99)
});

const { boxId, priority, notes, quantity } = wishlistItemSchema.parse(req.body);
```

### 5. Cross-Database Consistency

**Issue**: No referential integrity between PostgreSQL and MongoDB
- **Risk**: Orphaned wishlist items, data inconsistency
- **Current**: Manual cleanup required

**Solution**:
```typescript
// Implement data consistency service
class DataConsistencyService {
  static async validateCrossDbReferences(): Promise<void> {
    // Validate wishlist items against PostgreSQL boxes
    const wishlists = await Wishlist.find({});
    const allBoxIds = wishlists.flatMap(w => w.items.map(i => i.boxId));
    const existingBoxes = await prisma.box.findMany({
      where: { id: { in: allBoxIds } },
      select: { id: true }
    });
    
    const validBoxIds = new Set(existingBoxes.map(b => b.id));
    
    // Clean up orphaned items
    for (const wishlist of wishlists) {
      const validItems = wishlist.items.filter(item => validBoxIds.has(item.boxId));
      if (validItems.length !== wishlist.items.length) {
        wishlist.items = validItems;
        await wishlist.save();
      }
    }
  }
}
```

### 6. Wishlist Sync Optimization

**Issue**: Inefficient wishlist synchronization between client and server
- **Location**: `/api/wishlist/sync`, `useWishlist` hook
- **Problems**:
  - Full wishlist replacement on every sync
  - No differential updates (only changed items)
  - Excessive database writes for unchanged data
  - No conflict resolution for concurrent modifications
  - Heavy payload for large wishlists

**Current Implementation Issues**:
```typescript
// ❌ Current approach - replaces entire wishlist
const mergedItems = [];
// Add all local items (overwrites server data)
for (const localItem of localItems) {
  mergedItems.push({
    userId,
    boxId: localItem.boxId,
    addedAt: new Date(), // ❌ Always updates timestamp
    priority: localItem.priority || 'medium',
    notes: localItem.notes,
    quantity: localItem.quantity || 1
  });
}
```



**Performance Improvements**:
- Reduce database writes by 70-90%
- Minimize network payload size
- Implement optimistic updates on client
- Add wishlist versioning for conflict detection

### 7. Missing Error Recovery

**Issue**: No retry logic for failed operations
- **Location**: API calls, database operations
- **Impact**: Poor user experience during transient failures

**Solution**:
```typescript
// Implement retry wrapper
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxRetries) break;
      
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
}
```

## 🟢 Low Priority Optimizations

### 7. Frontend State Management

**Issue**: Local state scattered across components
- **Files**: Multiple hooks (useWishlist, useAuth)
- **Solution**: Consider Zustand or Redux Toolkit for global state

### 8. Bundle Size Optimization

**Issue**: Large JavaScript bundles
- **Solution**: 
  - Implement dynamic imports
  - Tree-shake unused dependencies
  - Use Next.js bundle analyzer

### 9. Caching Strategy

**Issue**: No caching for frequently accessed data
- **Recommendation**: 
  - Redis for session data
  - Next.js ISR for restaurant/box data
  - Client-side caching with SWR/React Query

## 🔒 Security Vulnerabilities

### 10. Rate Limiting Missing

**Issue**: No rate limiting on API endpoints
- **Risk**: DoS attacks, resource exhaustion
- **Solution**: Implement rate limiting middleware

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
```

### 11. JWT Token Security

**Issue**: JWT tokens stored in localStorage (if applicable)
- **Risk**: XSS attacks can steal tokens
- **Current**: HTTP-only cookies (✅ Good)
- **Recommendation**: Add CSRF protection

### 12. Input Sanitization

**Issue**: User inputs not sanitized for XSS
- **Location**: Notes fields, search parameters
- **Solution**: Use DOMPurify for HTML sanitization

```typescript
import DOMPurify from 'isomorphic-dompurify';

const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
};
```

### 13. SQL Injection Prevention

**Issue**: Dynamic query building in some endpoints
- **Current**: Prisma provides good protection
- **Risk**: Custom queries could be vulnerable
- **Recommendation**: Always use parameterized queries

## 🚀 Performance Optimization Opportunities

### 14. Database Indexing

**Missing Indexes**:
```sql
-- Add these indexes for better performance
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at DESC);
CREATE INDEX idx_boxes_available_restaurant ON boxes(is_available, restaurant_id);
CREATE INDEX idx_wishlist_user_box ON wishlists(user_id, 'items.boxId');
```

### 15. Image Optimization

**Issue**: No image optimization pipeline
- **Solution**: 
  - Use Next.js Image component
  - Implement WebP format
  - Add CDN integration (Cloudinary/AWS S3)

### 16. API Response Caching

**Cacheable Endpoints**:
- `/api/restaurants` - Cache for 5 minutes
- `/api/boxes` - Cache for 2 minutes
- `/api/feed` - Cache for 1 minute

```typescript
// Add caching middleware
const cache = new Map<string, { data: any; expires: number }>();

const cacheMiddleware = (ttl: number) => (handler: NextApiHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const key = `${req.method}:${req.url}`;
    const cached = cache.get(key);
    
    if (cached && cached.expires > Date.now()) {
      return res.json(cached.data);
    }
    
    // Store original res.json
    const originalJson = res.json;
    res.json = (data: any) => {
      cache.set(key, { data, expires: Date.now() + ttl });
      return originalJson.call(res, data);
    };
    
    return handler(req, res);
  };
};
```

## 🏗️ Architecture Improvements

### 17. Service Layer Pattern

**Issue**: Business logic mixed in API routes
- **Solution**: Extract services for better testability

```typescript
// Create service layer
class OrderService {
  static async createBulkOrder(userId: number, items: OrderItem[]): Promise<Order[]> {
    return await prisma.$transaction(async (tx) => {
      // Business logic here
    });
  }
}

// Use in API route
export default withAuth()(async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const orders = await OrderService.createBulkOrder(req.user.id, req.body.items);
    res.json({ success: true, data: { orders } });
  } catch (error) {
    handleApiError(error, res);
  }
});
```

### 18. Environment Configuration

**Issue**: Hardcoded configuration values
- **Solution**: Centralized config management

```typescript
// lib/config/index.ts
export const config = {
  database: {
    postgresql: process.env.DATABASE_URL!,
    mongodb: process.env.MONGODB_URI!,
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
  cache: {
    ttl: {
      restaurants: 5 * 60 * 1000, // 5 minutes
      boxes: 2 * 60 * 1000,       // 2 minutes
      feed: 1 * 60 * 1000,        // 1 minute
    }
  }
} as const;
```


## 🧪 Testing Gaps

### Unit Testing
- **Coverage**: ~0% (no tests found)
- **Priority**: API route handlers, utility functions
- **Framework**: Jest + Testing Library

### Integration Testing
- **Missing**: Database integration tests
- **Priority**: Order flow, payment processing

### E2E Testing
- **Missing**: User journeys
- **Recommendation**: Playwright or Cypress

## 📊 Monitoring and Observability

### Missing Capabilities
- **APM**: No application performance monitoring
- **Error Tracking**: No centralized error reporting
- **Metrics**: No business metrics collection

### Recommendations
- **Sentry**: Error tracking and performance monitoring
- **DataDog/New Relic**: APM and infrastructure monitoring
- **Custom Metrics**: Order completion rates, API latency

## 💰 Technical Debt Cost Estimation

| Priority | Item | Effort (Days) | Risk Level | Business Impact |
|----------|------|---------------|------------|-----------------|
| **CRITICAL** | **Inventory Concurrency Issues** | **6** | **CRITICAL** | **CRITICAL** |
| Critical | Logging Infrastructure | 3 | High | High |
| Critical | Type Safety Fixes | 5 | High | Medium |
| Critical | Query Optimization | 4 | Medium | High |
| Medium   | Wishlist Sync Optimization | 4 | Medium | High |
| Medium   | Input Validation | 3 | Medium | Medium |
| Medium   | Error Recovery | 2 | Low | Medium |
| Low      | Caching Strategy | 4 | Low | Medium |

**Total Estimated Effort**: 31 days
**Risk Reduction**: 70%
**Performance Improvement**: 50-80%

## 🎯 Success Metrics

- **Performance**: API response time < 200ms (95th percentile)
- **Reliability**: 99.9% uptime, error rate < 0.1%
- **Security**: Zero critical vulnerabilities
- **Maintainability**: Code coverage > 80%
- **Type Safety**: Zero `any` types in production code

---

This technical debt document should be reviewed monthly and updated as the codebase evolves. Priority should be given to items that impact security, performance, or user experience.