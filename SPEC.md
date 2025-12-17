# Adaptapedia MVP Spec

## 0) One-liner

**Adaptapedia** is a community wiki/database that compares **books** and their **screen adaptations** (movies/TV), focusing on **structured "what changed?" diffs** with **spoiler-safe controls**, voting, and lightweight moderation.

---

## 1) Product goals

### Primary goals

1. **Structured diffs** (not essays): consistent categories (Plot, Character, Ending, etc.).
2. **Spoiler-safe browsing by default** (user-controlled spoiler scope).
3. **Scale via automation for metadata + pairing graph** (book ↔ adaptation), while diffs are community-curated.
4. **Credibility signals** via voting, version targeting, and moderation.

### Non-goals (MVP)

* No automated "perfect diffs" generation.
* No scene-by-scene alignment engine.
* No full social network (follows, DMs).
* No paid features required to be successful in MVP.

---

## 2) Target users

* Readers/watchers who want to know **what changed** between book and screen.
* Fans who want a **canonical, structured list** (with debates in comments).
* Contributors who enjoy editing/curating.
* Educators/students (secondary).

---

## 3) Core UX principles

### Wikipedia-clean structure

* Lead summary + infobox style "quick facts"
* Table of contents
* Clear headings and dense-but-readable layout

### 80s/90s feel (controlled)

* Default theme is clean.
* Retro aesthetics are *accents* (badges, borders, link styles).
* Optional **Retro Mode** toggle applies stronger nostalgic styling (CRT-ish subtle textures, mono labels, etc.), but **never** compromises readability.

---

## 4) MVP feature scope

### Must-have

* Search + browse works (books) and screen works (movies/series)
* Pairing graph (book → adaptation(s))
* Comparison page (Book X ↔ Screen Y)
* Structured diff items with:

  * category
  * claim + detail
  * spoiler scope
  * version targeting
  * voting
  * comments (optional but recommended)
* User accounts (email/password or OAuth)
* Basic moderation: report queue + remove/lock
* Data ingestion pipeline:

  * Wikidata pairing
  * Open Library book metadata
  * TMDb (or OMDb) screen metadata
* Attribution/data sources page

### Nice-to-have (only if time)

* Shareable "diff cards" (OG image)
* Trending pages
* "Request a title" queue

---

## 5) Page map (IA)

1. **Home**

   * Search bar (primary)
   * Trending comparisons (optional)
   * "Recently updated diffs" (optional)

2. **Book Work Page** `/book/:slug`

   * Lead summary
   * Infobox: author, year, identifiers, genres
   * List of adaptations (movie/series)
   * "Top diffs" (from most-voted diffs across adaptations)
   * TOC sections: Overview, Adaptations, Differences (by adaptation), Discussion

3. **Screen Work Page** `/screen/:slug`

   * Lead summary
   * Infobox: release, runtime, creators, cast
   * "Based on" source book(s)
   * TOC sections: Overview, Source(s), Differences, Discussion

4. **Comparison Page** `/compare/:bookSlug/:screenSlug`

   * Version picker (book edition optional; screen cut/season optional)
   * Spoiler controls (global)
   * Category sections of diffs (scanable)
   * Add diff CTA
   * Votes + "needs nuance" signals

5. **Add Diff** `/compare/:bookSlug/:screenSlug/add`

   * Structured form (category, claim, detail, spoiler scope, version tags, optional "receipt" fields)

6. **User Profile** `/u/:handle`

   * Contributions summary
   * Trust level / badges (lightweight)

7. **Moderation Queue** `/mod/queue` (admin/mod only)

   * reports
   * pending items (if using approval workflow)

8. **About / Data Sources** `/about/sources`

   * Required attributions (TMDb, Open Library, Wikidata)

---

## 6) Spoiler system

### Spoiler scopes (enum)

* `NONE` (safe/high-level; no plot specifics)
* `BOOK_ONLY`
* `SCREEN_ONLY`
* `FULL`

