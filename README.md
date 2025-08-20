# Wyzly Food Delivery Platform

A modern food delivery platform built with Next.js, Prisma, MongoDB, and TypeScript. Enables customers to browse restaurants, manage wishlists, and place orders.

## 📚 Documentation

- **[API Specification](./docs/api-specification.md)** - Complete API endpoints with request/response schemas
- **[Domain Models](./docs/domain-models.md)** - Database entities, relationships, and business logic
- **[Design System](./docs/design-system.md)** - Components, tokens, and design guidelines
- **[Technical Debt](./docs/technical-debt.md)** - Performance, security, and code quality improvements

## 🏗️ Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Prisma) + MongoDB (Mongoose)
- **Authentication**: JWT with middleware
- **Styling**: Tailwind CSS + Custom Design System
- **Deployment**: Vercel

### Database Architecture
- **PostgreSQL (Prisma)**: Core business data (Users, Restaurants, Boxes, Orders, Payments)
- **MongoDB (Mongoose)**: User preferences and wishlist data

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (Supabase recommended)
- MongoDB database (MongoDB Atlas recommended)

### Installation
```bash
git clone https://github.com/your-username/wyzly-code.git
cd wyzly-code
npm install
```

### Environment Setup
```bash
cp .env.example .env.local
# Edit .env.local with your database URLs and secrets
```

### Database Setup
```bash
npx prisma generate
npx prisma migrate dev
npm run seed
```

### Development
```bash
npm run dev
# Open http://localhost:3000
```

## 🏆 Key Features

- **Multi-Database Architecture**: PostgreSQL for transactions, MongoDB for user preferences
- **Real-time Inventory**: Live stock tracking with automatic updates
- **Wishlist Management**: Cross-device wishlist synchronization
- **Order Management**: Bulk ordering with cancellation support  
- **Responsive Design**: Mobile-first design system
- **Type Safety**: Full TypeScript coverage with strict mode

## 🛠️ Development

### Setup
```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed database
npm run seed

# Start development server
npm run dev
```

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://..."
MONGODB_URI="mongodb://..."

# Authentication
JWT_SECRET="your-jwt-secret"

# Supabase (if using)
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
```

### Build Commands
```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🚀 Deployment

### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

### Database Setup
1. **PostgreSQL**: Set up Supabase or similar service
2. **MongoDB**: Set up MongoDB Atlas or similar service
3. Add IP whitelist for Vercel deployment

### Build Configuration
The build process includes:
1. `prisma generate` - Generates Prisma client
2. `next build` - Builds Next.js application
3. Type checking and linting

## 📁 Project Structure

```
├── app/                    # Next.js App Router pages
├── lib/
│   ├── components/         # Reusable React components
│   ├── design-system/      # Design system components
│   ├── hooks/             # Custom React hooks
│   ├── models/            # MongoDB models (Mongoose)
│   ├── middleware/        # Authentication middleware
│   ├── prisma.ts          # Prisma client
│   └── utils/             # Utility functions
├── pages/api/             # API routes
├── prisma/                # Database schema and migrations
├── public/                # Static assets
└── styles/                # Global styles
```

## 🔒 Security

### Authentication Flow
1. User login via `/api/auth/login`
2. JWT token issued and stored in HTTP-only cookie
3. Middleware validates token on protected routes
4. User data attached to request object

### Data Protection
- Passwords hashed with bcrypt
- Sensitive fields excluded from API responses
- Input validation on all endpoints
- SQL injection protection via Prisma
- XSS protection via Next.js built-ins

### API Security
- Rate limiting on sensitive endpoints
- CORS configuration
- Request validation with TypeScript interfaces
- Error handling without information leakage

## 📊 Performance

### Optimization Strategies
- Static site generation where applicable
- API route optimization with proper indexing
- Image optimization with Next.js Image component
- Bundle size optimization
- Database query optimization

### Monitoring
- Error tracking and logging
- Performance metrics
- Database query performance
- API response times

## 🤝 Contributing

### Code Standards
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Conventional commit messages

### Development Workflow
1. Create feature branch
2. Implement changes with tests
3. Run linting and type checking
4. Create pull request
5. Code review and merge

---

**Built with ❤️ using Next.js, Prisma, and TypeScript**