---
description: Review React/Next.js frontend code for best practices
allowed-tools: [Read, Grep, Task, Bash]
argument-hint: <file or directory>
---

Review the Next.js/React code in $ARGUMENTS and check for:

**Next.js App Router Patterns:**
- Server Components used by default
- Client Components only when needed (interactivity, browser APIs, hooks)
- Proper use of 'use client' directive
- No unnecessary client-side rendering

**Component Quality:**
- Single Responsibility Principle
- Reusable components in `components/` directory
- Props properly typed with TypeScript
- No prop drilling (use context when appropriate)

**Performance:**
- Lazy loading for heavy components/images
- Next.js Image component used for optimization
- Minimal client-side JavaScript
- No unnecessary re-renders

**Accessibility:**
- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance

**API Integration:**
- No direct API calls in components (use server actions or API routes)
- Proper error handling and loading states
- Type-safe API responses

**Code Quality:**
- No code duplication
- Clear component and function names
- Components under ~200 lines (refactor if larger)
- Consistent styling patterns

Compare against standards in CLAUDE.md and provide specific improvements.