### Global spoiler setting (per user)

* Default: **NONE**
* Users can raise scope:

  * NONE → BOOK_ONLY / SCREEN_ONLY → FULL
* UI rule: content above user scope is **collapsed + masked** (blur + "Reveal").

### SEO rule (important)

* Render spoiler-heavy content **client-side only** after user interaction OR keep it in HTML but behind details/summary (tradeoffs). MVP recommendation:

  * SSR renders **safe** items only.
  * Spoiler items fetched via API after user opts-in.

---

## 7) Data sources & ingestion

### Pairing graph (book ↔ screen)

* Use **Wikidata** "based on" relationships (P144) to create edges:

  * ScreenWork QID → Work QID
* Store raw QIDs for traceability and refreshes.

### Book metadata

* **Open Library**:

  * Work/edition metadata (title, authors, cover IDs, publish year)
  * Prefer Work-level entity; optionally store "primary edition"

### Screen metadata

* **TMDb** recommended:

  * movie/tv details, posters, cast/crew, release dates
  * Must include TMDb attribution in UI/footer on relevant pages
  * If using watch providers, ensure JustWatch attribution requirements are met (optional)

> If monetization becomes significant, revisit TMDb licensing implications early. MVP: keep integration modular.

### Ingestion jobs (background)

1. `ingest_wikidata_pairs` (daily)
2. `resolve_openlibrary_books` (daily + on-demand)
3. `resolve_tmdb_screenworks` (daily + on-demand)
4. `refresh_popularity_metrics` (hourly/daily)

---

## 8) Tech stack recommendation

### Frontend

* **Next.js** (App Router)
* SSR for primary pages (safe content)
* Client fetch for spoiler content beyond current scope

### Backend

* **Django + DRF**
* Auth: Django auth + JWT (or session)
* Background: **Celery + Redis**
* DB: **Postgres**
* Optional: S3-compatible storage for cached images (or proxy via providers)

### Search (MVP)

* Postgres full-text search across:

  * titles, aliases, author/director, year
* Upgrade later to Meilisearch/Typesense.

---

## 9) Data model (Postgres)

### Core entities

#### `work` (book)

* `id` (pk)
* `title`
* `slug` (unique)
* `summary` (optional)
* `year` (nullable)
* `language` (nullable)
* `wikidata_qid` (unique nullable)
* `openlibrary_work_id` (unique nullable)
* `cover_url` (nullable)
* `created_at`, `updated_at`

Indexes:

* `slug unique`
* `wikidata_qid unique`
* `openlibrary_work_id unique`
* FTS index on `title`, `summary`

#### `screen_work` (movie/tv)

* `id`
* `type` enum: `MOVIE` | `TV`
* `title`
* `slug` (unique)
* `summary` (optional)
* `year` (nullable)
* `wikidata_qid` (unique nullable)
* `tmdb_id` (unique nullable)
* `poster_url` (nullable)
* `created_at`, `updated_at`

Indexes:

* `slug unique`
* `tmdb_id unique`
* `wikidata_qid unique`

#### `adaptation_edge`

* `id`
* `work_id` (fk work)
* `screen_work_id` (fk screen_work)
* `relation_type` enum: `BASED_ON` | `INSPIRED_BY` | `LOOSELY_BASED`
* `source` enum: `WIKIDATA` | `MANUAL`
* `confidence` smallint (0–100)
* `created_at`

Unique constraint:

* (`work_id`, `screen_work_id`)

#### `version`

* `id`
* `entity_type` enum: `WORK` | `SCREEN`
* `entity_id` (fk via polymorphic or two nullable fks)
* `label` (e.g., "1st edition", "Director's cut", "Season 1")
* `release_date` (nullable)
* `metadata_json` (nullable)

MVP: versions optional; ship with a single default version per entity.

---

## 10) Diff system

#### `diff_item`

