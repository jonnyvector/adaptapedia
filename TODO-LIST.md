# Adaptapedia TODO List

## Project Status

### ✅ Completed (MVP Foundation)

**Backend (100% core functionality):**

- ✓ Django + DRF with 6 apps (works, screen, diffs, users, moderation, ingestion)
- ✓ Complete data models with type hints
- ✓ RESTful API for all entities
- ✓ Spoiler filtering system
- ✓ Voting system (backend)
- ✓ Comment system (backend)
- ✓ Report/moderation system
- ✓ Celery tasks for Wikidata/TMDb/Open Library
- ✓ 2,185 books, 3,417 screen works ingested
- ✓ Sample data: Jurassic Park (6 diffs), Sphere (5 diffs)

**Frontend (30% MVP):**

- ✓ Next.js App Router with TypeScript
- ✓ Comparison page with spoiler controls
- ✓ Vote display (read-only)
- ✓ DiffItemCard component with category badges
- ✓ SpoilerScopeToggle component
- ✓ Home page with navigation
- ✓ Tailwind CSS design system

**Infrastructure:**

- ✓ Docker Compose setup (6 services: db, redis, backend, worker, beat, frontend)
- ✓ PostgreSQL + Redis
- ✓ Git repository initialized
- ✓ CLAUDE.md with dev standards
- ✓ SPEC.md with complete requirements

---

## 🔥 High Priority (Core MVP Features)

### User Interaction

- [ ] **1. Add interactive voting UI to DiffItemCard**

  - Vote buttons (↑ Accurate, ~ Needs Nuance, ↓ Disagree)
  - Show user's current vote with highlighting
  - Optimistic UI updates
  - Login prompt for unauthenticated users

- [ ] **2. Create authentication pages**

  - Login page (/login)
  - Signup page (/signup)
  - JWT token storage
  - Protected route wrapper
  - Logout functionality
  - User context provider

- [ ] **3. Add comment display section to DiffItemCard**

  - List comments below each diff
  - Show comment spoiler scope
  - Filter by user's spoiler preference
  - Expand/collapse comments
  - "X comments" indicator

- [ ] **4. Create add comment form**
  - Text input with validation
  - Spoiler scope selector
  - Character limit (500 chars recommended)
  - Submit button with loading state
  - Optimistic UI update

### Content Discovery

- [ ] **5. Build Add Diff page** (/compare/[book]/[screen]/add)

  - Category dropdown
  - Claim input (140-200 chars)
  - Detail textarea (optional, 1-8 paragraphs)
  - Spoiler scope selector
  - Version targeting (optional for MVP)
  - Preview before submit
  - Success message + redirect

- [ ] **6. Create Book Work detail page** (/book/[slug])

  - Lead summary + infobox
  - List of adaptations with links
  - "Top diffs" from all adaptations
  - Add to comparison CTA

- [ ] **7. Create Screen Work detail page** (/screen/[slug])

  - Lead summary + infobox
  - "Based on" source book(s)
  - Top diffs
  - Compare with book CTA

- [ ] **8. Implement search functionality**
  - Search bar component (header)
  - Combined search (works + screen works)
  - Results page with filters
  - Autocomplete/suggestions (nice-to-have)
  - Empty state handling

### User-Facing Pages

- [ ] **9. Create moderation queue UI** (/mod/queue)

  - Admin/mod only access
  - List of reports with filters
  - Report detail view
  - Hide/lock/dismiss actions
  - Audit log

- [ ] **10. Build About/Data Sources attribution page** (/about/sources)

  - TMDb attribution + logo
  - Open Library attribution
  - Wikidata attribution
  - User content policy
  - Copyright notice

- [ ] **11. Create user profile page** (/u/[handle])
  - User info (username, join date, role)
  - Contributions list (diffs, comments)
  - Reputation score
  - Trust level badges
  - Recent activity

---

## 🎨 Medium Priority (Polish & Quality)

### Design & UX

