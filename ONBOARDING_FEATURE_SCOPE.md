# User Onboarding Feature Scope

## Overview
Create a guided onboarding flow for new users (both social auth and traditional signup) that personalizes their experience and encourages immediate contribution.

## User Flow

### Step 1: Username Selection (REQUIRED)
**Trigger:** After successful authentication (social or traditional signup)
- **For Social Auth:** User is created with temporary username (`google_<id>`, `facebook_<id>`), MUST choose real username before proceeding
- **For Traditional Signup:** Username already chosen during signup, this step is skipped

**UI/UX:**
```
┌─────────────────────────────────────────┐
│  Welcome to Adaptapedia!                │
│                                         │
│  Choose your username                   │
│                                         │
│  [___________________]  Check          │
│                                         │
│  Suggestions:                           │
│  • bookworm_2026                       │
│  • movie_buff_x                        │
│  • adaptafan_123                       │
│                                         │
│  ✓ Available                           │
│  ✗ Username already taken              │
│  ✗ Username contains profanity         │
│  ✗ Username is reserved                │
│                                         │
│          [Continue →]                   │
└─────────────────────────────────────────┘
```

**Features:**
- Real-time username availability checking (debounced API call)
- Automatic username suggestions based on:
  - Social auth profile name (if available)
  - Generic suggestions (bookworm, movie_buff, etc.)
- Validation rules:
  - 3-20 characters
  - Alphanumeric + underscores only
  - Case-insensitive uniqueness check (DB-level constraint)
  - Reserved username blocklist (admin, support, moderator, api, adaptapedia, etc.)
  - Basic profanity filter
- NO skip button - username is required

**Technical Requirements:**
- API endpoint: `POST /api/users/me/username/check/` (requires auth, returns `{available: boolean, suggestions?: string[], error?: string}`)
- API endpoint: `POST /api/users/me/username/` (requires auth, sets username)
- Username generation service on backend
- Debounced API calls (300ms delay)
- Race condition handling: catch `IntegrityError` on username save
- Rate limiting: 10 requests/minute per user

### Step 2: Interest Quiz (OPTIONAL - Skippable)
**UI/UX:**
```
┌─────────────────────────────────────────┐
│  Tell us what you like (2/3)           │
│                                         │
│  What genres interest you? (Optional)  │
│                                         │
│  [✓] Fiction    [ ] Non-Fiction        │
│  [✓] Fantasy    [ ] Mystery            │
│  [ ] Sci-Fi     [✓] Romance            │
│  [ ] Horror     [ ] Biography          │
│  [ ] Drama      [ ] Historical         │
│                                         │
│  What do you prefer?                   │
│  ( ) Books more than adaptations       │
│  ( ) Both equally                      │
│  (•) Adaptations more than books       │
│                                         │
│  What interests you most?              │
│  (•) Point out differences             │
│  ( ) Discuss with others               │
│  ( ) Just exploring                    │
│                                         │
│  [Skip]    [← Back]      [Continue →]  │
└─────────────────────────────────────────┘
```

**Questions:**
1. **Genre Selection** (multi-select, OPTIONAL - minimum 0)
   - Fiction, Non-Fiction, Fantasy, Mystery, Sci-Fi, Romance, Horror, Biography, Drama, Historical, Thriller, Comedy

2. **Preference Scale** (single-select)
   - "I love books more than adaptations"
   - "I enjoy both equally"
   - "I prefer watching over reading"

3. **Contribution Interest** (single-select) - CRITICAL for step 3 algorithm
   - "Point out differences" → `ADD_DIFFS`
   - "Discuss with others" → `DISCUSS`
   - "Just exploring" → `EXPLORE`

**Technical Requirements:**
- New model: `UserPreferences`
  ```python
  class UserPreferences(models.Model):
      user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
      genres = ArrayField(models.CharField(max_length=50), default=list, blank=True)  # Postgres ArrayField
      book_vs_screen = models.CharField(max_length=20, blank=True)  # books/equal/screen
      contribution_interest = models.CharField(max_length=50, blank=True)
      completed_at = models.DateTimeField(auto_now_add=True)

      class Meta:
          indexes = [
              GinIndex(fields=['genres']),  # For efficient overlap queries
          ]
  ```