* `id`
* `work_id` (fk)
* `screen_work_id` (fk)
* `category` enum:

  * `PLOT`, `CHARACTER`, `ENDING`, `SETTING`, `THEME`, `TONE`, `TIMELINE`, `WORLDBUILDING`, `OTHER`
* `claim` (short text, required, 140–200 chars recommended)
* `detail` (long text, optional, 1–8 short paragraphs max)
* `spoiler_scope` enum: `NONE`, `BOOK_ONLY`, `SCREEN_ONLY`, `FULL`
* `work_version_id` (nullable fk version)
* `screen_version_id` (nullable fk version)
* `status` enum: `LIVE`, `HIDDEN`, `LOCKED`, `PENDING` (choose workflow)
* `created_by_user_id`
* `created_at`, `updated_at`

Indexes:

* (`work_id`, `screen_work_id`)
* (`category`)
* (`status`)
* (`spoiler_scope`)

#### `diff_vote`

* `id`
* `diff_item_id`
* `user_id`
* `vote` enum:

  * `ACCURATE`
  * `NEEDS_NUANCE`
  * `DISAGREE`
* `created_at`

Unique:

* (`diff_item_id`, `user_id`)

#### `diff_comment`

* `id`
* `diff_item_id`
* `user_id`
* `body`
* `spoiler_scope` (inherit or explicit)
* `status` enum: `LIVE`, `HIDDEN`
* `created_at`

#### `report`

* `id`
* `target_type` enum: `DIFF`, `COMMENT`
* `target_id`
* `reason` enum: `SPAM`, `ABUSE`, `COPYRIGHT`, `INCORRECT`, `SPOILER_MISLABELED`, `OTHER`
* `detail` (optional)
* `created_by_user_id`
* `status` enum: `OPEN`, `RESOLVED`, `DISMISSED`
* `created_at`, `resolved_at`

---

## 11) Trust, roles, moderation

### Roles

* `USER`
* `TRUSTED_EDITOR` (earned via reputation)
* `MOD`
* `ADMIN`

### Reputation (simple MVP)

* Points:

  * +1 per diff submission that stays live 7 days
  * +1 per diff reaching net "accurate" threshold (e.g., accurate - disagree ≥ 5)
  * -5 for removed as spam/copyright
* Unlock `TRUSTED_EDITOR` at threshold (e.g., 30 points)

### Moderation actions

* Hide diff/comment
* Lock diff (no further edits/comments)
* Change spoiler scope (with audit log)
* Merge duplicates (Phase 2)

---

## 12) API surface (DRF)

### Public

* `GET /api/search?q=`
* `GET /api/work/:slug`
* `GET /api/screen/:slug`
* `GET /api/compare?work=:slug&screen=:slug&spoiler_scope=NONE|...`

  * returns only diffs <= user scope unless user is authenticated and opted-in
* `GET /api/diffs?work_id=&screen_work_id=&category=`

### Authenticated

* `POST /api/diff` (create)
* `PATCH /api/diff/:id` (edit; restrict)
* `POST /api/diff/:id/vote`
* `POST /api/diff/:id/comment`
* `POST /api/report`

### Moderation

* `GET /api/mod/reports`
* `POST /api/mod/action` (hide/lock/update spoiler)

---

## 13) Frontend components (Next.js)

### Shared

* `SearchBar`
* `Infobox` (book/screen facts)
* `TOC` auto-generated from headings
* `SpoilerScopeToggle`
* `CategoryNav` (chips + scroll)
* `DiffItemCard`
* `VoteBar` (Accurate / Needs nuance / Disagree)
* `SpoilerMask` (collapsible reveal)
* `AddDiffCTA`
* `AttributionFooter`

### Comparison page layout

* Top: Book mini-card + Screen mini-card + version picker
* Sticky: spoiler toggle + category filter
* Body: category sections with diff cards
* Sidebar: "Top changes", "Most disputed", "Ending status"

