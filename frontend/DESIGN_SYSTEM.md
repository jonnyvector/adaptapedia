# Adaptapedia Design System

This document outlines the design system for Adaptapedia's frontend. Use these standardized components and utilities to ensure visual consistency across the application.

---

## 🎨 Color Palette

### Brand Colors
```css
Primary Action: #1E40AF (--accent-blue)
Success/Positive: #10B981 (--accent-emerald)
Warning/Attention: #F59E0B (--accent-amber)
Error/Destructive: #F43F5E (--accent-rose)
Accent/Premium: #8B5CF6 (--accent-violet)
```

### Tailwind Usage
```tsx
// Primary blue
className="bg-accent-blue text-white"
className="bg-accent-blue-hover" // Darker on hover
className="bg-accent-blue-light" // Light background

// Other accents
className="bg-accent-emerald"
className="bg-accent-amber"
className="bg-accent-rose"
className="bg-accent-violet"
```

---

## 🔘 Button System

### Button Variants

#### Primary - Main CTAs
```tsx
<button className="btn-primary">Save Changes</button>
<button className="btn-primary btn-lg">Get Started</button>
```

#### Secondary - Alternative Actions
```tsx
<button className="btn-secondary">Cancel</button>
```

#### Ghost - Subtle Actions
```tsx
<button className="btn-ghost">Learn More</button>
```

#### Outline - Bordered Variant
```tsx
<button className="btn-outline">Add Difference</button>
```
*Note: Automatically uses brighter blue (#60A5FA) in dark mode for better contrast*

#### Semantic Variants
```tsx
<button className="btn-success">Approve</button>
<button className="btn-danger">Delete</button>
<button className="btn-warning">Flag</button>
```

### Button Sizes
```tsx
<button className="btn-sm">Small</button>
<button className="btn-md">Medium (default)</button>
<button className="btn-lg">Large</button>
```

### Icon-Only Buttons
```tsx
<button className="btn-icon-only btn-sm">
  <svg className="icon-sm">...</svg>
</button>
```

### Complete Examples
```tsx
// Primary CTA with icon
<button className="btn-primary btn-lg">
  <svg className="icon-sm">...</svg>
  Start Exploring
</button>

// Danger action
<button className="btn-danger btn-sm">
  Delete Comment
</button>

// Secondary with loading state
<button className="btn-secondary" disabled>
  <svg className="icon-sm animate-spin">...</svg>
  Loading...
</button>
```

---

## 🎯 Icon System

### Icon Sizes
```tsx
className="icon-xs"   // 12x12px - Badges, tight spaces
className="icon-sm"   // 16x16px - Inline text, buttons
className="icon-md"   // 20x20px - Nav icons, default
className="icon-lg"   // 24x24px - Feature highlights
className="icon-xl"   // 32x32px - Hero sections
className="icon-2xl"  // 48x48px - Large feature icons
```

### Icon Examples
```tsx
// In a button
<button className="btn-primary">
  <svg className="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
  Add Item
</button>

// Standalone icon
<svg className="icon-lg text-accent-emerald">...</svg>

// In navigation
<svg className="icon-md text-muted hover:text-foreground transition-colors">...</svg>
```

### Interactive Icons
```tsx
// Icon button with background
<button className="icon-btn">
  <svg className="icon-md">...</svg>
</button>

// Primary icon button
<button className="icon-btn icon-btn-primary">
  <svg className="icon-md">...</svg>
</button>

// Standalone interactive icon (scales on hover)
<svg className="icon-lg icon-interactive text-accent-blue">...</svg>
```

---

## ✨ Hover Effects

### Cards
```tsx
// Standard card with hover effect
<div className="card card-interactive">
  ...
</div>
```

Effect: Lifts up 2px, adds shadow, border turns blue

### Links
```tsx
// Primary link
<a href="..." className="link-primary">Learn more</a>

// Subtle link
<a href="..." className="link-subtle">View profile</a>
```

### Images
```tsx
// Image that zooms on hover
<img src="..." className="img-zoom" alt="..." />
```

---

## 📐 Spacing & Layout

### Container Widths
```tsx
className="container"        // max-w-1200px
className="container-narrow" // max-w-800px
```

### Custom Spacing
```tsx
className="space-y-18" // 4.5rem vertical spacing
```

---

## 🎭 Transitions

All transitions use consistent timing:
- Duration: `200ms`
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`

```tsx
// Apply to custom elements
className="transition-all duration-200"
```

---

## 📝 Typography Helpers

```tsx
className="text-sm"        // 14px
className="text-base"      // 15px (default)
className="text-lg"        // 18px

className="font-medium"    // 500
className="font-semibold"  // 600
className="font-bold"      // 700

className="text-secondary" // Secondary text color
className="text-muted"     // Muted text color
```

---

## 🧩 Common Patterns

### Button with Icon and Text
```tsx
<button className="btn-primary">
  <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
  Add Difference
</button>
```

### Icon Button
```tsx
<button className="icon-btn" title="Edit">
  <svg className="icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
</button>
```

### Interactive Card
```tsx
<Link href="..." className="card card-interactive">
  <h3 className="font-bold">Title</h3>
  <p className="text-secondary">Description</p>
</Link>
```

### Status Badges
```tsx
<span className="badge badge-primary">Active</span>
<span className="badge badge-emerald">Success</span>
<span className="badge badge-rose">Error</span>
```

---

## 🚀 Quick Reference

| Component | Class | Usage |
|-----------|-------|-------|
| Primary Button | `btn-primary` | Main CTAs |
| Secondary Button | `btn-secondary` | Alternative actions |
| Ghost Button | `btn-ghost` | Subtle actions |
| Success Button | `btn-success` | Positive actions |
| Danger Button | `btn-danger` | Destructive actions |
| Small Icon | `icon-sm` | 16px icons |
| Medium Icon | `icon-md` | 20px icons (default) |
| Large Icon | `icon-lg` | 24px icons |
| Icon Button | `icon-btn` | Clickable icon with bg |
| Interactive Card | `card-interactive` | Hoverable card |
| Primary Link | `link-primary` | Blue link with underline |
| Image Zoom | `img-zoom` | Scale on hover |

---

## 💡 Best Practices

1. **Consistency**: Always use design system classes instead of custom Tailwind utilities for buttons and icons
2. **Accessibility**: Include proper ARIA labels and alt text
3. **Size Hierarchy**: Use button/icon sizes appropriately (large for CTAs, small for inline actions)
4. **Color Meaning**: Use semantic colors consistently (green=success, red=danger, amber=warning)
5. **Hover States**: All interactive elements should have visible hover states
6. **Loading States**: Disable buttons and show loading indicators during async operations

---

## 🔄 Migration Guide

### Old → New Button Styles

```tsx
// ❌ Old
<button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover">
  Submit
</button>

// ✅ New
<button className="btn-primary">
  Submit
</button>
```

### Old → New Icon Sizes

```tsx
// ❌ Old
<svg className="w-5 h-5">...</svg>

// ✅ New
<svg className="icon-md">...</svg>
```

### Old → New Card Hover

```tsx
// ❌ Old
<div className="card hover:shadow-lg hover:-translate-y-1 transition-all">
  ...
</div>

// ✅ New
<div className="card card-interactive">
  ...
</div>
```

---

Built with ❤️ for consistency and developer experience.
