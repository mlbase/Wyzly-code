# Design System

Complete design system documentation for the Wyzly Food Delivery Platform.

## 🎨 Design Philosophy

The Wyzly design system is built on principles of:
- **Consistency**: Unified visual language across all touchpoints
- **Accessibility**: WCAG 2.1 AA compliance for inclusive design
- **Scalability**: Modular components that grow with the platform
- **Performance**: Optimized components with minimal bundle impact
- **Developer Experience**: Type-safe components with excellent IntelliSense

---

## 🎯 Design Tokens

Design tokens are the foundational elements of our design system, stored in `/lib/design-system/tokens.ts`.

### Colors

#### Primary Palette
```typescript
const primary = {
  50: '#eff6ff',   // Lightest blue - backgrounds, subtle highlights
  100: '#dbeafe',  // Light blue - hover states, borders
  500: '#3b82f6',  // Main brand blue - primary buttons, links
  600: '#2563eb',  // Darker blue - button hover, active states
  700: '#1d4ed8'   // Darkest blue - focused states, emphasis
};
```

**Usage:**
- `primary-500`: Main brand color for CTAs and primary actions
- `primary-100`: Subtle backgrounds and light borders
- `primary-700`: High-contrast text and focused states

#### Secondary (Gray) Palette
```typescript
const secondary = {
  50: '#f9fafb',   // Page backgrounds
  100: '#f3f4f6',  // Card backgrounds
  500: '#6b7280',  // Body text
  600: '#4b5563',  // Headings
  700: '#374151',  // Dark text
  800: '#1f2937',  // Emphasis text
  900: '#111827'   // Maximum contrast
};
```

**Usage:**
- `secondary-900`: Headlines and high-contrast text
- `secondary-500`: Body text and secondary content
- `secondary-100`: Card backgrounds and subtle dividers

#### Semantic Colors

**Success (Green)**
```typescript
const success = {
  50: '#ecfdf5',   // Success backgrounds
  100: '#d1fae5',  // Light success states
  500: '#10b981',  // Success buttons, icons
  600: '#059669',  // Success button hover
  700: '#047857'   // Success text
};
```

**Warning (Amber)**
```typescript
const warning = {
  50: '#fffbeb',   // Warning backgrounds
  100: '#fef3c7',  // Light warning states
  500: '#f59e0b',  // Warning buttons, icons
  600: '#d97706',  // Warning button hover
  700: '#b45309'   // Warning text
};
```

**Danger (Red)**
```typescript
const danger = {
  50: '#fef2f2',   // Error backgrounds
  100: '#fee2e2',  // Light error states
  500: '#ef4444',  // Error buttons, icons
  600: '#dc2626',  // Error button hover
  700: '#b91c1c'   // Error text
};
```

**Brand Orange (Food Theme)**
```typescript
const orange = {
  500: '#f97316',  // Food imagery, accent buttons
  600: '#ea580c'   // Hover states
};
```

### Typography

#### Font Sizes
```typescript
const fontSize = {
  xs: '0.75rem',    // 12px - Small captions, fine print
  sm: '0.875rem',   // 14px - Small text, metadata
  base: '1rem',     // 16px - Body text, default
  lg: '1.125rem',   // 18px - Large body text
  xl: '1.25rem',    // 20px - Small headings
  '2xl': '1.5rem',  // 24px - Section headings
  '3xl': '1.875rem' // 30px - Page titles
};
```

#### Font Weights
- **400 (normal)**: Body text
- **500 (medium)**: Buttons, emphasis
- **600 (semibold)**: Headings, labels
- **700 (bold)**: Important headings

#### Line Heights
- **1.25**: Tight spacing for headings
- **1.5**: Normal spacing for body text
- **1.75**: Loose spacing for captions

### Spacing

```typescript
const spacing = {
  xs: '0.5rem',     // 8px - Small gaps, padding
  sm: '0.75rem',    // 12px - Compact layouts
  md: '1rem',       // 16px - Standard spacing
  lg: '1.5rem',     // 24px - Section spacing
  xl: '2rem',       // 32px - Large gaps
  '2xl': '3rem'     // 48px - Page-level spacing
};
```

**Usage Guidelines:**
- Use `xs-sm` for component internal spacing
- Use `md-lg` for component-to-component spacing
- Use `xl-2xl` for section-level spacing

### Border Radius

```typescript
const borderRadius = {
  sm: '0.5rem',     // 8px - Buttons, small cards
  md: '0.75rem',    // 12px - Standard cards
  lg: '1rem',       // 16px - Large cards
  xl: '1.5rem',     // 24px - Hero sections
  '2xl': '2rem'     // 32px - Special elements
};
```

