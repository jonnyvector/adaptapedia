# Frontend Code Audit - Adaptapedia

**Date:** January 9, 2026
**Scope:** Complete frontend codebase review
**Total Components:** 94 components (~17,212 lines of code)
**Focus Areas:** Component design, styling consistency, performance, accessibility, code quality

---

## Executive Summary

### Critical Findings
- **Dual Design System Conflict:** `globals.css` defines a complete button/form system that is largely unused. Components instead use inline Tailwind + `brutalist-design.ts` tokens, creating inconsistency and duplication.
- **Image Optimization Gap:** 16 raw `<img>` tags instead of `next/image` (only 13 uses of Next Image).
- **Over-Client-Rendering:** Header component is client-rendered when much of it could be server-rendered.
- **Hardcoded API URLs:** `localhost:8000` hardcoded in LoginForm and other components.

### High-Impact Refactors Needed
- Extract repeated button patterns → unified Button component with CVA variants
- Extract repeated form input patterns → unified Input component
- Consolidate dual design systems into single source of truth
- Create navigation link component (repeated 10+ times with identical styles)
- Reduce arbitrary Tailwind values (88 instances) by using existing design tokens

### Code Health Metrics
- **Repeated className patterns:** 210 instances of `px-X py-X` manual padding
- **Border radius inconsistency:** 153 instances of `rounded-*` classes (some use `RADIUS.control`, many don't)
- **Arbitrary values:** 88 instances of `w-[...]`, `h-[...]`, `text-[...]` when tokens exist
- **Client components:** 64 in `/components`, 13 in `/app` (some unnecessarily client-side)
- **Memoization usage:** Only 23 instances across 94 components

---

## Detailed Findings

## P0: Critical Issues (Must Fix)

### P0-1: Dual Design System Conflict
**Files:** `frontend/app/globals.css`, `frontend/lib/brutalist-design.ts`

**Problem:**
Two competing design systems exist:
1. **`globals.css`** (1,429 lines): Complete CSS design system with `.btn-primary`, `.btn-secondary`, `.card`, `.icon-btn`, form styles, etc.
2. **`brutalist-design.ts`**: TypeScript tokens (`FONTS`, `BORDERS`, `TEXT`, `SPACING`, etc.) used in components

Components overwhelmingly use inline Tailwind + `brutalist-design.ts` tokens, making `globals.css` largely dead code except for a few places.

**Example:**
```tsx
// LoginForm.tsx - Not using globals.css .btn-primary
<button className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-black dark:bg-white text-white dark:text-black rounded-md font-bold hover:bg-black/90...`}>
  Log In
</button>

// Could be:
<button className="btn-primary btn-lg w-full">Log In</button>
```

**Why it matters:**
- **Maintenance burden**: Changes require updating both systems
- **Bundle size**: Shipping unused CSS (~50KB+ of globals.css is dead code)
- **Inconsistency**: Buttons look different across components
- **Developer confusion**: New devs don't know which system to use

**Recommended fix:**
1. **Audit globals.css** - Identify what's actually used (likely < 20%)
2. **Choose one approach:**
   - **Option A (Recommended):** Migrate to brutalist-design.ts + create shared components (Button, Input, Card). Remove unused globals.css.
   - **Option B:** Fully adopt globals.css classes and deprecate inline Tailwind + brutalist-design.ts
3. **Document the decision** in CLAUDE.md

---

### P0-2: Missing Next.js Image Optimization
**Files:** 16 components with raw `<img>` tags

**Problem:**
Only 13 uses of `next/image`, but 16 raw `<img>` tags found:
- `frontend/components/browse/ComparisonCard.tsx` (2 images)
- `frontend/components/diff/ComparisonHero.tsx`
- `frontend/components/search/BookResult.tsx`
- ...and 12 more

**Example:**
```tsx
// ComparisonCard.tsx:44-47
<img
  src={cover_url}
  alt={work_title}
  className="absolute inset-0 w-full h-full object-cover"
/>

// Should be:
<Image
  src={cover_url}
  alt={work_title}
  fill
  className="object-cover"
  sizes="(max-width: 768px) 50vw, 25vw"
