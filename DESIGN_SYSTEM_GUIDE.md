# Wyzly Design System Guide

A comprehensive, sustainable UI component library built with TypeScript, Tailwind CSS, and CVA (Class Variance Authority).

## 📖 Table of Contents

1. [Quick Start](#quick-start)
2. [Design Tokens](#design-tokens)
3. [Components](#components)
4. [Best Practices](#best-practices)
5. [Migration Guide](#migration-guide)
6. [Development](#development)

---

## 🚀 Quick Start

### Installation

The design system is already set up in your project. Simply import components:

```typescript
import { Button, Card, Modal, Toast } from '../lib/design-system';
```

### Basic Usage

```tsx
// Button with variants
<Button variant="primary" size="lg">
  Click me
</Button>

// Card component
<Card variant="elevated" radius="lg">
  <CardHeader>
    <h3>Title</h3>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>

// Input with icons
<Input 
  placeholder="Search..." 
  leftIcon={<SearchIcon />}
  variant="filled"
/>
```

---

## 🎨 Design Tokens

Our design system is built on a foundation of design tokens for consistency and maintainability.

### Colors

```typescript
// Primary Colors
designTokens.colors.primary[50]   // #eff6ff (lightest)
designTokens.colors.primary[500]  // #3b82f6 (medium)
designTokens.colors.primary[600]  // #2563eb (default)
designTokens.colors.primary[700]  // #1d4ed8 (dark)

// Semantic Colors  
designTokens.colors.success[600]  // #059669 (success)
designTokens.colors.warning[600]  // #d97706 (warning)
designTokens.colors.danger[600]   // #dc2626 (danger/error)
```

### Spacing

```typescript
designTokens.spacing.xs    // 0.5rem (8px)
designTokens.spacing.sm    // 0.75rem (12px)
designTokens.spacing.md    // 1rem (16px) 
designTokens.spacing.lg    // 1.5rem (24px)
designTokens.spacing.xl    // 2rem (32px)
designTokens.spacing['2xl'] // 3rem (48px)
```

### Border Radius

```typescript
designTokens.borderRadius.sm   // 0.5rem (8px)
designTokens.borderRadius.md   // 0.75rem (12px)
designTokens.borderRadius.lg   // 1rem (16px)
designTokens.borderRadius.xl   // 1.5rem (24px)
```

### Z-Index

```typescript
designTokens.zIndex.dropdown  // 1000
designTokens.zIndex.modal     // 9999
designTokens.zIndex.toast     // 10000
```

---

## 🧩 Components

### Button

Versatile button component with multiple variants and states.

```tsx
import { Button } from '../lib/design-system';

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Delete</Button>
<Button variant="warning">Warning</Button>
<Button variant="ghost">Ghost</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>

// States
<Button loading>Loading...</Button>
<Button disabled>Disabled</Button>
<Button fullWidth>Full Width</Button>

// Custom styling
<Button 
  variant="primary" 
  size="lg"
  className="shadow-lg"
>
  Custom Button
</Button>
```

**Props:**
- `variant`: `'primary' | 'secondary' | 'danger' | 'warning' | 'ghost'`
- `size`: `'sm' | 'md' | 'lg' | 'xl'`
- `loading`: `boolean`
- `fullWidth`: `boolean`
- `disabled`: `boolean`

---

### Card

Flexible container component for organizing content.

```tsx
import { Card, CardHeader, CardContent, CardFooter } from '../lib/design-system';

// Basic card
<Card>
  Content goes here
</Card>

// Card with variants
<Card variant="default">Default shadow</Card>
<Card variant="elevated">Elevated shadow</Card>
<Card variant="outlined">Border only</Card>

// Full example
<Card variant="elevated" radius="lg">
  <CardHeader>
    <h3 className="text-lg font-semibold">Card Title</h3>
  </CardHeader>
  <CardContent>
    <p>This is the main content of the card.</p>
  </CardContent>
  <CardFooter>
    <Button variant="primary">Action</Button>
  </CardFooter>
</Card>

// Clickable card
<Card 
  onClick={() => console.log('Card clicked')}
  variant="default"
  className="hover:scale-105"
>
  Click me!
</Card>
```

**Props:**
- `variant`: `'default' | 'elevated' | 'outlined'`
- `radius`: `'md' | 'lg' | 'xl'`
- `padding`: `'none' | 'sm' | 'md' | 'lg'`
- `onClick`: `() => void` (makes card clickable)

---

### Input

Form input component with built-in validation and icon support.

```tsx
import { Input } from '../lib/design-system';
import { MagnifyingGlassIcon, EyeIcon } from '@heroicons/react/24/outline';

// Basic input
<Input 
  placeholder="Enter your name"
  label="Full Name"
/>

// With icons
<Input
  placeholder="Search..."
  leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
  rightIcon={<EyeIcon className="h-5 w-5" />}
/>

// Variants
<Input variant="default" placeholder="Default input" />
<Input variant="filled" placeholder="Filled background" />
<Input variant="ghost" placeholder="No background" />

// With validation
<Input
  label="Email"
  error="Please enter a valid email"
  placeholder="you@example.com"
/>

// Sizes
<Input size="sm" placeholder="Small" />
<Input size="md" placeholder="Medium" />
<Input size="lg" placeholder="Large" />
```

**Props:**
- `variant`: `'default' | 'filled' | 'ghost'`
- `size`: `'sm' | 'md' | 'lg'`
- `label`: `string`
- `error`: `string`
- `leftIcon`: `React.ReactNode`
- `rightIcon`: `React.ReactNode`

---

### Badge

Small status indicators and labels.

```tsx
import { Badge } from '../lib/design-system';

// Variants
<Badge variant="default">Default</Badge>
<Badge variant="primary">Primary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="danger">Error</Badge>
<Badge variant="outline">Outlined</Badge>

// Sizes
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>

// Use cases
<Badge variant="success" size="sm">Active</Badge>
<Badge variant="danger" size="sm">Sold Out</Badge>
<Badge variant="warning" size="sm">Pending</Badge>
```

**Props:**
- `variant`: `'default' | 'primary' | 'success' | 'warning' | 'danger' | 'outline'`
- `size`: `'sm' | 'md' | 'lg'`

---

### Modal System

Comprehensive modal system with multiple dialog types.

```tsx
import { 
  Modal, ModalHeader, ModalBody, ModalFooter,
  ConfirmDialog,
  ErrorDialog,
  InfoDialog,
  AlertDialog
} from '../lib/design-system';

// Custom Modal
<Modal isOpen={isOpen} onClose={onClose} size="lg">
  <ModalHeader onClose={onClose}>
    <h3>Modal Title</h3>
  </ModalHeader>
  <ModalBody>
    <p>Modal content goes here</p>
  </ModalBody>
  <ModalFooter>
    <Button variant="secondary" onClick={onClose}>
      Cancel
    </Button>
    <Button variant="primary" onClick={onConfirm}>
      Confirm
    </Button>
  </ModalFooter>
</Modal>

// Confirm Dialog
<ConfirmDialog
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleConfirm}
  variant="danger"
  title="Delete Item"
  message="Are you sure you want to delete this item?"
  description="This action cannot be undone."
  confirmLabel="Delete"
  cancelLabel="Cancel"
/>

// Error Dialog
<ErrorDialog
  isOpen={showError}
  onClose={() => setShowError(false)}
  title="Something went wrong"
  message="We couldn't process your request."
  description="Please try again later or contact support."
/>

// Info Dialog
<InfoDialog
  isOpen={showInfo}
  onClose={() => setShowInfo(false)}
  title="Welcome!"
  message="Thanks for joining us."
  actionLabel="Get Started"
/>
```

**Modal Props:**
- `isOpen`: `boolean`
- `onClose`: `() => void`
- `size`: `'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'`
- `closeOnBackdrop`: `boolean`

**Dialog Props:**
- `variant`: `'default' | 'danger' | 'warning'` (ConfirmDialog)
- `variant`: `'error' | 'warning'` (ErrorDialog)  
- `variant`: `'info' | 'success' | 'tip'` (InfoDialog)

---

### Toast Notifications

Non-blocking notifications for user feedback.

```tsx
import { Toast, ToastContainer } from '../lib/design-system';

// Toast Container (place once in your app)
<ToastContainer 
  toasts={toasts}
  onCloseToast={removeToast}
/>

// Individual Toast
<Toast
  id="unique-id"
  variant="success"
  title="Success!"
  message="Your changes have been saved."
  onClose={removeToast}
/>
```

**Toast Variants:**
- `success`: Green theme for success messages
- `error`: Red theme for error messages
- `warning`: Amber theme for warnings
- `info`: Blue theme for information

---

## ✨ Best Practices

### 1. Use Design Tokens

❌ **Don't:** Hardcode values
```tsx
<div style={{ padding: '24px', color: '#2563eb' }}>
```

✅ **Do:** Use design tokens
```tsx
<div style={{ 
  padding: designTokens.spacing.lg,
  color: designTokens.colors.primary[600]
}}>
```

### 2. Prefer Component Variants

❌ **Don't:** Custom styling every time
```tsx
<button className="bg-red-600 text-white px-4 py-2 rounded">
  Delete
</button>
```

✅ **Do:** Use component variants
```tsx
<Button variant="danger">
  Delete
</Button>
```

### 3. Maintain Consistency

❌ **Don't:** Mix styling approaches
```tsx
<div className="flex items-center">
  <Button variant="primary">Save</Button>
  <button style={{ backgroundColor: 'gray' }}>Cancel</button>
</div>
```

✅ **Do:** Use consistent components
```tsx
<div className="flex items-center space-x-2">
  <Button variant="primary">Save</Button>
  <Button variant="secondary">Cancel</Button>
</div>
```

### 4. Extend Components Properly

❌ **Don't:** Override internal styles
```tsx
<Button className="!bg-purple-600 !text-yellow-300">
  Ugly Button
</Button>
```

✅ **Do:** Use accepted customization patterns
```tsx
<Button 
  variant="primary" 
  className="shadow-lg transform hover:scale-105"
>
  Enhanced Button
</Button>
```

---

## 📋 Migration Guide

### From Legacy Components

#### Old ConfirmPopup → New ConfirmDialog

**Before:**
```tsx
<ConfirmPopup
  isOpen={true}
  onClose={hideConfirm}
  type="danger"
  {...confirmProps}
/>
```

**After:**
```tsx
<ConfirmDialog
  isOpen={true}
  onClose={hideConfirm}
  variant="danger"
  title={confirmProps.title}
  message={confirmProps.message}
  onConfirm={confirmProps.onConfirm}
/>
```

#### Old Toast → New Toast

**Before:**
```tsx
showToast({ type: 'success', message: 'Saved!' });
```

**After:**
```tsx
showToast({ variant: 'success', message: 'Saved!' });
```

#### Old Button Styles → New Button

**Before:**
```tsx
<button 
  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
  style={{ backgroundColor: '#2563eb' }}
>
  Click me
</button>
```

**After:**
```tsx
<Button variant="primary" size="md">
  Click me
</Button>
```

---

## 🛠 Development

### Adding New Components

1. **Create Component File**
   ```bash
   touch lib/design-system/NewComponent.tsx
   ```

2. **Follow Component Template**
   ```tsx
   'use client';
   
   import { cva, type VariantProps } from 'class-variance-authority';
   import { cn } from '../utils';
   
   const newComponentVariants = cva(
     "base-styles-here",
     {
       variants: {
         variant: {
           default: "default-styles",
           special: "special-styles"
         },
         size: {
           sm: "small-styles",
           md: "medium-styles"
         }
       },
       defaultVariants: {
         variant: "default",
         size: "md"
       }
     }
   );
   
   interface NewComponentProps 
     extends React.HTMLAttributes<HTMLDivElement>,
       VariantProps<typeof newComponentVariants> {
     children: React.ReactNode;
   }
   
   export function NewComponent({ 
     className, 
     variant, 
     size, 
     children,
     ...props 
   }: NewComponentProps) {
     return (
       <div 
         className={cn(newComponentVariants({ variant, size }), className)}
         {...props}
       >
         {children}
       </div>
     );
   }
   ```

3. **Export from Index**
   ```tsx
   // lib/design-system/index.ts
   export { NewComponent } from './NewComponent';
   export type { NewComponentProps } from './NewComponent';
   ```

### Extending Design Tokens

```tsx
// lib/design-system/tokens.ts
export const designTokens = {
  // ... existing tokens
  
  // Add new token category
  newCategory: {
    small: '4px',
    medium: '8px',
    large: '12px'
  }
} as const;
```

### Testing Components

Always test your components:

1. **TypeScript Compilation**
   ```bash
   npm run type-check
   ```

2. **Visual Testing**
   - Test all variants
   - Test all sizes
   - Test interaction states
   - Test responsive behavior

3. **Accessibility**
   - Keyboard navigation
   - Screen reader compatibility
   - Color contrast ratios

---

## 📚 Additional Resources

### Useful Links
- [CVA Documentation](https://cva.style/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Headless UI](https://headlessui.com/)
- [Heroicons](https://heroicons.com/)

### File Structure
```
lib/
├── design-system/
│   ├── tokens.ts           # Design tokens
│   ├── Button.tsx          # Button component
│   ├── Card.tsx           # Card component
│   ├── Input.tsx          # Input component
│   ├── Badge.tsx          # Badge component
│   ├── Modal.tsx          # Modal system
│   ├── Toast.tsx          # Toast notifications
│   ├── AlertDialog.tsx    # Alert dialogs
│   ├── ConfirmDialog.tsx  # Confirm dialog
│   └── index.ts           # Exports
├── utils.ts               # Utilities (cn function)
└── contexts/
    └── PopupContext.tsx   # Popup management
```

---

## 🎯 Summary

This design system provides:

- ✅ **Consistent** visual language
- ✅ **Scalable** component architecture  
- ✅ **Type-safe** development experience
- ✅ **Accessible** by default
- ✅ **Maintainable** codebase
- ✅ **Performance** optimized

Start using these components today for a better developer experience and more consistent user interface! 🚀