### Shadows

```typescript
const boxShadow = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',          // Subtle depth
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',        // Standard cards
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',      // Floating elements
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',      // Modals, popovers
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)'  // Hero elements
};
```

### Z-Index Scale

```typescript
const zIndex = {
  dropdown: 1000,   // Dropdown menus
  sticky: 1020,     // Sticky headers
  fixed: 1030,      // Fixed navigation
  modal: 9999,      // Modal overlays
  toast: 10000      // Toast notifications (highest)
};
```

### Transitions

```typescript
const transition = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',    // Quick interactions
  normal: '300ms cubic-bezier(0.4, 0, 0.2, 1)',  // Standard animations
  slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)'     // Smooth page transitions
};
```

---

## 🧩 Component Library

### Button

The foundational interactive element with variants and states.

#### Props Interface
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}
```

#### Variants

**Primary Button**
```tsx
<Button variant="primary" size="md">
  Order Now
</Button>
```
- Use for primary actions (submit, purchase, continue)
- Blue background with white text
- High contrast and prominence

**Secondary Button**
```tsx
<Button variant="secondary" size="md">
  Cancel
</Button>
```
- Use for secondary actions (cancel, back, alternative)
- White background with gray border
- Lower visual hierarchy

**Danger Button**
```tsx
<Button variant="danger" size="md">
  Delete Order
</Button>
```
- Use for destructive actions
- Red background with white text
- Clear warning signal

**Ghost Button**
```tsx
<Button variant="ghost" size="sm">
  Learn More
</Button>
```
- Use for tertiary actions
- Transparent background
- Minimal visual impact

#### Sizes
- `sm`: Compact buttons (32px height)
- `md`: Standard buttons (40px height)
- `lg`: Large buttons (48px height)
- `xl`: Hero buttons (56px height)

#### States
- **Default**: Normal interactive state
- **Hover**: Enhanced visual feedback
- **Focus**: Keyboard navigation highlight
- **Disabled**: Non-interactive state
- **Loading**: Processing state with spinner

### Card

Flexible container component for content grouping.

#### Props Interface
```tsx
interface CardProps {
  variant?: 'default' | 'outlined' | 'elevated';
  radius?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  className?: string;
}
```

#### Usage Examples

**Default Card**
```tsx
<Card variant="default" radius="lg">
  <CardHeader>
    <h3 className="font-semibold">Restaurant Name</h3>
  </CardHeader>
  <CardContent>
    <p>Restaurant description and details...</p>
  </CardContent>
  <CardFooter>
    <Button variant="primary" size="sm">View Menu</Button>
  </CardFooter>
</Card>
```

**Elevated Card**
```tsx
<Card variant="elevated" radius="md" className="hover:shadow-xl transition-shadow">
  {/* Featured content with enhanced depth */}
</Card>
```

### Badge

Small status indicators for labels and categories.

#### Props Interface
```tsx
interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}
```

#### Usage Examples
```tsx
{/* Status indicators */}
<Badge variant="success" size="sm">Available</Badge>
<Badge variant="danger" size="sm">Sold Out</Badge>
<Badge variant="warning" size="sm">Limited</Badge>

{/* Category labels */}
<Badge variant="primary" size="md">Italian</Badge>
<Badge variant="secondary" size="md">Fast Food</Badge>
```

### Input

Form input component with validation states.

#### Props Interface
```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'outlined' | 'filled';
}
```

#### Usage Examples
```tsx
{/* Basic input */}
<Input
  type="email"
  label="Email Address"
  placeholder="Enter your email"
  required
/>

{/* Error state */}
<Input
  type="password"
  label="Password"
  error="Password must be at least 8 characters"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>

{/* With helper text */}
<Input
  type="text"
  label="Restaurant Name"
  helper="This will be displayed to customers"
  placeholder="Enter restaurant name"
/>
```

### Modal

Overlay component for focused interactions.

#### Usage Example
```tsx
<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
  <ModalHeader>
    <h2 className="text-xl font-semibold">Confirm Order</h2>
  </ModalHeader>
  <ModalBody>
    <div className="space-y-4">
      <p>Are you sure you want to place this order?</p>
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium">Order Summary</h3>
        <p>2x Margherita Pizza - $24.98</p>
        <p className="font-semibold">Total: $24.98</p>
      </div>
    </div>
  </ModalBody>
  <ModalFooter>
    <div className="flex space-x-3">
      <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleConfirmOrder}>
        Place Order
      </Button>
    </div>
  </ModalFooter>