- [ ] **12. Add Retro Mode theme toggle**
  - Toggle component in header
  - CSS variable overrides
  - localStorage persistence
  - User preference (if logged in)
  - CRT-ish subtle textures (optional)
  - Maintain readability

### Testing

- [ ] **13. Write backend tests**

  - Models: Work, ScreenWork, DiffItem, User
  - API endpoints: GET/POST for diffs, works, screen
  - Services: WorkService, DiffService
  - Spoiler filtering logic
  - Voting uniqueness
  - Report workflow
  - Target: 80%+ coverage

- [ ] **14. Write frontend tests**
  - Components: DiffItemCard, SpoilerScopeToggle, ComparisonView
  - Voting flow (optimistic update + rollback)
  - Spoiler toggle (hides/shows correctly)
  - Comment form validation
  - E2E: Search → Compare → Add Diff

### Content

- [ ] **15. Enrich 10-20 popular titles with TMDb metadata**

  - Run `enrich_screenwork_from_tmdb` task
  - Priority: Jurassic Park, Sphere, Harry Potter, LOTR, etc.
  - Add posters, summaries, cast info
  - Verify TMDb attribution displayed

- [ ] **16. Add 3-5 more sample comparisons with diffs**
  - Suggestions: Harry Potter, The Hunger Games, Dune, The Shining, Fight Club
  - 5-10 diffs each
  - Mix of spoiler scopes
  - Add votes from test users

### Infrastructure

- [ ] **17. Implement error pages**

  - 404 Not Found (custom message)
  - 500 Internal Server Error
  - API error boundary
  - Helpful messages + navigation back

- [ ] **18. Add loading states to all async operations**

  - Comparison page loading
  - Vote button loading
  - Comment submit loading
  - Search loading
  - Skeleton screens (nice-to-have)

- [ ] **19. Optimize for mobile/responsive design**
  - Test on mobile breakpoints
  - Touch-friendly buttons (min 44px)
  - Hamburger menu (if needed)
  - Comparison page stacking
  - Vote bars mobile-friendly

---

## ⚙️ Low Priority (Operations & Nice-to-Have)

- [ ] **20. Set up Celery Beat schedule for daily ingestion**
  - Configure in `backend/adaptapedia/celery.py`
  - Daily Wikidata ingestion (3am UTC)
  - Weekly TMDb enrichment for popular titles
  - Nightly "Top diffs" recomputation
  - Monitoring/alerting (optional)

### Future Enhancements (Post-MVP)

- [ ] Shareable "diff cards" (OG images)
- [ ] Trending pages/diffs
- [ ] "Request a title" queue
- [ ] Email notifications
- [ ] RSS feeds for comparisons
- [ ] Advanced search filters (year, genre, etc.)
- [ ] Diff editing/versioning
- [ ] Merge duplicate diffs
- [ ] Reputation system refinement
- [ ] Scene-by-scene alignment (ambitious!)

---

## 🚀 Quickest Path to Usable MVP

**Phase 1: Core Interaction (Week 1)**

1. Authentication UI (Task #2)
2. Interactive voting (Task #1)
3. Comments display + form (Tasks #3-4)

**Phase 2: Content Discovery (Week 2)** 4. Search functionality (Task #8) 5. Work detail pages (Tasks #6-7) 6. Add Diff page (Task #5)

**Phase 3: Quality & Testing (Week 3)** 7. Backend tests (Task #13) 8. Frontend tests (Task #14) 9. Error pages + loading states (Tasks #17-18) 10. Mobile optimization (Task #19)

**Phase 4: Polish & Launch (Week 4)** 11. Attribution page (Task #10) 12. User profiles (Task #11) 13. More sample data (Tasks #15-16) 14. Retro Mode (Task #12) 15. Moderation UI (Task #9)

---

## Notes

- **Dev Standards:** Never take shortcuts, always DRY, write tests before marking features complete
- **Current Status:** Backend at 100%, Frontend at 30%, Infrastructure at 100%
- **Blockers:** None - all dependencies resolved
- **Next Session:** Start with Auth UI + Interactive Voting to unlock core user experience