---

## 14) Design system

### Default theme (clean)

* Typography:

  * Body: modern readable system font stack
  * Headings: same family, heavier weight
  * Mono: used *only* for small labels/badges ("PATCHED", "DISPUTED"), never long paragraphs
* Colors:

  * Mostly neutral
  * Links slightly saturated
  * Badges color-coded but accessible

### Retro Mode (optional toggle)

* Adds:

  * subtle 1px inset borders
  * slightly warmer paper background
  * tiny "terminal" badge styling
  * optional halftone header divider
* Must preserve:

  * contrast ratios
  * line height
  * paragraph readability

Implementation:

* CSS variables: `--bg`, `--text`, `--muted`, `--link`, `--border`, `--badge-*`
* Toggle stored in localStorage + user profile preference.

---

## 15) SEO + performance requirements

### SEO

* SSR:

  * work/screen pages
  * comparison pages (safe diffs only)
* Avoid indexing spoiler content:

  * Only SSR scope `NONE`
  * Other scopes loaded client-side after user opt-in

### Performance

* Cache metadata pages (CDN + server cache)
* Paginate diffs if > 200
* Precompute "Top diffs" per comparison nightly

---

## 16) Testing requirements

### Unit tests (backend)

* diff creation validation
* spoiler scope enforcement
* voting uniqueness
* report workflow

### Integration tests

* ingestion pipeline creates/updates works without duplication
* compare API returns correct diff filtering by spoiler scope

### Frontend tests

* spoiler toggle hides/unhides correctly
* category navigation scrolls to section
* vote flow optimistic update + rollback on error

---

## 17) Analytics (internal, privacy-conscious)

Track:

* search queries (aggregate)
* compare page views
* diff submission conversion (view → add)
* votes per diff
* report rate

No need for invasive tracking. Basic event logging table is fine.

---

## 18) Deployment & ops

* Dockerized services: `web`, `worker`, `beat`, `db`, `redis`
* Env vars:

  * `DATABASE_URL`
  * `REDIS_URL`
  * `SECRET_KEY`
  * `TMDB_API_KEY` (if TMDb)
  * `OPEN_LIBRARY_BASE_URL`
  * `WIKIDATA_SPARQL_ENDPOINT`
* Scheduled jobs via Celery Beat:

  * nightly ingestion + recompute stats

---

## 19) Legal / attribution checklist (MVP)

* Data sources page with:

  * Wikidata attribution (and link)
  * Open Library attribution
  * TMDb attribution/logo if used
* User content rules:

  * No copyrighted excerpts beyond short fair-use snippets (keep UI discouraging long quotes)
  * Report reason "COPYRIGHT" for takedowns

---

## 20) Acceptance criteria (MVP complete when…)

1. A user can search a title and land on a **book page** with at least one **adaptation listed**.
2. A user can open a **comparison page** and see **categorized diffs**, spoiler-safe by default.
3. A logged-in user can **add a diff**, choose spoiler scope, and it appears on the page.
4. Users can **vote** and see consensus signals.
5. Users can **report** problematic content; mods can act in a queue.
6. Ingestion runs on schedule and updates metadata without duplicating records.
7. Required attributions are visible.

---

## 21) Suggested build order (fastest path)

### Sprint 1

* DB schema + basic admin
* Ingestion: Wikidata → create minimal Work/ScreenWork + edges
* Public pages: Home + Work + Screen + Compare (SSR safe)

### Sprint 2

* Diff CRUD + voting + spoiler filtering
* Auth + profiles
* Add Diff flow

### Sprint 3

* Reports + mod queue + hide/lock
* Open Library + TMDb enrichment
* Retro Mode toggle (skin only)

---

If you want, I can also output this as a **repo scaffold checklist** (folders, filenames, key modules) and a **starter SPARQL query** for Wikidata P144 ingestion that Claude Code can paste directly into the ingestion worker.
