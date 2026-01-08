# User Onboarding Feature Scope

## Overview
Create a guided onboarding flow for new users (both social auth and traditional signup) that personalizes their experience and encourages immediate contribution.

## User Flow

### Step 1: Username Selection
**Trigger:** After successful authentication (social or traditional signup)
- **For Social Auth:** User completes OAuth but hasn't chosen a username yet
- **For Traditional Signup:** Optional - can be integrated into signup or post-signup

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
  - Case-insensitive uniqueness check
- Skip button for social auth users who want to keep suggested username

**Technical Requirements:**
- New API endpoint: `POST /api/users/check-username/` (returns `{available: boolean, suggestions?: string[]}`)
- Username generation service on backend
- Debounced API calls (300ms delay)

### Step 2: Interest Quiz
**UI/UX:**
```
┌─────────────────────────────────────────┐
│  Tell us what you like (2/3)           │
│                                         │
│  What genres interest you? (Select all)│
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
│     [← Back]        [Continue →]       │
└─────────────────────────────────────────┘
```

**Questions:**
1. **Genre Selection** (multi-select)
   - Fiction, Non-Fiction, Fantasy, Mystery, Sci-Fi, Romance, Horror, Biography, Drama, Historical, Thriller, Comedy

2. **Preference Scale** (single-select)
   - "I love books more than adaptations"
   - "I enjoy both equally"
   - "I prefer watching over reading"

3. **Contribution Interest** (single-select)
   - "I want to add new comparisons"
   - "I want to point out differences"
   - "I want to discuss with others"
   - "I just want to explore"

**Technical Requirements:**
- New model: `UserPreferences`
  ```python
  class UserPreferences(models.Model):
      user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
      genres = models.JSONField(default=list)  # List of genre strings
      book_vs_screen = models.CharField(max_length=20)  # books/equal/screen
      contribution_interest = models.CharField(max_length=50)
      completed_at = models.DateTimeField(auto_now_add=True)
  ```
- API endpoint: `POST /api/users/preferences/` (creates preferences)
- Frontend: Multi-step form with progress indicator

### Step 3: Suggested Comparisons
**UI/UX:**
```
┌─────────────────────────────────────────┐
│  Explore these comparisons (3/3)       │
│                                         │
│  Based on your interests:              │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 📖 The Hunger Games → 🎬 Movie    │ │
│  │ Fantasy • 1,234 differences       │ │
│  │ [Explore →]                       │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 📖 Harry Potter → 🎬 Series       │ │
│  │ Fantasy • 3,456 differences       │ │
│  │ [Explore →]                       │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 📖 Normal People → 📺 Show        │ │
│  │ Romance • 234 differences         │ │
│  │ [Explore →]                       │ │
│  └───────────────────────────────────┘ │
│                                         │
│     [Skip]          [Get Started!]     │
└─────────────────────────────────────────┘
```

**Features:**
- Show 3-5 comparisons based on:
  - Selected genres
  - Popular comparisons (high diff count + votes)
  - Comparisons that need contributions (low diff count)
- Each card links directly to comparison page
- "Skip" button to go straight to homepage

**Technical Requirements:**
- New API endpoint: `GET /api/users/suggested-comparisons/` (uses preferences)
- Algorithm:
  ```python
  def get_suggested_comparisons(user_preferences):
      # 1. Filter works by genre preferences
      # 2. Prioritize comparisons with:
      #    - High engagement (votes + comments)
      #    - Medium diff count (not empty, not overwhelming)
      #    - Recent activity
      # 3. Return 5 comparisons
  ```
- Track onboarding completion in user model

## Database Schema Changes

### New Models

**UserPreferences**
```python
class UserPreferences(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    genres = models.JSONField(default=list)  # ["Fantasy", "Sci-Fi", "Romance"]
    book_vs_screen = models.CharField(max_length=20, choices=[
        ('BOOKS', 'Prefer Books'),
        ('EQUAL', 'Enjoy Both Equally'),
        ('SCREEN', 'Prefer Adaptations'),
    ])
    contribution_interest = models.CharField(max_length=50, choices=[
        ('ADD_COMPARISONS', 'Add new comparisons'),
        ('ADD_DIFFS', 'Point out differences'),
        ('DISCUSS', 'Discuss with others'),
        ('EXPLORE', 'Just exploring'),
    ])
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "User preferences"
```

### Modified Models

**User Model Updates**
```python
class User(AbstractUser):
    # ... existing fields ...
    onboarding_completed = models.BooleanField(default=False)
    onboarding_step = models.IntegerField(default=0)  # 0=not started, 1=username, 2=quiz, 3=suggestions, 4=complete
```

## API Endpoints