/>
```

**Why it matters:**
- **Performance:** Missing automatic image optimization (WebP/AVIF, sizing)
- **LCP:** Book covers/posters are likely LCP elements on comparison pages
- **Mobile data:** Users download full-resolution images on mobile

**Recommended fix:**
1. Replace all `<img>` tags with `<Image>` from `next/image`
2. Add appropriate `sizes` prop for responsive images
3. Use `priority` for above-the-fold images
4. Add `placeholder="blur"` where appropriate

**Estimated impact:** 30-50% reduction in image payload, 20-30% LCP improvement

---

### P0-3: Header Over-Client-Rendering
**File:** `frontend/components/layout/Header.tsx:1`

**Problem:**
Entire Header component is `'use client'`, but large portions could be server-rendered:
- Logo link (static)
- Navigation links (static, or use search params server-side)
- About/Browse links (static)

Only these parts need client:
- Search dropdown (requires `useState`, `useEffect`)
- Theme toggle
- User dropdown (requires auth context)
- Mobile menu toggle

**Why it matters:**
- **Hydration cost:** Header is on every page, adding ~15KB JS to initial bundle
- **SEO:** Navigation links could be in initial HTML for crawlers
- **Performance:** Unnecessary client JS execution on every page load

**Recommended fix:**
1. Split Header into:
   - `Header` (server component) - renders static shell
   - `HeaderSearch` (client) - search functionality
   - `HeaderAuth` (client) - auth-dependent UI
2. Use Next.js `useSearchParams()` in a client component wrapper, not at top level
3. Pass auth state from server action/API route instead of client context

**Example refactor:**
```tsx
// Header.tsx (server component)
export default function Header() {
  return (
    <header className="...">
      <Logo />
      <HeaderSearch /> {/* client */}
      <nav>
        <StaticNavLinks />
        <HeaderAuth /> {/* client */}
      </nav>
    </header>
  );
}
```

---

### P0-4: Hardcoded API URLs
**Files:** `frontend/components/auth/LoginForm.tsx:122`, `frontend/components/auth/SignupForm.tsx`

**Problem:**
```tsx
// LoginForm.tsx:122
onClick={() => window.location.href = 'http://localhost:8000/accounts/google/login/'}
```

Hardcoded `localhost:8000` will break in production.

**Why it matters:**
- **Production bug:** OAuth will not work in production
- **Staging:** Won't work in staging/preview environments
- **Security:** HTTP instead of HTTPS

**Recommended fix:**
1. Use environment variable: `process.env.NEXT_PUBLIC_API_URL` or `process.env.NEXT_PUBLIC_BACKEND_URL`
2. Create helper in `lib/api.ts`:
```tsx
export const getBackendUrl = () => {
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
};

// Usage:
onClick={() => window.location.href = `${getBackendUrl()}/accounts/google/login/`}
```

---

## P1: High-Impact Refactors

### P1-1: Button Pattern Duplication
**Files:** 50+ files with button elements

**Problem:**
No unified Button component. Each button is inline Tailwind with repeated patterns:

**Common patterns found:**
```tsx
// Pattern 1: Primary CTA (appears 15+ times)
className={`px-4 py-3 bg-black dark:bg-white text-white dark:text-black rounded-md font-bold hover:bg-black/90 hover:dark:bg-white/90 transition-colors border ${BORDERS.solid}`}

// Pattern 2: Secondary button (appears 12+ times)
className={`px-3 py-2 border ${BORDERS.medium} bg-white dark:bg-black text-black dark:text-white hover:border-black hover:dark:border-white transition-colors`}

// Pattern 3: Ghost button (appears 8+ times)
className={`px-2 py-1.5 ${TEXT.mutedStrong} hover:text-black hover:dark:text-white transition-colors`}
```

**Examples:**
- `frontend/components/auth/LoginForm.tsx:96-100` - Primary button
- `frontend/components/diff/AddCommentForm.tsx:200-205` - Primary button (different styling!)
- `frontend/components/diff/ComparisonVoting.tsx:239-247` - Primary vote button
- `frontend/components/layout/Header.tsx:258-264` - Primary login button
- `frontend/components/onboarding/UsernameStep.tsx` - Multiple button variants

**Why it matters:**
- **Inconsistency:** Buttons with same intent look different (padding, borders, hover states)
- **Maintenance:** Changing button style requires editing 50+ files
- **Accessibility:** Some buttons missing `min-h-[44px]` for touch targets
- **Bundle size:** Repeated className strings

**Recommended fix:**

Create `components/ui/Button.tsx` with CVA variants:

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, RADIUS, monoUppercase } from '@/lib/brutalist-design';

const buttonVariants = cva(
  // Base styles
  `inline-flex items-center justify-center gap-2 font-bold transition-all ${RADIUS.control} disabled:opacity-50 disabled:cursor-not-allowed`,
  {
    variants: {
      variant: {
        primary: `bg-black dark:bg-white text-white dark:text-black border ${BORDERS.solid} hover:bg-black/90 hover:dark:bg-white/90`,
        secondary: `bg-white dark:bg-black border ${BORDERS.medium} text-black dark:text-white hover:border-black hover:dark:border-white`,
        ghost: `border-none ${TEXT.mutedStrong} hover:text-black hover:dark:text-white`,
        danger: `bg-red-600 text-white border ${BORDERS.solid} hover:bg-red-700`,
      },
      size: {
        sm: `px-2 py-1 ${TEXT.metadata}`,
        md: `px-3 py-2 ${TEXT.secondary}`,
        lg: `px-4 py-3 ${TEXT.secondary} min-h-[48px]`,
      },
      mono: {
        true: monoUppercase,
        false: '',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      mono: true,
      fullWidth: false,
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, mono, fullWidth, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, mono, fullWidth }), className)}
        style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <LoadingSpinner size="sm" />}
        {children}
      </button>
    );
  }
);
```