- API endpoint: `POST /api/users/me/preferences/` (creates/updates preferences)
- Frontend: Multi-step form with progress indicator
- Skip button redirects to step 3 with default suggestions

### Step 3: Suggested Comparisons (OPTIONAL - Skippable)
**UI/UX:**
```
┌─────────────────────────────────────────┐
│  Explore these comparisons (3/3)       │
│                                         │
│  Perfect for adding differences:       │
│  (or "Great for discussion:" / "Top picks:")
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 📖 The Hunger Games → 🎬 Movie    │ │
│  │ Fantasy • 12 differences          │ │
│  │ [Explore →]                       │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 📖 Harry Potter → 🎬 Series       │ │
│  │ Fantasy • 34 differences          │ │
│  │ [Explore →]                       │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 📖 Normal People → 📺 Show        │ │
│  │ Romance • 23 differences          │ │
│  │ [Explore →]                       │ │
│  └───────────────────────────────────┘ │
│                                         │
│     [Skip]          [Get Started!]     │
└─────────────────────────────────────────┘
```

**Features:**
- Show 3-5 comparisons based on **contribution intent** from Step 2:
  - `ADD_DIFFS`: Show "needs help" (5-20 published diffs, popular titles)
  - `DISCUSS`: Show high comment activity + recent activity
  - `EXPLORE` or no preference: Show popular comparisons (30-100 diffs, high votes)
- Filter by selected genres (if any)
- Show default "Top picks" if user skipped Step 2
- Each card links directly to comparison page
- "Skip" button to go straight to homepage

**Technical Requirements:**
- API endpoint: `GET /api/users/me/suggested-comparisons/` (uses preferences if available)
- Intent-based ranking algorithm (see below)
- Only show comparisons with **published, approved diffs** (no drafts/pending moderation)
- Cache suggestions per intent+genre combo (15 minutes)
- Track onboarding completion in user model

## Database Schema Changes

### New Models

**UserPreferences**
```python
from django.contrib.postgres.fields import ArrayField
from django.contrib.postgres.indexes import GinIndex

class UserPreferences(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    genres = ArrayField(
        models.CharField(max_length=50),
        default=list,
        blank=True,
        help_text="List of genre preferences"
    )
    book_vs_screen = models.CharField(
        max_length=20,
        blank=True,
        choices=[
            ('BOOKS', 'Prefer Books'),
            ('EQUAL', 'Enjoy Both Equally'),
            ('SCREEN', 'Prefer Adaptations'),
        ]
    )
    contribution_interest = models.CharField(
        max_length=50,
        blank=True,
        choices=[
            ('ADD_DIFFS', 'Point out differences'),
            ('DISCUSS', 'Discuss with others'),
            ('EXPLORE', 'Just exploring'),
        ]
    )
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "User preferences"
        indexes = [
            GinIndex(fields=['genres']),  # Efficient genre overlap queries
        ]
```

**Reserved Usernames**
```python
# In users/constants.py or similar
RESERVED_USERNAMES = {
    'admin', 'administrator', 'support', 'moderator', 'mod',
    'adaptapedia', 'api', 'root', 'system', 'null', 'undefined',
    'me', 'user', 'users', 'account', 'accounts', 'settings',
    'help', 'about', 'contact', 'privacy', 'terms', 'login',
    'logout', 'signup', 'register', 'auth', 'oauth',
}

# Basic profanity filter (expand as needed)
PROFANITY_BLOCKLIST = {
    # Add common profanity - keep minimal for v1
}
```

### Modified Models

**User Model Updates**
```python
from django.db.models.functions import Lower

class User(AbstractUser):
    # ... existing fields ...

    # Onboarding tracking
    onboarding_completed = models.BooleanField(default=False)
    onboarding_started_at = models.DateTimeField(null=True, blank=True)
    onboarding_completed_at = models.DateTimeField(null=True, blank=True)
    onboarding_step = models.IntegerField(
        default=0,
        choices=[
            (0, 'Not Started'),
            (1, 'Username Selection'),
            (2, 'Interest Quiz'),
            (3, 'Suggested Comparisons'),
            (4, 'Complete'),
        ]
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                Lower('username'),
                name='unique_lower_username',
                violation_error_message='Username already exists (case-insensitive)'
            ),
        ]
        indexes = [
            models.Index(fields=['username']),  # For lookups
        ]
```

