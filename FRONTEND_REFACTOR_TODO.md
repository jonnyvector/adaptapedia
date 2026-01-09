# Frontend Refactor TODO

**Status:** 🚧 In Progress
**Created:** 2026-01-09
**Last Updated:** 2026-01-09

---

## 📊 Progress Overview

- ✅ **Phase 1: Foundation Complete** (28 commits)
  - P0 critical issues fixed
  - Shared component library created (Button, Input, Textarea, Card, LoadingState, NavLink)
  - Design tokens extended
  - Initial migrations complete

- 🚧 **Phase 2: Full Migration** (Current)
  - 24 tasks remaining
  - Full component migration
  - Design token cleanup
  - Quality improvements

---

## 🔧 Component Migrations

### Button Component Migration (3 tasks)

- [ ] **Task 1:** Migrate all Button instances in diff components
  - Files: `AddDiffForm.tsx`, `DiffItemCard.tsx`, `ComparisonVoting.tsx`, `MatchupScoreboard.tsx`, `QuickVoteModal.tsx`, etc.
  - Estimated: ~20 buttons
  - Replace inline button styling with `<Button variant="..." size="...">`

- [ ] **Task 2:** Migrate all Button instances in layout components
  - Files: `UserDropdown.tsx`, `NotificationBell.tsx`, `Footer.tsx`, `ThemeToggle.tsx`, etc.
  - Estimated: ~10 buttons
  - Ensure accessibility props (aria-label, aria-expanded) are preserved

- [ ] **Task 3:** Migrate all Button instances in other components
  - Files: Search components, Browse pages, User profile, Onboarding, Settings, etc.
  - Estimated: ~14 buttons
  - Total: **~44 buttons** to migrate

### Input/Textarea Component Migration (4 tasks)

- [ ] **Task 4:** Migrate AddDiffForm to use Input/Textarea components
  - Replace claim/detail textareas with `<Textarea>`
  - Add character count support
  - Preserve spoiler scope selector integration

- [ ] **Task 5:** Migrate AddCommentForm to use Textarea component
  - Replace comment textarea with `<Textarea showCharCount maxLength={500}>`
  - Maintain error state integration

- [ ] **Task 6:** Migrate search inputs in Header to use Input component
  - Desktop search input (line 140-153)
  - Mobile search input (line 276-285)
  - Preserve SearchDropdown integration

- [ ] **Task 7:** Migrate other form components to use Input/Textarea
  - Onboarding forms (UsernameStep, etc.)
  - Settings/profile edit forms
  - Any other form inputs found

### Card Component Migration (3 tasks)

- [ ] **Task 8:** Migrate ComparisonCard to use Card component
  - Replace: `group block border ${BORDERS.medium} overflow-hidden hover:border-black`
  - Use: `<Card variant="subtle" interactive padding="none">`

- [ ] **Task 9:** Migrate DiffItemCard to use Card component
  - Replace: `border ${BORDERS.medium} bg-white dark:bg-black p-4 sm:p-5 md:p-6`
  - Use: `<Card variant="default" padding="md">`

- [ ] **Task 10:** Migrate TrendingComparisons and other card-based layouts
  - TrendingComparisons.tsx
  - UserDiffsList.tsx
  - Any other card patterns

### LoadingState Component Migration (1 task)

- [ ] **Task 11:** Replace loading states with LoadingState component
  - ComparisonVoting.tsx (line 143)
  - CompactVoteStrip.tsx (line 60)
  - Any other `Loading...` text patterns
  - Replace with: `<LoadingState message="Loading..." size="md" />`

---

## 🎨 Design Token Cleanup

### Text Size Tokens (1 task)

- [ ] **Task 12:** Replace remaining arbitrary text sizes
  - Pattern: `text-[Xpx]` → Use `TEXT.micro`, `TEXT.metadata`, `TEXT.label`, etc.
  - Files with arbitrary text sizes: ~15 files
  - Document one-off sizes with comments if truly unique

### Height Tokens (1 task)

- [ ] **Task 13:** Replace remaining arbitrary heights
  - Pattern: `h-[Xpx]`, `min-h-[Xpx]` → Use `HEIGHT.touchTarget`, `HEIGHT.input`, etc.
  - Header search inputs: `min-h-[40px]` → `${HEIGHT.input}`
  - NotificationBell: `min-h-[40px]` → `${HEIGHT.input}`
  - Footer links: `min-h-[28px]` → Document or create token

### Width Tokens (1 task)

- [ ] **Task 14:** Replace remaining arbitrary widths
  - Pattern: `w-[Xpx]`, `max-w-[Xpx]` → Use `WIDTH.*` tokens
  - ComparisonIdentityHero: `w-[220px] h-[330px]` → Create tokens or document
  - NotificationBell dropdown: `w-96` → Keep or create `WIDTH.dropdown`

### Border Radius Cleanup (1 task)