</Modal>
```

### Toast

Notification component for user feedback.

#### Usage Example
```tsx
// Toast container (place once in app root)
<ToastContainer position="top-right" />

// Trigger toasts
import { toast } from '../lib/design-system';

const handleSuccess = () => {
  toast.success('Order placed successfully!');
};

const handleError = () => {
  toast.error('Failed to process payment');
};

const handleInfo = () => {
  toast.info('Your food is being prepared');
};
```

---

## 🎨 Specialized Components

### BoxCard

Food item card component with comprehensive functionality.

#### Features
- **Image Display**: Optimized images with fallback handling
- **Favorite Toggle**: Heart icon with smooth animations
- **Availability Status**: Clear visual indicators
- **Restaurant Info**: Clickable restaurant navigation
- **Price Display**: Consistent formatting
- **Stock Information**: Quantity remaining
- **Add to Cart**: Primary action with state management

#### Usage
```tsx
<BoxCard
  box={foodItem}
  onToggleFavorite={(boxId) => toggleFavorite(boxId)}
  onAddToWishlist={(box) => addToWishlist(box)}
  isFavorite={(boxId) => favorites.includes(boxId)}
  isInWishlist={(boxId) => wishlist.some(item => item.boxId === boxId)}
  showRestaurantInfo={true}
/>
```

### WishlistCard

Wishlist item display with quantity controls.

#### Features
- **Quantity Controls**: +/- buttons with validation
- **Priority Indicators**: Visual priority levels
- **Notes Display**: User-added notes
- **Remove Action**: Clear remove functionality
- **Availability Status**: Real-time stock checking

### WishlistSidebar

Sliding sidebar for wishlist management.

#### Features
- **Smooth Animations**: Slide in/out transitions
- **Item Management**: Add, remove, update quantities
- **Checkout Flow**: Direct path to order placement
- **Summary Display**: Total items and estimated cost

---

## 🎯 Design Patterns

### Layout Patterns

#### Grid Layouts
```tsx
{/* Responsive food grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {boxes.map(box => (
    <BoxCard key={box.id} box={box} {...handlers} />
  ))}
</div>

{/* Hero section */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
  <div className="space-y-6">
    <h1 className="text-4xl font-bold">Order food from local restaurants</h1>
    <Button variant="primary" size="lg">Get Started</Button>
  </div>
  <div className="relative">
    <img src="/hero-image.jpg" alt="Delicious food" className="rounded-2xl" />
  </div>
</div>
```

#### Navigation Patterns
```tsx
{/* Header navigation */}
<header className="bg-white border-b border-gray-200 sticky top-0 z-sticky">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-16">
      <Logo />
      <Navigation />
      <UserActions />
    </div>
  </div>
</header>

{/* Mobile bottom navigation */}
<nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-fixed md:hidden">
  <div className="grid grid-cols-4 gap-1">
    <NavItem icon={<HomeIcon />} label="Feed" active />
    <NavItem icon={<HeartIcon />} label="Wishlist" />
    <NavItem icon={<ClipboardIcon />} label="Orders" />
    <NavItem icon={<UserIcon />} label="Profile" />
  </div>
</nav>
```

### State Patterns

#### Loading States
```tsx
{/* Button loading state */}
<Button variant="primary" loading={isSubmitting}>
  {isSubmitting ? 'Placing Order...' : 'Place Order'}
</Button>

{/* Content loading state */}
<div className="space-y-4">
  {isLoading ? (
    Array(6).fill(0).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
        <div className="bg-gray-200 h-4 rounded mb-2"></div>
        <div className="bg-gray-200 h-4 rounded w-2/3"></div>
      </div>
    ))
  ) : (
    <FoodGrid items={boxes} />
  )}
</div>
```

#### Error States
```tsx
{/* Inline error display */}
<div className="bg-red-50 border border-red-200 rounded-lg p-4">
  <div className="flex items-start">
    <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
    <div>
      <h3 className="text-sm font-medium text-red-800">Order Failed</h3>
      <p className="text-sm text-red-700 mt-1">
        Unable to process your order. Please try again.
      </p>
      <Button variant="secondary" size="sm" className="mt-3" onClick={retry}>
        Try Again
      </Button>
    </div>
  </div>
</div>

{/* Empty state */}
<div className="text-center py-12">
  <ShoppingCartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
  <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
  <p className="text-gray-500 mb-6">Add some delicious items to get started!</p>
  <Button variant="primary" onClick={() => navigate('/feed')}>
    Browse Food
  </Button>