**Social Auth Integration**
```python
# When creating user from social auth, generate temporary username
def generate_temp_username(provider, uid):
    """Generate temporary username for social auth users."""
    return f"{provider}_{uid[:8]}"  # e.g., "google_abc12345"

# In social auth signal handler
from allauth.socialaccount.signals import pre_social_login

@receiver(pre_social_login)
def populate_temp_username(sender, request, sociallogin, **kwargs):
    if sociallogin.is_existing:
        return

    # Generate temporary username
    user = sociallogin.user
    if not user.username or user.username.startswith(sociallogin.account.provider):
        user.username = generate_temp_username(
            sociallogin.account.provider,
            sociallogin.account.uid
        )
```

## API Endpoints

All onboarding endpoints use the `/api/users/me/` pattern for security and simplicity.

### Current User Info
```
GET /api/users/me/
Headers: Authorization: Bearer <token>
Response: {
  id: number,
  username: string,
  email: string,
  onboarding_completed: boolean,
  onboarding_step: number,
  preferences?: {
    genres: string[],
    book_vs_screen: string,
    contribution_interest: string
  }
}
```

### Username Management
```
POST /api/users/me/username/check/
Headers: Authorization: Bearer <token>
Body: { username: string }
Response: {
  available: boolean,
  suggestions?: string[],
  error?: string  // "reserved", "profanity", "invalid_format", "taken"
}

Rate Limit: 10 requests/minute per user
```

```
POST /api/users/me/username/
Headers: Authorization: Bearer <token>
Body: { username: string }
Response: {
  success: boolean,
  user: UserSerializer
}
Error Responses:
  - 400: { error: "Username validation failed", detail: "..." }
  - 409: { error: "Username already taken" }  // Race condition caught

Implementation Notes:
- Validate against reserved usernames
- Validate against profanity filter
- Validate format (3-20 chars, alphanumeric + underscores)
- Catch IntegrityError and return 409 for race conditions
- Update onboarding_step to 2 on success
```

### Preferences
```
POST /api/users/me/preferences/
Headers: Authorization: Bearer <token>
Body: {
  genres: string[],  // Optional, can be empty array
  book_vs_screen: string,  // Optional
  contribution_interest: string  // Optional but recommended
}
Response: {
  success: boolean,
  preferences: UserPreferencesSerializer
}

Implementation Notes:
- Validate genres against allowed list
- Create or update UserPreferences (upsert)
- Update onboarding_step to 3 on success
```

### Suggested Comparisons
```
GET /api/users/me/suggested-comparisons/
Headers: Authorization: Bearer <token>
Response: {
  comparisons: [
    {
      work_slug: string,
      work_title: string,
      screen_work_slug: string,
      screen_work_title: string,
      genres: string[],
      diff_count: number,
      vote_count: number,
      comment_count: number
    }
  ],
  intent: string  // "needs_help", "discussion", "popular"
}

Implementation Notes:
- Use preferences.contribution_interest to determine algorithm
- Filter by preferences.genres if available
- Fallback to "popular" if no preferences
- Cache results per (intent, genres) combo for 15 minutes
```

### Onboarding Progress
```
PATCH /api/users/me/
Headers: Authorization: Bearer <token>
Body: {
  onboarding_step?: number,
  onboarding_completed?: boolean
}
Response: {
  success: boolean,
  onboarding_step: number,
  onboarding_completed: boolean
}

Implementation Notes:
- Set onboarding_completed_at when onboarding_completed=true
- Set onboarding_started_at on first step if null
```

## Frontend Components

### New Components
```
frontend/
├── components/
│   └── onboarding/
│       ├── OnboardingModal.tsx           # Main container
│       ├── UsernameStep.tsx              # Step 1
│       ├── QuizStep.tsx                  # Step 2
│       ├── SuggestionsStep.tsx           # Step 3
│       ├── ProgressIndicator.tsx         # 1/3, 2/3, 3/3
│       └── OnboardingLayout.tsx          # Shared layout
├── app/
│   └── onboarding/
│       └── page.tsx                      # Full-page onboarding route
└── lib/
    └── onboarding-utils.ts               # Helper functions
```