### Username Management
```
POST /api/users/check-username/
Body: { username: string }
Response: {
  available: boolean,
  suggestions?: string[],
  error?: string
}
```

```
POST /api/users/set-username/
Body: { username: string }
Response: {
  success: boolean,
  user: UserSerializer
}
```

### Preferences
```
POST /api/users/preferences/
Body: {
  genres: string[],
  book_vs_screen: string,
  contribution_interest: string
}
Response: {
  success: boolean,
  preferences: UserPreferencesSerializer
}
```

```
GET /api/users/suggested-comparisons/
Response: {
  comparisons: [
    {
      work_slug: string,
      work_title: string,
      screen_work_slug: string,
      screen_work_title: string,
      genres: string[],
      diff_count: number,
      vote_count: number
    }
  ]
}
```

### Onboarding Progress
```
PATCH /api/users/onboarding-progress/
Body: { step: number }
Response: {
  success: boolean,
  current_step: number,
  completed: boolean
}
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
OAuth → Backend callback → Frontend /auth/social-callback → Store tokens →
  IF (!user.onboarding_completed) → Redirect to /onboarding
  ELSE → Redirect to /
```

### Traditional Signup Flow
**Current:**
```
Signup form → API call → Store tokens → Redirect to /
```

**New:**
```
Signup form → API call → Store tokens →
  IF (!user.onboarding_completed) → Redirect to /onboarding
  ELSE → Redirect to /
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

### Ranking Factors
```python
def get_suggested_comparisons(user_preferences, limit=5):
    """Get personalized comparison suggestions."""

    # Start with all comparisons that have diffs
    comparisons = get_comparisons_with_diffs()

    # Filter by genre if preferences exist
    if user_preferences.genres:
        comparisons = comparisons.filter(
            Q(work__genres__overlap=user_preferences.genres) |
            Q(screen_work__genres__overlap=user_preferences.genres)
        )

    # Score each comparison
    scored_comparisons = []
    for comp in comparisons:
        score = 0

        # Factor 1: Diff count (sweet spot: 10-50 diffs)
        diff_count = comp.diff_count
        if 10 <= diff_count <= 50:
            score += 10
        elif 5 <= diff_count < 10:
            score += 5
        elif diff_count > 50:
            score += 3

        # Factor 2: Recent activity (diffs added in last 30 days)
        recent_diffs = comp.diffs.filter(created_at__gte=timezone.now() - timedelta(days=30)).count()
        score += min(recent_diffs, 10)

        # Factor 3: Vote engagement
        total_votes = comp.total_vote_count
        score += min(total_votes / 10, 15)

        # Factor 4: Genre match bonus
        genre_overlap = set(comp.work.genres or []) & set(user_preferences.genres or [])
        score += len(genre_overlap) * 5

        scored_comparisons.append((comp, score))

    # Sort by score and return top N
    scored_comparisons.sort(key=lambda x: x[1], reverse=True)
    return [comp for comp, score in scored_comparisons[:limit]]
```

## Testing Requirements

### Backend Tests
- `test_username_availability_check`
- `test_username_generation_unique`
- `test_username_validation_rules`
- `test_preferences_creation`
- `test_suggested_comparisons_genre_filter`
- `test_suggested_comparisons_scoring`
- `test_onboarding_progress_tracking`

### Frontend Tests
- `test_username_step_validation`
- `test_username_step_suggestions`
- `test_quiz_step_navigation`
- `test_quiz_step_validation`
- `test_suggestions_step_display`
- `test_onboarding_progress_indicator`
- `test_onboarding_skip_functionality`

### E2E Tests
- `test_full_onboarding_flow_social_auth`
- `test_full_onboarding_flow_traditional_signup`
- `test_onboarding_resume_after_exit`
- `test_onboarding_suggestions_clickthrough`

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

1. **Completion Rate:** % of users who complete full onboarding
2. **Step Drop-off:** % who exit at each step
3. **Username Generation:** % who use suggested vs custom username
4. **Suggestion Engagement:** % who click through to suggested comparisons
5. **Contribution Rate:** % of onboarded users who add diffs within 7 days
6. **Time to First Contribution:** Average time from signup to first diff

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

## Open Questions

1. Should username be required for social auth users, or allow them to use display name initially?
2. Should we force onboarding completion, or allow skipping entirely?
3. What's the minimum number of genres a user must select (0, 1, or 3+)?
4. Should we show comparisons that need help (low diff count) or popular ones (high engagement)?
5. Should onboarding be a modal overlay or dedicated page?

## Next Steps

1. Review and approve scope
2. Create database migration for UserPreferences model
3. Implement Phase 1 (Username Step)
4. Iterate based on user feedback