</div>
```

### Animation Patterns

#### Hover Effects
```css
.hover-lift {
  @apply transition-transform duration-200 hover:transform hover:-translate-y-1;
}

.hover-shadow {
  @apply transition-shadow duration-200 hover:shadow-lg;
}

.hover-scale {
  @apply transition-transform duration-200 hover:scale-105;
}
```

#### Page Transitions
```tsx
// Framer Motion page transitions
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  <PageContent />
</motion.div>
```

---

## 📱 Responsive Design

### Breakpoint System
```typescript
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Extra large desktop
};
```

### Mobile-First Approach
```css
/* Base styles for mobile */
.responsive-container {
  @apply px-4 py-6;
}

/* Tablet and up */
@screen md {
  .responsive-container {
    @apply px-6 py-8;
  }
}

/* Desktop and up */
@screen lg {
  .responsive-container {
    @apply px-8 py-12 max-w-7xl mx-auto;
  }
}
```

### Component Responsiveness
```tsx
{/* Responsive grid */}
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6 lg:gap-8">

{/* Responsive text sizes */}
<h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold">

{/* Responsive spacing */}
<div className="space-y-4 sm:space-y-6 lg:space-y-8">

{/* Responsive visibility */}
<div className="hidden sm:block lg:hidden xl:block">
```

---

## ♿ Accessibility Guidelines

### Color Contrast
- **AA Level**: Minimum 4.5:1 contrast ratio for normal text
- **AAA Level**: 7:1 contrast ratio for enhanced accessibility
- **Large Text**: 3:1 minimum for text 18pt+ or 14pt+ bold

### Focus Management
```css
/* Visible focus indicators */
.focus-visible {
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
}

/* Skip links */
.skip-link {
  @apply sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4;
  @apply bg-primary-600 text-white px-4 py-2 rounded-lg z-modal;
}
```

### Semantic HTML
```tsx
{/* Proper heading hierarchy */}
<main>
  <h1>Restaurant Name</h1>
  <section>
    <h2>Menu Categories</h2>
    <article>
      <h3>Pizza Selection</h3>
    </article>
  </section>
</main>

{/* Form accessibility */}
<form>
  <fieldset>
    <legend>Delivery Information</legend>
    <label htmlFor="address">Street Address</label>
    <input id="address" type="text" required aria-describedby="address-help" />
    <p id="address-help">Include apartment or suite number</p>
  </fieldset>
</form>

{/* Button accessibility */}
<button
  type="button"
  aria-label="Add Margherita Pizza to wishlist"
  aria-pressed={isInWishlist}
>
  <HeartIcon className="h-5 w-5" aria-hidden="true" />
</button>
```

### Screen Reader Support
```tsx
{/* Live regions for dynamic content */}
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

{/* Progress indicators */}
<div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
  <div className="bg-primary-600" style={{ width: `${progress}%` }} />
</div>

{/* Loading states */}
<div role="status" aria-label="Loading restaurant data">
  <LoadingSpinner />
  <span className="sr-only">Loading...</span>
</div>
```

---

## 🔧 Implementation Guidelines

### File Organization
```
lib/design-system/
├── index.ts          // Main exports
├── tokens.ts         // Design tokens
├── Button.tsx        // Button component
├── Card.tsx          // Card components
├── Modal.tsx         // Modal components
├── Input.tsx         // Form components
├── Toast.tsx         // Notification components
└── utils.ts          // Utility functions
```

### Import Patterns
```tsx
// Preferred: Named imports from main index
import { Button, Card, Badge, designTokens } from '../lib/design-system';

// Component usage with consistent props
<Button variant="primary" size="md" fullWidth>
  Submit
</Button>
```

### Customization
```tsx
// Custom button with design system base
const CustomButton = forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ variant = 'primary', className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        className={cn(
          // Custom overrides
          variant === 'primary' && 'bg-gradient-to-r from-orange-500 to-red-500',
          className
        )}
        {...props}
      />
    );
  }
);
```

### Testing Components
```tsx
// Component testing with design system
import { render, screen } from '@testing-library/react';
import { Button } from '../lib/design-system';

test('renders button with correct variant styles', () => {
  render(<Button variant="danger">Delete</Button>);
  const button = screen.getByRole('button', { name: /delete/i });
  expect(button).toHaveClass('bg-red-600');
});

test('button is accessible', () => {
  render(<Button disabled>Submit</Button>);
  const button = screen.getByRole('button');
  expect(button).toBeDisabled();
  expect(button).toHaveAttribute('aria-disabled', 'true');
});
```

---

This design system documentation provides comprehensive guidance for maintaining consistent, accessible, and scalable UI components across the Wyzly platform.