### State Management
- Use React Context for onboarding state
- Persist progress to backend on each step
- Allow users to exit and resume later

## Integration Points

### Social Auth Flow
**Current:**
```
OAuth → Backend callback → Frontend /auth/social-callback → Store tokens → Redirect to /
```

**New:**
```
1. OAuth → Google/Facebook
2. Backend callback:
   - Create user with temp username (e.g., "google_abc12345")
   - Set onboarding_completed = False
   - Set onboarding_step = 1 (username required)
   - Generate JWT tokens
3. Frontend /auth/social-callback:
   - Store tokens
   - Fetch user data (GET /api/users/me/)
   - IF (username starts with provider_) → Redirect to /onboarding (step 1 - username)
   - ELSE IF (!onboarding_completed) → Redirect to /onboarding (resume)
   - ELSE → Redirect to /
```

### Traditional Signup Flow
**Current:**
```
Signup form → API call → Store tokens → Redirect to /
```

**New:**
```
1. Signup form (includes username, email, password)
2. API call:
   - Create user with chosen username
   - Set onboarding_completed = False
   - Set onboarding_step = 2 (username already set, skip to quiz)
3. Frontend:
   - Store tokens
   - Redirect to /onboarding (step 2 - quiz)
   - User can skip quiz and suggestions if they want

Note: Traditional signup users already have username, so step 1 is automatically complete.
```

### Homepage Access
**New persistent banner:**
```
IF (user.isAuthenticated && !user.onboarding_completed):
  Show banner: "Complete your profile to get personalized recommendations [Continue setup →]"
  Link to /onboarding (resumes at current step)
```

## Username Generation Logic

### Algorithm
```python
def generate_username_suggestions(base_name=None, count=5):
    """Generate username suggestions."""
    suggestions = []

    if base_name:
        # Clean base name (remove spaces, special chars)
        clean_base = re.sub(r'[^a-zA-Z0-9]', '', base_name.lower())

        # Try variations
        suggestions.extend([
            clean_base,
            f"{clean_base}_{random.randint(1, 999)}",
            f"{clean_base}_reader",
            f"{clean_base}_fan",
        ])

    # Generic suggestions
    prefixes = ['bookworm', 'movie_buff', 'reader', 'cinephile', 'adaptafan']
    suffixes = ['x', str(random.randint(1, 9999)), str(datetime.now().year)]

    for prefix in prefixes[:3]:
        suggestions.append(f"{prefix}_{random.choice(suffixes)}")

    # Filter out taken usernames
    available_suggestions = []
    for username in suggestions:
        if not User.objects.filter(username__iexact=username).exists():
            available_suggestions.append(username)
            if len(available_suggestions) >= count:
                break

    return available_suggestions[:count]
```

## Comparison Recommendation Algorithm

### Intent-Based Ranking
```python
def get_suggested_comparisons(user_preferences=None, limit=5):
    """Get personalized comparison suggestions based on user intent."""

    # Determine intent
    intent = user_preferences.contribution_interest if user_preferences else 'EXPLORE'

    # Start with comparisons that have published, approved diffs only
    comparisons = get_comparisons_with_published_diffs()

    # Filter by genre if preferences exist
    if user_preferences and user_preferences.genres:
        comparisons = comparisons.filter(
            Q(work__genres__overlap=user_preferences.genres) |
            Q(screen_work__genres__overlap=user_preferences.genres)
        )

    # Score based on intent
    scored_comparisons = []
    for comp in comparisons:
        score = 0
        diff_count = comp.published_diff_count

        if intent == 'ADD_DIFFS':
            # Show "needs help" - low-to-medium diffs on popular titles
            if 5 <= diff_count <= 20:
                score += 20  # Sweet spot for contribution
            elif diff_count < 5:
                score += 10  # Really needs help
            else:
                score += 2   # Already well-covered

            # Boost popular titles (users know them)
            score += min(comp.view_count / 100, 15)

        elif intent == 'DISCUSS':
            # Show high comment activity + recent discussions
            score += min(comp.comment_count / 5, 20)

            # Boost recent comment activity
            recent_comments = comp.comments.filter(
                created_at__gte=timezone.now() - timedelta(days=7)
            ).count()
            score += min(recent_comments * 2, 15)

            # Medium diff count (enough content to discuss)
            if 10 <= diff_count <= 100:
                score += 10

        else:  # EXPLORE or no preference
            # Show popular, well-developed comparisons
            if 30 <= diff_count <= 100:
                score += 20  # Well-developed
            elif 20 <= diff_count < 30:
                score += 15
            else:
                score += 5

            # Vote engagement matters for "explore"
            score += min(comp.total_vote_count / 10, 15)

            # Recent activity indicates interesting content
            recent_diffs = comp.diffs.filter(
                created_at__gte=timezone.now() - timedelta(days=30)
            ).count()
            score += min(recent_diffs, 10)

        # Genre match bonus (applies to all intents)
        if user_preferences and user_preferences.genres:
            genre_overlap = (
                set(comp.work.genres or []) &
                set(user_preferences.genres or [])
            )
            score += len(genre_overlap) * 5

        scored_comparisons.append((comp, score))

    # Sort by score and return top N
    scored_comparisons.sort(key=lambda x: x[1], reverse=True)
    return [comp for comp, score in scored_comparisons[:limit]]
```