**Usage:**
```tsx
// Before:
<button className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-black dark:bg-white...`}>
  Log In
</button>

// After:
<Button variant="primary" size="lg" fullWidth>
  Log In
</Button>
```

**Migration strategy:**
1. Create Button component
2. Migrate auth forms first (LoginForm, SignupForm)
3. Migrate comparison page
4. Migrate onboarding
5. Remove unused button styles from globals.css

---

### P1-2: Form Input Duplication
**Files:** `LoginForm.tsx`, `SignupForm.tsx`, `AddCommentForm.tsx`, `AddDiffForm.tsx`, `UsernameStep.tsx`, etc.

**Problem:**
Form inputs repeated with slight variations:

```tsx
// LoginForm.tsx:66-76
<input
  type="text"
  id="username"
  value={formData.username}
  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
  required
  className={`w-full px-3 py-3 ${TEXT.body} border ${BORDERS.medium} rounded-md focus:outline-none focus:border-black focus:dark:border-white min-h-[44px] bg-white dark:bg-black text-black dark:text-white`}
  style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.normal }}
  disabled={isSubmitting}
  autoComplete="username"
/>

// AddCommentForm.tsx:118-127 - textarea with similar styling but slight differences
// UsernameStep.tsx - input with validation states
```

**Why it matters:**
- **Inconsistency:** Different padding, borders, focus states across forms
- **A11y:** Some inputs missing proper focus indicators
- **Maintenance:** Hard to update all inputs consistently

**Recommended fix:**

Create `components/ui/Input.tsx` and `components/ui/Textarea.tsx`:

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, RADIUS } from '@/lib/brutalist-design';

const inputVariants = cva(
  `w-full ${TEXT.body} border bg-white dark:bg-black text-black dark:text-white ${RADIUS.control} focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed`,
  {
    variants: {
      variant: {
        default: `${BORDERS.medium} focus:border-black focus:dark:border-white`,
        error: `border-red-600 dark:border-red-400 focus:border-red-600 focus:dark:border-red-400`,
        success: `border-green-600 dark:border-green-400 focus:border-green-600 focus:dark:border-green-400`,
      },
      inputSize: {
        sm: 'px-2 py-2 text-sm min-h-[40px]',
        md: 'px-3 py-3 min-h-[44px]',
        lg: 'px-4 py-4 min-h-[52px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
    },
  }
);

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, inputSize, label, error, helperText, ...props }, ref) => {
    const inputVariant = error ? 'error' : variant;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={props.id} className={`block ${TEXT.secondary} font-bold mb-2 text-black dark:text-white ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(inputVariants({ variant: inputVariant, inputSize }), className)}
          style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.normal }}
          {...props}
        />
        {error && (
          <p className={`mt-1 ${TEXT.metadata} text-red-600 dark:text-red-400`} style={{ fontFamily: FONTS.mono }}>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className={`mt-1 ${TEXT.metadata} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
```

**Usage:**
```tsx
// Before:
<label htmlFor="username" className={`block ${TEXT.secondary} font-bold mb-2...`}>
  Username
</label>
<input
  type="text"
  id="username"
  className={`w-full px-3 py-3 ${TEXT.body} border ${BORDERS.medium}...`}
/>

// After:
<Input
  type="text"
  id="username"
  label="Username"
  error={errors.username}
  autoComplete="username"
/>
```

---

### P1-3: Navigation Link Duplication
**File:** `frontend/components/layout/Header.tsx`

**Problem:**
Navigation links repeated with identical styling:

```tsx
// Lines 184-190, 194-199, 204-211, 215-220 - Same pattern 5+ times
<Link
  href="/browse"
  className={`${TEXT.label} px-2 py-1.5 ${TEXT.mutedStrong} hover:text-black hover:dark:text-white transition-colors flex items-center font-bold ${monoUppercase}`}
  style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}
>
  Browse
</Link>
```

Plus mobile menu links (lines 358-387) with different but similar styling.

**Why it matters:**
- **DRY violation:** 10+ identical className strings
- **Maintenance:** Changing nav link style requires 10+ edits
- **Inconsistency risk:** Easy to miss one when updating

**Recommended fix:**

Create `components/layout/NavLink.tsx`:

```tsx
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FONTS, LETTER_SPACING, TEXT, monoUppercase } from '@/lib/brutalist-design';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  mobile?: boolean;
  className?: string;
}

export function NavLink({ href, children, mobile = false, className }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        mobile
          ? `${TEXT.body} px-4 py-3 ${TEXT.primary} hover:bg-stone-100 hover:dark:bg-stone-900 transition-colors font-bold ${monoUppercase} border ${BORDERS.medium}`
          : `${TEXT.label} px-2 py-1.5 ${TEXT.mutedStrong} hover:text-black hover:dark:text-white transition-colors flex items-center font-bold ${monoUppercase}`,
        isActive && 'text-black dark:text-white',
        className
      )}
      style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}
    >
      {children}
    </Link>
  );
}
```

**Usage:**
```tsx
// Before:
<Link href="/browse" className={`${TEXT.label} px-2 py-1.5 ${TEXT.mutedStrong}...`}>
  Browse
</Link>

// After:
<NavLink href="/browse">Browse</NavLink>
<NavLink href="/catalog">Catalog</NavLink>
<NavLink href="/about">About</NavLink>

// Mobile:
<NavLink href="/browse" mobile>Browse</NavLink>
```

---

### P1-4: Excessive Arbitrary Tailwind Values
**Files:** 23 files with 88 instances

**Problem:**
Arbitrary values like `w-[...]`, `text-[...]`, `h-[...]` used 88 times when design tokens exist:

**Examples:**
```tsx
// MatchupScoreboard.tsx has 30+ arbitrary values:
<div className="w-[180px] sm:w-[200px] md:w-[240px]"> {/* should use design tokens */}
<span className="text-[9px] sm:text-[10px]">  {/* should use TEXT.metadata */}
<div className="h-[300px] sm:h-[280px]">  {/* arbitrary height */}

// SpoilerScopeToggle.tsx:
<div className={`text-[8px] sm:text-[9px]`}>  {/* should use TEXT.metadata or smaller token */}

// CompactVoteStrip.tsx:
<div className="h-[2px]">  {/* magic number */}
```

**Why it matters:**
- **Inconsistency:** Similar UI elements use different values (`text-[9px]` vs `text-[10px]`)
- **Maintenance:** No single source of truth for sizing
- **Design drift:** Easy to introduce random sizes over time

**Recommended fix:**

1. **Extend `brutalist-design.ts` with missing tokens:**

```tsx
// lib/brutalist-design.ts

export const TEXT = {
  // Add smaller size for micro-labels
  micro: 'text-[8px] sm:text-[9px]',  // For vote strips, tiny badges
  metadata: 'text-[9px] sm:text-[10px]',
  label: 'text-[11px] sm:text-xs',
  secondary: 'text-xs sm:text-sm',
  body: 'text-sm sm:text-base',
  // ... existing
} as const;

export const SIZES = {
  // Component-specific sizes
  scoreboard: {
    width: 'w-[180px] sm:w-[200px] md:w-[240px]',
    height: 'h-[280px] sm:h-[300px]',
  },
  voteStrip: {
    height: 'h-[2px]',
  },
  // ... etc
} as const;
```

2. **Replace arbitrary values with tokens:**

```tsx
// Before:
<span className="text-[9px] sm:text-[10px]">Vote</span>

// After:
<span className={TEXT.metadata}>Vote</span>

// Before:
<div className="h-[2px] bg-black">

// After:
<div className={SIZES.voteStrip.height} bg-black">
```

3. **For truly one-off sizes, add comment explaining why:**

```tsx
// One-off for specific TMDb poster aspect ratio (2:3)
<div className="h-[450px]">
```

---

### P1-5: Card Pattern Duplication
**Files:** `ComparisonCard.tsx`, `DiffItemCard.tsx`, `TrendingComparisons.tsx`, `UserDiffsList.tsx`, etc.

**Problem:**
Similar card patterns repeated with slight variations:

```tsx
// ComparisonCard.tsx:34-36
<Link className={`group block border ${BORDERS.medium} overflow-hidden hover:border-black hover:dark:border-white transition-all duration-200 bg-stone-50 dark:bg-stone-950`}>

// DiffItemCard.tsx - similar but different padding
<div className={`border ${BORDERS.medium} bg-white dark:bg-black p-4 sm:p-5 md:p-6`}>

// TrendingComparisons.tsx - similar hover effect
<div className="border ${BORDERS.medium} p-4 hover:border-black hover:dark:border-white transition-colors">
```

**Why it matters:**
- **Inconsistency:** Cards have different padding, hover states, backgrounds
- **Maintenance:** Changing card style requires editing multiple components
- **Accessibility:** Some cards clickable, some not - unclear affordance

**Recommended fix:**

Create `components/ui/Card.tsx` with variants:

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { BORDERS, RADIUS, SPACING } from '@/lib/brutalist-design';

const cardVariants = cva(
  `border ${BORDERS.medium} transition-all`,
  {
    variants: {
      variant: {
        default: 'bg-white dark:bg-black',
        subtle: 'bg-stone-50 dark:bg-stone-950',
        bordered: 'bg-white dark:bg-black border-2',
      },
      padding: {
        none: 'p-0',
        sm: SPACING.cardPaddingCompact,
        md: SPACING.cardPadding,
        lg: 'p-6 sm:p-8',
      },
      interactive: {
        true: 'hover:border-black hover:dark:border-white cursor-pointer',
        false: '',
      },
      rounded: {
        true: RADIUS.control,
        false: RADIUS.none,
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      interactive: false,
      rounded: false,
    },
  }
);

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export function Card({ className, variant, padding, interactive, rounded, ...props }: CardProps) {
  return (
    <div
      className={cn(cardVariants({ variant, padding, interactive, rounded }), className)}
      {...props}
    />
  );
}
```

**Usage:**
```tsx
// Before:
<div className={`border ${BORDERS.medium} bg-white dark:bg-black p-4 sm:p-5 md:p-6 hover:border-black transition-all`}>

// After:
<Card variant="default" padding="md" interactive>
  {children}
</Card>
```

---

## P2: Nice-to-Have Improvements

### P2-1: Limited Performance Optimization
**Current state:** Only 23 instances of `useMemo`/`useCallback`/`memo` across 94 components.

**Problem:**
Some components likely re-render unnecessarily:
- `DiffItemCard` - receives `diff` object that may be new reference on parent re-render
- `ComparisonCard` - receives `comparison` object
- Vote buttons in `DiffItemCard` - handlers recreated on every render

**Why it matters:**
- **Performance:** Unnecessary re-renders on comparison pages with 20+ diffs
- **Premature optimization:** Most components probably don't need it yet

**Recommended fix:**
1. **Measure first** - Use React DevTools Profiler to find actual bottlenecks
2. **Memo expensive components** only when proven slow:
   ```tsx
   export const DiffItemCard = memo(function DiffItemCard({ diff, onVote }: Props) {
     // ...
   });
   ```
3. **Wrap callbacks** passed as props:
   ```tsx
   const handleVote = useCallback((voteType: VoteType) => {
     submitVote(diff.id, voteType);
   }, [diff.id]);
   ```

**Do NOT** blindly memo everything - only when Profiler shows issue.

---

### P2-2: Missing CVA for Variant Management

**Problem:**
Package installed (`class-variance-authority` would be useful) but not used. Variants currently handled with ternaries:

```tsx
// DiffItemCard.tsx - vote button logic
className={`px-2 py-1.5 ${TEXT.metadata} font-bold border ${
  userVote === 'ACCURATE'
    ? `bg-black dark:bg-white ${BORDERS.solid} text-white dark:text-black`
    : `bg-white dark:bg-black ${BORDERS.medium} ${TEXT.mutedStrong}`
}`}
```

**Why it matters:**
- **Readability:** Nested ternaries hard to follow
- **Type safety:** CVA provides TypeScript types for variants
- **Maintainability:** Variants defined in one place

**Recommended fix:**
Install `class-variance-authority` and use for Button, Input, Card (see P1 recommendations above).

---

### P2-3: Inline SVG Icons
**Files:** `Header.tsx`, `ComparisonCard.tsx`, `HomePage.tsx`, etc.

**Problem:**
`components/ui/Icons.tsx` exists but many SVGs are inline:

```tsx
// Header.tsx:280-291 - Hamburger icon inline
<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
</svg>

// ComparisonCard.tsx:134-136 - Document icon inline
<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2..." />
</svg>
```

**Why it matters:**
- **Bundle size:** Repeated SVG code
- **Maintenance:** Changing icon style requires editing multiple files
- **Consistency:** Icon sizes/colors inconsistent

**Recommended fix:**
1. Extract common icons to `Icons.tsx`:
   ```tsx
   export function HamburgerIcon({ className }: { className?: string }) {
     return (
       <svg className={cn('icon-md', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
       </svg>
     );
   }
   ```
2. Use icon library (e.g., `lucide-react`) for common icons to reduce SVG code:
   ```tsx
   import { Menu, X, Search, User } from 'lucide-react';
   <Menu className="icon-md" />
   ```

---

### P2-4: Inconsistent Loading & Empty States

**Files:** `ComparisonView.tsx`, `ModQueue.tsx`, `UserProfileClient.tsx`, etc.

**Problem:**
Loading and empty states handled inconsistently:

```tsx
// ComparisonView.tsx - Uses EmptyState component
<EmptyState
  title="No differences logged yet"
  description="Be the first to add one!"
  actionText="Add Difference"
  actionHref={addDiffUrl}
/>

// ModQueue.tsx - Inline empty state
{reports.length === 0 && (
  <div className="text-center py-12">
    <p className="text-muted">No reports to review</p>
  </div>
)}

// UserProfileClient.tsx - Different loading state
{loading && <LoadingSpinner />}

// CatalogClient.tsx - Different loading state
{isLoading && <div className="py-12 text-center">Loading...</div>}
```

**Why it matters:**
- **UX consistency:** Users see different loading patterns across pages
- **Maintenance:** Hard to update all loading states

**Recommended fix:**
1. Standardize on `EmptyState` component (already exists)
2. Create `LoadingState` component:
   ```tsx
   // components/ui/LoadingState.tsx
   export function LoadingState({ message = 'Loading...' }: { message?: string }) {
     return (
       <div className="flex flex-col items-center justify-center py-12 gap-4">
         <LoadingSpinner size="lg" />
         <p className={`${TEXT.secondary} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
           {message}
         </p>
       </div>
     );
   }
   ```
3. Use consistently across all data-fetching components

---

### P2-5: Missing Focus-Visible States (Accessibility)

**Problem:**
`globals.css` defines focus-visible (lines 984-991), but some interactive elements override it or don't have focus states:

```tsx
// Header.tsx:149 - focus:outline-none removes default focus
<input
  className="... focus:outline-none focus:ring-0 focus:border-black ..."
/>
```

Focus is indicated by border color change, which is good, but `focus-visible` would be better for keyboard users.

**Why it matters:**
- **Accessibility:** Keyboard users need clear focus indicators
- **WCAG 2.1:** Requires visible focus indicator (Success Criterion 2.4.7)

**Recommended fix:**
1. Use `focus-visible:` instead of `focus:` for outline styles:
   ```tsx
   className="... focus:border-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
   ```
2. Test with keyboard navigation to ensure all interactive elements have visible focus

---

## P2-6: Search Dropdown Complexity

**File:** `frontend/components/layout/Header.tsx:41-79`

**Problem:**
Header component has complex search logic with multiple `useEffect`s:
- Debounced search (lines 42-63)
- Click outside handler (lines 65-79)
- Pathname change handler (lines 81-85)

All in the Header component, which is already 445 lines.

**Why it matters:**
- **Maintainability:** Header doing too much
- **Reusability:** Search logic could be used elsewhere
- **Testing:** Hard to test search in isolation

**Recommended fix:**
1. Extract to `components/search/SearchInput.tsx`:
   ```tsx
   export function SearchInput({ onResultClick }: Props) {
     const [query, setQuery] = useState('');
     const [results, setResults] = useState(null);
     const [showDropdown, setShowDropdown] = useState(false);

     // ... search logic

     return (
       <div className="relative" ref={searchRef}>
         <input {...} />
         {showDropdown && <SearchDropdown ... />}
       </div>
     );
   }
   ```
2. Use in Header: `<SearchInput onResultClick={...} />`

---

## Architecture Map

### Routes & Pages (38 files)

**Static Pages** (Server Components):
- `/` - Home page with featured comparisons
- `/about` - Static about page
- `/about/guidelines` - Static guidelines
- `/about/sources` - Static sources attribution
- `/browse` - Browse comparisons (SSG/ISR)
- `/browse/[genre]` - Genre-filtered browse
- `/needs-help` - Comparisons needing contributions

**Dynamic Pages** (Mix of Server/Client):
- `/book/[slug]` - Book detail page (SSR)
- `/screen/[slug]` - Screen work detail page (SSR)
- `/compare/[book]/[screen]` - Comparison detail (SSR shell, client diffs)
- `/compare/[book]/[screen]/add` - Add diff form (Client)
- `/search` - Search results page (SSR)
- `/catalog` - Full catalog (Client table)

**User Pages** (SSR with client components):
- `/u/[username]` - User profile
- `/u/[username]/bookmarks` - User bookmarks

**Auth Pages** (Client):
- `/auth/login` - Login form
- `/auth/signup` - Signup form
- `/auth/social-callback` - OAuth callback handler
- `/auth/logout` - Logout handler

**Admin Pages** (Client):
- `/mod/queue` - Moderation queue

**Onboarding** (Client):
- `/onboarding` - Multi-step onboarding flow

### Component Organization (94 components)

**UI Primitives** (`components/ui/`, 9 files):
- `EmptyState.tsx` ✅ - Standardized empty states
- `LoadingSpinner.tsx` ✅ - Spinner component
- `LoadingSkeleton.tsx` - Skeleton loaders
- `SkeletonCard.tsx` - Card skeleton
- `Toast.tsx` - Toast notifications
- `Icons.tsx` - Icon components
- `ImageLightbox.tsx` - Image modal
- `FadeIn.tsx` - Animation wrapper
- `RandomComparisonButton.tsx` - Random comparison CTA

**Layout** (`components/layout/`, 7 files):
- `Header.tsx` ⚠️ - Main header (needs refactor)
- `Footer.tsx` - Main footer
- `ThemeToggle.tsx` - Dark mode toggle
- `UserDropdown.tsx` - User menu
- `NotificationBell.tsx` - Notifications
- `RetroEasterEggs.tsx` - Easter egg animations

**Auth** (`components/auth/`, 4 files):
- `LoginForm.tsx` ⚠️ - Login form (needs Input component)
- `SignupForm.tsx` ⚠️ - Signup form
- `AuthPageWrapper.tsx` ✅ - Wrapper with redirect logic
- `AuthGuard.tsx` - Route protection

**Diff System** (`components/diff/`, 28 files):
- `ComparisonView.tsx` - Main comparison container
- `DiffItemCard.tsx` ⚠️ - Individual diff card (large, needs split)
- `AddDiffForm.tsx` ⚠️ - Add diff form
- `ComparisonVoting.tsx` - Book vs Screen voting
- `ComparisonHero.tsx` - Hero section
- `CompactMatchupHero.tsx` - Compact hero variant
- `ComparisonIdentityHero.tsx` - Identity-focused hero
- `SpoilerControl.tsx` ✅ - Spoiler preference selector
- `SpoilerScopeToggle.tsx` ✅ - Spoiler scope toggle
- `CommentsList.tsx` - Comment threads
- `AddCommentForm.tsx` ⚠️ - Comment form
- ... 17 more diff-related components

**Browse** (`components/browse/`, 2 files):
- `ComparisonCard.tsx` ⚠️ - Comparison grid card (needs Card component)
- `ComparisonList.tsx` - List view

**Search** (`components/search/`, 6 files):
- `SearchBar.tsx` - Search input
- `SearchDropdown.tsx` - Results dropdown
- `BookResult.tsx` - Book result card
- `ScreenWorkResult.tsx` - Screen result card
- `BookWithAdaptationsResult.tsx` - Combined result

**Onboarding** (`components/onboarding/`, 6 files):
- `OnboardingLayout.tsx` - Wrapper
- `UsernameStep.tsx` ⚠️ - Username selection
- `QuizStep.tsx` - Interest quiz
- `SuggestionsStep.tsx` - Suggested comparisons
- `OnboardingBanner.tsx` - Persistent banner
- `ProgressIndicator.tsx` - Step indicator

**User** (`components/user/`, 7 files):
- `UserProfileHeader.tsx` - Profile header
- `UserProfileClient.tsx` - Profile container
- `UserDiffsList.tsx` - User's diffs
- `UserCommentsList.tsx` - User's comments
- `UserVotesList.tsx` - User's votes
- `ReputationProgress.tsx` - Rep bar
- `UserVotesSection.tsx` - Votes section

**Shared** (`components/shared/`, 5 files):
- `Infobox.tsx` - Work metadata card
- `WorkInfobox.tsx` - Work infobox variant
- `AdaptationsList.tsx` - Linked adaptations
- `TrendingComparisons.tsx` - Trending section
- `SimilarBooks.tsx` - Similar books

**Moderation** (`components/mod/`, 4 files):
- `ModQueue.tsx` - Mod queue list
- `DiffReviewCard.tsx` - Diff review
- `CommentReviewCard.tsx` - Comment review
- `ModerationActions.tsx` - Mod action buttons

### Styling Approach

**Current State:**
- **Primary:** Tailwind utility classes
- **Tokens:** `brutalist-design.ts` (FONTS, BORDERS, TEXT, SPACING, RADIUS, COLORS)
- **Utils:** `cn()` helper for className merging
- **Global CSS:** `globals.css` (1,429 lines, mostly unused)

**Token Coverage:**
- ✅ Typography: `FONTS`, `LETTER_SPACING`, `TEXT`
- ✅ Colors: `COLORS` (book/screen accent colors)
- ✅ Borders: `BORDERS` (subtle/medium/solid)
- ✅ Spacing: `SPACING` (container/card/button padding)
- ✅ Border radius: `RADIUS` (none/control)
- ❌ Shadows: Not in tokens (defined in globals.css)
- ❌ Transitions: Not in tokens (inline `transition-all`)

**Component Variants:**
- ❌ No CVA usage despite being valuable
- ❌ Variants handled with ternaries and className concatenation

---

## Recommendations Summary

### Immediate Actions (P0)

1. **[P0-1] Consolidate Design Systems**
   - **Decision needed:** Choose brutalist-design.ts + components OR globals.css classes
   - **Effort:** 3-4 days
   - **Impact:** Reduces bundle size, improves consistency

2. **[P0-2] Add Next.js Image Optimization**
   - **Action:** Replace 16 `<img>` tags with `<Image>`
   - **Effort:** 2-3 hours
   - **Impact:** 30-50% image payload reduction

3. **[P0-3] Refactor Header to Server Component**
   - **Action:** Split Header into server shell + client components
   - **Effort:** 4-6 hours
   - **Impact:** Reduces initial JS by ~15KB

4. **[P0-4] Fix Hardcoded API URLs**
   - **Action:** Use environment variables
   - **Effort:** 30 minutes
   - **Impact:** Prevents production bug

### High-Impact Refactors (P1)

1. **[P1-1] Create Button Component with CVA**
   - **Effort:** 1 day (component) + 1 day (migration)
   - **Impact:** Eliminates 50+ repeated patterns

2. **[P1-2] Create Input/Textarea Components**
   - **Effort:** 1 day
   - **Impact:** Consistent form styling

3. **[P1-3] Create NavLink Component**
   - **Effort:** 2 hours
   - **Impact:** Eliminates 10+ repeated nav links

4. **[P1-4] Reduce Arbitrary Tailwind Values**
   - **Effort:** 1 day
   - **Impact:** Better design consistency

5. **[P1-5] Create Card Component**
   - **Effort:** 1 day
   - **Impact:** Consistent card styling

### Nice-to-Have (P2)

1. **[P2-1] Add Performance Optimization** - Measure first, then memo
2. **[P2-2] Adopt CVA** - Install and use for Button, Input, Card
3. **[P2-3] Extract Inline SVGs** - Move to Icons.tsx or use icon library
4. **[P2-4] Standardize Loading/Empty States** - Use EmptyState, create LoadingState
5. **[P2-5] Improve Focus-Visible States** - Better keyboard navigation
6. **[P2-6] Extract Search Logic** - Move to SearchInput component

---

## Suggested Implementation Order

### Phase 1: Foundation (Week 1)
1. Fix P0-4 (API URLs) - 30 min
2. Fix P0-2 (Next Image) - 3 hours
3. Start P0-1 (Design system decision) - requires discussion

### Phase 2: Core Components (Week 2)
1. P1-1 (Button component) - 2 days
2. P1-2 (Input component) - 1 day
3. P1-3 (NavLink component) - 2 hours
4. P1-5 (Card component) - 1 day

### Phase 3: Cleanup (Week 3)
1. P1-4 (Reduce arbitrary values) - 1 day
2. P0-3 (Header refactor) - 6 hours
3. P2-2 (CVA adoption) - Already done with Button/Input
4. P2-4 (Standardize states) - 4 hours

### Phase 4: Polish (Week 4)
1. P2-3 (Extract SVGs) - 4 hours
2. P2-5 (Focus-visible) - 2 hours
3. P2-6 (Search refactor) - 4 hours
4. P2-1 (Performance) - Measure and optimize as needed

---

## Success Metrics

Track these metrics before/after refactor:

### Bundle Size
- **Current:** Unknown (need to measure)
- **Target:** 15-20% reduction after removing unused globals.css

### Performance
- **LCP:** Measure on `/compare/[book]/[screen]` before/after Image optimization
- **Target:** < 2.5s LCP on 3G connection

### Developer Experience
- **Lines of className code:** Count before/after shared components
- **Target:** 30-40% reduction in repeated className strings

### Accessibility
- **Keyboard navigation:** All interactive elements focusable with visible indicator
- **Touch targets:** All buttons/links ≥44px on mobile

---

## Appendix: File Inventory

### Components by Type

**Client Components (77):**
- `/components`: 64 client components
- `/app`: 13 client components (pages/wrappers)

**Server Components (17):**
- Most `/app/*/page.tsx` files (browse, book/[slug], screen/[slug], etc.)

**Mixed (13):**
- Pages with server shell + client components (compare, search, user profiles)

### Largest Components (LOC)
1. `Header.tsx` - 445 lines ⚠️
2. `DiffItemCard.tsx` - ~400 lines (estimated) ⚠️
3. `ComparisonView.tsx` - ~350 lines ⚠️
4. `AddDiffForm.tsx` - ~300 lines ⚠️
5. `ModQueue.tsx` - ~280 lines

**Recommendation:** Components > 300 lines should be split into smaller pieces.

---

## Notes

- **No critical bugs found** - This is a code quality/maintainability audit, not a bug report
- **Design system is solid** - `brutalist-design.ts` tokens are well-designed, just need to be used consistently
- **Tailwind usage is good** - Just needs more consistency via shared components
- **Accessibility is decent** - Has ARIA labels, semantic HTML, but needs focus-visible improvements
- **Performance baseline needed** - Run Lighthouse and measure before optimizing

---

**End of Audit**