- [ ] **Task 15:** Replace all hardcoded `rounded-md` with `RADIUS.control`
  - Search pattern: `rounded-md`, `rounded`, `rounded-lg`
  - Ensure consistency across all components
  - Exception: `RADIUS.none` for structural elements

---

## ✨ P2 Improvements

### Icon Extraction (1 task)

- [ ] **Task 16:** Extract inline SVG icons (P2-3)
  - Option A: Move all SVGs to `Icons.tsx`
  - Option B: Migrate to `lucide-react` package
  - Files with inline SVGs: Header, UserDropdown, NotificationBell, etc.
  - Benefits: Smaller bundle, easier maintenance

### Accessibility Improvements (1 task)

- [ ] **Task 17:** Improve focus-visible states (P2-5)
  - Add consistent `focus-visible:outline-2 focus-visible:outline-offset-2` to all interactive elements
  - Buttons, links, inputs, cards with onClick handlers
  - Ensure keyboard navigation is clear and accessible

### Component Extraction (1 task)

- [ ] **Task 18:** Extract search logic from Header (P2-6)
  - Create `SearchInput.tsx` component
  - Move search state, debouncing, and dropdown logic
  - Reduce Header.tsx complexity (currently 395 lines)

---

## 🐛 Bug Fixes

### Image Optimization (1 task)

- [ ] **Task 19:** Fix remaining image optimization warnings
  - `app/browse/[genre]/page.tsx` (line 111)
  - `app/screen/[slug]/page.tsx` (line 236)
  - `app/u/[username]/bookmarks/page.tsx` (lines 135, 157)
  - Replace `<img>` with `<Image>` from `next/image`

### ESLint Fixes (1 task)

- [ ] **Task 20:** Fix ESLint unescaped entities errors
  - **Pattern:** `'` → `&apos;` or `'`
  - **Pattern:** `"` → `&quot;` or `"`
  - **Files affected (~15 files):**
    - app/about/page.tsx (3 errors)
    - app/about/sources/page.tsx (3 errors)
    - Error/not-found pages (multiple files)
    - app/page.tsx (3 errors)
    - components/diff/ComparisonVoting.tsx (1 error)
    - components/diff/QuickVoteModal.tsx (2 errors)
    - components/needs-help/NeedsHelpClient.tsx (1 error)
    - components/user/UserProfileClient.tsx (4 errors)

### React Hooks Warnings (1 task)

- [ ] **Task 21:** Fix React Hook exhaustive-deps warnings
  - CommentsList.tsx: Add `fetchComments` to deps or wrap in `useCallback`
  - CompactVoteStrip.tsx: Add `fetchStats` to deps or wrap in `useCallback`
  - ComparisonVoting.tsx: Add `fetchStats` to deps or wrap in `useCallback`
  - DiffItemCard.tsx: Add `setCommentsExpanded` to deps (or remove if not needed)
  - ModQueue.tsx: Add `loadItems` to deps or wrap in `useCallback`
  - FadeIn.tsx: Fix ref cleanup pattern

---

## ✅ Final QA

### Type Safety (1 task)

- [ ] **Task 22:** Run final type-check
  - Command: `npm run type-check`
  - Verify: Zero TypeScript errors
  - Fix any issues introduced during migration

### Production Build (1 task)

- [ ] **Task 23:** Run final build
  - Command: `npm run build`
  - Verify: Build succeeds with zero errors
  - Address any warnings that are fixable

### Documentation (1 task)

- [ ] **Task 24:** Update FRONTEND_AUDIT.md with completion status
  - Mark all P0, P1, P2 issues as ✅ Complete
  - Add "Refactor Completed" section with metrics:
    - Total commits
    - Components migrated
    - Lines of code refactored
    - Performance improvements
  - Add maintenance notes for future developers

---

## 📈 Success Metrics

When all tasks are complete, we will have achieved:

- ✅ **100% component migration** to shared library
- ✅ **Zero arbitrary Tailwind values** (all using design tokens)
- ✅ **Zero TypeScript errors**
- ✅ **Zero build errors**
- ✅ **Consistent styling** across entire app
- ✅ **Improved accessibility** (focus states, ARIA labels)
- ✅ **Better performance** (image optimization, smaller bundle)
- ✅ **Enterprise-level code quality**

---

## 🚀 Execution Notes

- **Strategy:** Work through tasks sequentially, one at a time
- **Commits:** Atomic commits for each logical change
- **Testing:** Verify changes in Docker after each major migration
- **Rollback:** Each commit is safe to revert if issues arise

**Estimated Total Effort:** ~50-70 commits, comprehensive refactor

---

## 🎯 Ready to Execute

To begin working through this list:

1. Review this TODO file
2. Confirm approach with team
3. Start with Task 1 and work sequentially
4. Check off items as completed
5. Update "Last Updated" date when making progress

**Current Status:** Awaiting approval to proceed with Phase 2