## Testing Requirements

### Backend Tests

**Username Management:**
- `test_username_availability_check` - Basic availability check
- `test_username_case_insensitive_uniqueness` - "User" and "user" both taken
- `test_username_reserved_words` - Reject reserved usernames
- `test_username_profanity_filter` - Reject profane usernames
- `test_username_format_validation` - Length, characters, etc.
- `test_username_generation_unique` - Generated suggestions are unique
- **`test_username_concurrent_creation`** - Two users try to set same username simultaneously (race condition)
- `test_username_integrity_error_handling` - IntegrityError returns clean 409 response

**Permissions:**
- **`test_username_endpoints_require_auth`** - Unauthenticated requests rejected
- **`test_cannot_modify_other_user_data`** - Can only access /me/ endpoints for self

**Preferences:**
- `test_preferences_creation` - Create new preferences
- `test_preferences_update` - Update existing preferences (upsert)
- `test_preferences_genre_validation` - Invalid genres rejected
- `test_preferences_optional_fields` - Can save with empty genres

**Suggestions:**
- `test_suggested_comparisons_add_diffs_intent` - Shows "needs help" comparisons
- `test_suggested_comparisons_discuss_intent` - Shows high comment activity
- `test_suggested_comparisons_explore_intent` - Shows popular comparisons
- `test_suggested_comparisons_genre_filter` - Filters by user genres
- `test_suggested_comparisons_no_preferences` - Works with no preferences (fallback)
- `test_suggested_comparisons_only_published` - Never shows draft/pending diffs

**Onboarding Flow:**
- `test_onboarding_progress_tracking` - Step progression works
- `test_onboarding_timestamps` - started_at and completed_at set correctly
- `test_social_auth_temp_username` - Temp username generated on social login

### Frontend Tests
- `test_username_step_validation` - Client-side validation
- `test_username_step_suggestions` - Shows and applies suggestions
- `test_username_step_debounce` - API calls debounced
- `test_username_step_required` - Cannot skip
- `test_quiz_step_navigation` - Back/forward navigation
- `test_quiz_step_optional` - Can skip quiz
- `test_quiz_step_genre_multiselect` - Multiple genres selectable
- `test_suggestions_step_display` - Shows intent-based comparisons
- `test_suggestions_step_optional` - Can skip suggestions
- `test_onboarding_progress_indicator` - 1/3, 2/3, 3/3 display
- `test_onboarding_exit_resume` - Can exit and resume later

### E2E Tests
- `test_full_onboarding_flow_social_auth` - Complete flow from OAuth to homepage
- `test_full_onboarding_flow_traditional_signup` - Username already set, skip step 1
- `test_onboarding_resume_after_exit` - Exit on step 2, resume on step 2
- `test_onboarding_username_race_condition` - Two tabs try same username
- `test_onboarding_suggestions_clickthrough` - Click suggestion → comparison page

## Security Considerations

1. **Username Validation:**
   - Server-side validation for all rules
   - Rate limiting on username check endpoint (10 requests/minute)
   - SQL injection prevention (use ORM)

2. **Preferences Storage:**
   - Validate genre values against allowed list
   - Sanitize all user inputs
   - No PII in preferences (keep it anonymous)

3. **Comparison Suggestions:**
   - Only show public comparisons (approved diffs)
   - No spoiler content in preview cards
   - Rate limiting on suggestions endpoint

## Performance Considerations

1. **Username Check:**
   - Cache negative results (username taken) for 5 minutes
   - Use database index on username field (case-insensitive)
   - Debounce frontend requests (300ms)

2. **Suggestions:**
   - Cache suggested comparisons per genre combo (15 minutes)
   - Precompute popular comparisons daily (Celery task)
   - Limit query scope to comparisons with diff_count > 0

## UX Considerations

1. **Progressive Disclosure:**
   - Show one step at a time
   - Clear progress indicator (1/3, 2/3, 3/3)
   - Allow back navigation
   - Auto-save progress

2. **Skip Options:**
   - "Skip for now" on each step
   - Can revisit onboarding from profile settings
   - Not required to use the site

3. **Mobile Responsive:**
   - Full-screen modal on mobile
   - Large touch targets (48px min)
   - Simple, focused UI

4. **Accessibility:**
   - Keyboard navigation
   - ARIA labels
   - Focus management
   - Screen reader friendly

## Implementation Phases

### Phase 1: Username Step (Priority: High)
- Backend: username check/set endpoints, username generation
- Frontend: username step component
- Testing: username validation tests
- **Estimate:** 1-2 days

### Phase 2: Quiz Step (Priority: Medium)
- Backend: preferences model, preferences endpoint
- Frontend: quiz step component with multi-step form
- Testing: preferences tests
- **Estimate:** 1-2 days

### Phase 3: Suggestions Step (Priority: Medium)
- Backend: suggestions algorithm, endpoint
- Frontend: suggestions step component
- Testing: suggestion algorithm tests
- **Estimate:** 2-3 days

### Phase 4: Integration (Priority: High)
- Update social auth flow
- Update traditional signup flow
- Add onboarding progress tracking
- Testing: E2E tests
- **Estimate:** 1 day

### Phase 5: Polish & Optimization (Priority: Low)
- Animations/transitions
- Loading states
- Error handling
- Performance optimization
- **Estimate:** 1 day

**Total Estimate:** 6-9 days

## Success Metrics

### Onboarding Completion
1. **Completion Rate:** % of users who complete full onboarding (target: >70%)
2. **Step Drop-off:** % who exit at each step (identify friction points)
3. **Username Generation:** % who use suggested vs custom username
4. **Quiz Completion:** % who complete quiz vs skip (measures engagement)
5. **Suggestion Engagement:** % who click through to suggested comparisons (target: >40%)

### User Activation
6. **Time to First Click:** Average time from signup to first comparison click
7. **Time to First Vote:** Average time from signup to first vote (key activation metric)
8. **Time to First Comment:** Average time from signup to first comment
9. **Time to First Diff:** Average time from signup to first diff contribution
10. **7-Day Contribution Rate:** % of onboarded users who add diffs within 7 days (target: >15%)
11. **7-Day Return Rate:** % of onboarded users who return within 7 days (retention)

## Future Enhancements

1. **Personalized Homepage:**
   - Show comparisons based on preferences
   - Filter by preferred genres
   - Highlight contribution opportunities

2. **Follow-up Nudges:**
   - Email: "Check out these new diffs in [genre]"
   - Notification: "Your favorite comparison has new activity"

3. **Social Features:**
   - Follow other users with similar tastes
   - Share favorite comparisons

4. **Gamification:**
   - Badges for completing onboarding
   - Points for contribution milestones
   - Leaderboard by genre

## Decisions Made

### Originally Open Questions - Now Resolved

1. **Should username be required for social auth users?**
   - ✅ **YES** - Username is required. Social auth users get temp username (`google_123`) and MUST choose real one in step 1.

2. **Should we force onboarding completion?**
   - ✅ **Partial** - Username is REQUIRED (step 1). Quiz and suggestions are OPTIONAL (can skip).
   - Show persistent banner if incomplete, but don't block site access.

3. **What's the minimum number of genres a user must select?**
   - ✅ **0** - Genres are completely optional. Can select none, some, or many.

4. **Should we show comparisons that need help or popular ones?**
   - ✅ **Both, based on intent:**
     - `ADD_DIFFS` intent → Show "needs help" (5-20 diffs, popular titles)
     - `DISCUSS` intent → Show high comment activity
     - `EXPLORE` intent → Show popular, well-developed comparisons (30-100 diffs)

5. **Should onboarding be a modal overlay or dedicated page?**
   - ✅ **Dedicated page** (`/onboarding`) - More reliable, easier to test, clearer focus.
   - Can render modal-like UI inside the page if desired.

## v1 Implementation Checklist

This checklist maps directly to implementation tasks. Each task should be a separate commit (or small PR).

### Phase 1: Database & Backend Foundation (2-3 days)

**Database Schema:**
- [ ] Create `users/constants.py` with `RESERVED_USERNAMES` and `PROFANITY_BLOCKLIST`
- [ ] Update `User` model:
  - [ ] Add `onboarding_completed`, `onboarding_started_at`, `onboarding_completed_at`, `onboarding_step`
  - [ ] Add `UniqueConstraint(Lower('username'))` for case-insensitive uniqueness
  - [ ] Add index on username field
- [ ] Create `UserPreferences` model:
  - [ ] Use `ArrayField` for genres
  - [ ] Add `GinIndex` on genres field
  - [ ] All fields optional except `user` foreign key
- [ ] Create and run migrations
- [ ] Test migrations are reversible (`migrate <app> zero`)

**Username Validation Service:**
- [ ] Create `users/services/username_service.py`
- [ ] Implement `validate_username(username)` - format, length, reserved, profanity
- [ ] Implement `check_username_availability(username)` - case-insensitive check
- [ ] Implement `generate_username_suggestions(base_name=None, count=5)`
- [ ] Implement `generate_temp_username(provider, uid)` for social auth
- [ ] Write unit tests for all validation logic

**Social Auth Integration:**
- [ ] Update social auth signal handler to create temp usernames
- [ ] Test social login creates user with `google_<uid>` format
- [ ] Test `onboarding_step = 1` and `onboarding_completed = False` on social signup

### Phase 2: API Endpoints (2 days)

**Username Endpoints:**
- [ ] `POST /api/users/me/username/check/`
  - [ ] Require authentication
  - [ ] Validate username format
  - [ ] Check availability (case-insensitive)
  - [ ] Return suggestions
  - [ ] Add rate limiting (10/min per user)
  - [ ] Write tests (including concurrency test)
- [ ] `POST /api/users/me/username/`
  - [ ] Require authentication
  - [ ] Validate username (all rules)
  - [ ] Catch `IntegrityError` and return 409 on race condition
  - [ ] Update `onboarding_step` to 2 on success
  - [ ] Write tests (including race condition test)

**Preferences Endpoints:**
- [ ] `POST /api/users/me/preferences/`
  - [ ] Require authentication
  - [ ] Validate genres against allowed list
  - [ ] Upsert preferences (update if exists, create if not)
  - [ ] Update `onboarding_step` to 3 on success
  - [ ] Write tests

**Suggestions Endpoint:**
- [ ] `GET /api/users/me/suggested-comparisons/`
  - [ ] Require authentication
  - [ ] Implement intent-based ranking algorithm
  - [ ] Filter by genres if available
  - [ ] Only return published/approved diffs
  - [ ] Cache results (15 minutes per intent+genre combo)
  - [ ] Write tests for all three intents

**User Info Endpoint:**
- [ ] Update `GET /api/users/me/`
  - [ ] Include `onboarding_completed`, `onboarding_step`
  - [ ] Include nested `preferences` if exists
- [ ] `PATCH /api/users/me/`
  - [ ] Allow updating `onboarding_step`, `onboarding_completed`
  - [ ] Set timestamps appropriately

### Phase 3: Frontend Components (2-3 days)

**Shared Components:**
- [ ] Create `components/onboarding/OnboardingLayout.tsx`
  - [ ] Progress indicator (1/3, 2/3, 3/3)
  - [ ] Back/Continue navigation
  - [ ] Brutalist styling consistent with site
- [ ] Create `components/onboarding/ProgressIndicator.tsx`

**Step 1: Username:**
- [ ] Create `components/onboarding/UsernameStep.tsx`
  - [ ] Input field with real-time validation
  - [ ] Debounced API calls (300ms)
  - [ ] Display suggestions (clickable)
  - [ ] Display validation errors (reserved, profanity, format, taken)
  - [ ] Loading states
  - [ ] No skip button (required)
- [ ] Write component tests

**Step 2: Quiz:**
- [ ] Create `components/onboarding/QuizStep.tsx`
  - [ ] Genre multi-select (checkboxes)
  - [ ] Preference radio buttons
  - [ ] Contribution intent radio buttons
  - [ ] Skip button
  - [ ] Back/Continue navigation
- [ ] Write component tests

**Step 3: Suggestions:**
- [ ] Create `components/onboarding/SuggestionsStep.tsx`
  - [ ] Fetch suggestions from API
  - [ ] Display 3-5 comparison cards
  - [ ] Intent-based heading ("Perfect for adding differences" / "Great for discussion" / "Top picks")
  - [ ] Each card links to comparison page
  - [ ] Skip button → "Get Started!" completes onboarding
- [ ] Write component tests

**Main Page:**
- [ ] Create `app/onboarding/page.tsx`
  - [ ] Check current step from user data
  - [ ] Render appropriate step component
  - [ ] Handle step transitions
  - [ ] OnboardingContext for state management
  - [ ] Handle "exit and resume" flow
- [ ] Add loading state while fetching user data

### Phase 4: Integration (1-2 days)

**Social Auth Flow:**
- [ ] Update `app/auth/social-callback/page.tsx`
  - [ ] Check if username is temp (`username.startsWith('google_')`)
  - [ ] Redirect to `/onboarding` if temp username or `!onboarding_completed`
  - [ ] Redirect to `/` if onboarding complete

**Traditional Signup Flow:**
- [ ] Update `components/auth/SignupForm.tsx`
  - [ ] After signup success, redirect to `/onboarding` (step 2, since username exists)
  - [ ] NOT to homepage

**Persistent Banner:**
- [ ] Update `components/layout/Header.tsx` or similar
  - [ ] Show banner if `user.isAuthenticated && !user.onboarding_completed`
  - [ ] Banner text: "Complete your profile to get personalized recommendations"
  - [ ] Click → `/onboarding` (resumes at current step)
  - [ ] Dismissible (but shows again on next page load until completed)

**API Client:**
- [ ] Add onboarding endpoints to `lib/api.ts`:
  - [ ] `users.me.getInfo()`
  - [ ] `users.me.checkUsername(username)`
  - [ ] `users.me.setUsername(username)`
  - [ ] `users.me.setPreferences(preferences)`
  - [ ] `users.me.getSuggestedComparisons()`
  - [ ] `users.me.updateOnboarding(data)`

### Phase 5: Testing & Polish (1 day)

**E2E Tests:**
- [ ] `test_full_onboarding_flow_social_auth`
  - [ ] OAuth login → username step → quiz → suggestions → homepage
  - [ ] Verify onboarding_completed = true
- [ ] `test_full_onboarding_flow_traditional_signup`
  - [ ] Signup → quiz (skip username) → suggestions → homepage
- [ ] `test_onboarding_resume_after_exit`
  - [ ] Exit on step 2 → click banner → resume on step 2
- [ ] `test_username_race_condition`
  - [ ] Two tabs try to set same username → one succeeds, one fails gracefully

**Polish:**
- [ ] Loading states on all async operations
- [ ] Error states with retry options
- [ ] Smooth transitions between steps
- [ ] Mobile responsive design (test on small screens)
- [ ] Keyboard navigation (tab order, enter to submit)
- [ ] ARIA labels for accessibility
- [ ] Empty states (e.g., no suggestions available)

**Documentation:**
- [ ] Add onboarding flow diagram to docs
- [ ] Update API documentation
- [ ] Add inline code comments for complex logic

### Post-Launch Monitoring

- [ ] Set up analytics tracking for all metrics
- [ ] Monitor completion rates by step
- [ ] Track time-to-activation metrics
- [ ] A/B test intent-based suggestions vs generic
- [ ] Gather user feedback via optional survey at end

## Next Steps

1. ✅ Scope approved
2. Create feature branch: `feature/user-onboarding`
3. Start with Phase 1 (Database & Backend Foundation)
4. Daily commits with clear messages
5. Create PR after Phase 3 or 4 for review
6. Iterate based on feedback
