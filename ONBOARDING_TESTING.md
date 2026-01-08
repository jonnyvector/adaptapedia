# Onboarding Feature Testing Guide

## Prerequisites
- Backend running: `docker-compose up backend` or `python manage.py runserver` in backend/
- Frontend running: `npm run dev` in frontend/
- Database migrations applied
- Google OAuth configured in Django admin (if testing social auth)

## Test Flows

### Flow 1: Social Auth (Google) - New User

**Objective:** Test complete onboarding flow for a new user signing up via Google OAuth.

**Steps:**
1. Clear browser localStorage and cookies
2. Navigate to `http://localhost:3000/auth/login`
3. Click "Continue with Google" button
4. Complete Google authentication in popup/redirect
5. After successful auth, should redirect to `/onboarding`

**Step 1: Username Selection**
6. Verify page shows "Welcome to Adaptapedia!"
7. Verify temp username is not shown (field should be empty or editable)
8. Enter a username that's too short (< 3 chars): "ab"
   - Expected: Red error message "Username must be at least 3 characters"
9. Enter a username that's too long (> 20 chars): "abcdefghijklmnopqrstuvwxyz"
   - Expected: Red error message "Username must be 20 characters or less"
10. Enter invalid characters: "user@123"
    - Expected: Red error message about invalid characters
11. Enter reserved username: "admin"
    - Expected: Red error with suggestions
12. Enter taken username (use existing one from database)
    - Expected: Red error "Username already taken" with suggestions
13. Click on a suggestion
    - Expected: Username field populates with suggestion, validation runs
14. Enter available username: "testuser[timestamp]"
    - Expected: Green checkmark "✓ Available"
15. Verify "Continue →" button is disabled when username is invalid
16. Verify "Continue →" button is enabled when username is valid
17. Click "Continue →"
    - Expected: Advances to Step 2 (Quiz)

**Step 2: Preferences Quiz**
18. Verify heading "Tell us what you like"
19. Select 2-3 genres (e.g., Fiction, Fantasy, Sci-Fi)
    - Expected: Selected genres show checkmark and invert colors (black bg, white text)
20. Select a preference: "I love books more than adaptations"
    - Expected: Button highlights with dot bullet
21. Select contribution interest: "Point out differences"
    - Expected: Button highlights
22. Verify both "Skip" and "Continue →" buttons are present
23. Click "Continue →"
    - Expected: Advances to Step 3 (Suggestions)

**Step 3: Suggested Comparisons**
24. Verify heading changes based on contribution interest
    - Should show "Perfect for adding differences"
25. Wait for suggestions to load
    - Expected: Loading spinner shows, then list of 3+ comparisons
26. Verify each comparison shows:
    - Book title → Screen title
    - Genres
    - Diff count
27. Click on a comparison link
    - Expected: Opens comparison page in same tab
28. Navigate back to onboarding (browser back)
29. Click "Get Started!"
    - Expected: Redirects to homepage `/`

**Post-Onboarding Verification**
30. Verify no onboarding banner shows on homepage
31. Refresh page
    - Expected: Still no banner (onboarding complete persisted)
32. Navigate to `/onboarding` directly
    - Expected: Redirects to homepage (already completed)

**Database Verification (Optional):**
```sql
SELECT username, email, onboarding_completed, onboarding_step, onboarding_completed_at
FROM users_user
WHERE email = 'your-google-email@gmail.com';
```
- Expected: `onboarding_completed = true`, `onboarding_step = 4`

**Expected Results:**
✅ Temp username replaced with user choice
✅ Real-time username validation works
✅ Suggestions are clickable
✅ Progress through all 3 steps successful
✅ Onboarding marked complete in database
✅ No banner after completion
✅ Cannot re-enter onboarding flow

---

### Flow 2: Traditional Signup - New User

**Objective:** Test onboarding flow for user who signs up with email/password (username already set).

**Steps:**
1. Clear browser localStorage and cookies
2. Navigate to `http://localhost:3000/auth/signup`
3. Fill signup form:
   - Username: "newuser[timestamp]"
   - Email: "newuser[timestamp]@test.com"
   - Password: "SecurePass123!"
4. Click "Sign Up"
   - Expected: Redirect to `/onboarding`

**Username Step Skipped**
5. Verify onboarding starts at Step 2 (Quiz), NOT Step 1
   - Expected: No username selection screen

**Complete Onboarding**
6. Fill out quiz preferences
7. Click "Continue →"
8. View suggestions
9. Click "Get Started!"
   - Expected: Redirect to homepage

**Post-Onboarding Verification**
10. Verify no banner shows
11. Verify user is logged in with chosen username

**Expected Results:**
✅ Skips username step (already set during signup)
✅ Starts at Step 2
✅ Otherwise same as Flow 1

---

### Flow 3: Resume Onboarding After Exit

**Objective:** Test that users can resume incomplete onboarding.

**Steps:**
1. Start new user signup (social or traditional)
2. Complete Step 1 (username selection if applicable)
3. Complete Step 2 (quiz)
4. **Before clicking "Get Started!", navigate away:**
   - Type `/` in address bar and press Enter
   - Or click browser back button

**Onboarding Banner Check**
5. On homepage, verify banner appears:
   - Expected: Yellow/prominent banner at top
   - Message: "Complete your profile to get personalized recommendations"
   - Button: "Continue Setup →"

6. Click "Continue Setup" button in banner
   - Expected: Returns to `/onboarding` at Step 3 (suggestions)

7. Verify previous data is preserved:
   - Username is still set
   - (Quiz preferences are submitted, won't see them again)

8. Click "Get Started!" to complete
   - Expected: Banner disappears

**Test Persistence**
9. Refresh page
   - Expected: No banner (completed)

**Expected Results:**
✅ Banner shows when onboarding incomplete
✅ Banner link resumes at correct step
✅ No data loss (username preserved)
✅ Banner disappears after completion

---

### Flow 4: Username Race Condition

**Objective:** Test that concurrent username submissions don't cause duplicates.

**Note:** This is difficult to test manually but can be simulated.

**Automated Test Simulation:**
```javascript
// In browser console on /onboarding page
const testUsername = 'racetest' + Date.now();

// Simulate two rapid submissions
Promise.all([
  fetch('/api/users/me/username/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer YOUR_TOKEN' },
    body: JSON.stringify({ username: testUsername })
  }),
  fetch('/api/users/me/username/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer YOUR_TOKEN' },
    body: JSON.stringify({ username: testUsername })
  })
]).then(responses => console.log(responses));
```

**Expected Results:**
✅ One request succeeds (200 OK)
✅ One request fails (400 Bad Request - username taken)
✅ User-friendly error shown: "Username already taken"

---

### Flow 5: Username Validation - Comprehensive

**Objective:** Test all username validation rules.

**Test Cases:**

| Input | Expected Result | Error Message |
|-------|----------------|---------------|
| `ab` | ❌ Invalid | "Username must be at least 3 characters" |
| `abc` | ✅ Valid (if available) | "✓ Available" |
| `abcdefghijklmnopqrstuvwxyz` | ❌ Invalid | "Username must be 20 characters or less" |
| `user@123` | ❌ Invalid | "Username can only contain letters, numbers, and underscores" |
| `user-name` | ❌ Invalid | "Username can only contain letters, numbers, and underscores" |
| `user name` | ❌ Invalid | "Username can only contain letters, numbers, and underscores" |
| `admin` | ❌ Reserved | "Username already taken" + suggestions |
| `test` | ❌ Reserved | "Username already taken" + suggestions |
| `user` | ❌ Reserved | "Username already taken" + suggestions |
| `validuser123` | ✅ Valid | "✓ Available" |
| `valid_user_123` | ✅ Valid | "✓ Available" |

**Steps:**
1. For each test case, enter the username
2. Wait 300ms for debounced validation
3. Verify error message or success indicator
4. Verify "Continue" button is disabled/enabled appropriately

**Expected Results:**
✅ All validation rules enforced
✅ Clear error messages
✅ Suggestions shown for reserved/taken usernames

---

### Flow 6: Skip Quiz

**Objective:** Test that users can skip preference quiz.

**Steps:**
1. Start onboarding flow
2. Complete username step
3. On quiz step, click "Skip" button (don't select any preferences)
   - Expected: Advances to suggestions step

4. Verify suggestions still load
   - Expected: Generic suggestions with "Top picks for you" heading
   - Intent defaults to "EXPLORE"

5. Complete onboarding
   - Expected: Success, no errors

**Expected Results:**
✅ Skip button works
✅ Suggestions load with default intent
✅ Onboarding completes successfully

---

### Flow 7: Accessibility - Keyboard Navigation

**Objective:** Test that onboarding is fully keyboard accessible.

**Steps:**

**Username Step:**
1. Tab into username input field
   - Expected: Input receives focus, visible focus ring
2. Type username with keyboard
3. Tab to "Continue" button
   - Expected: Button receives focus
4. Press Enter
   - Expected: Advances to next step

**Quiz Step:**
5. Tab through genre buttons
   - Expected: Focus visible on each button
6. Press Space or Enter to select genre
   - Expected: Genre toggles selection
7. Tab through preference radio buttons
8. Press Enter to select
9. Tab to "Skip" or "Continue" button
10. Press Enter to advance

**Suggestions Step:**
11. Tab through suggestion links
12. Press Enter on a link
    - Expected: Navigation works
13. Tab to "Get Started!" button
14. Press Enter

**Expected Results:**
✅ All interactive elements are keyboard accessible
✅ Tab order is logical (top to bottom, left to right)
✅ Focus states are clearly visible
✅ Enter key submits forms/activates buttons
✅ No keyboard traps

---

### Flow 8: Accessibility - Screen Reader

**Objective:** Test that onboarding works with screen readers.

**Tools:** VoiceOver (Mac), NVDA (Windows), or JAWS

**Steps:**

1. Enable screen reader
2. Navigate to `/onboarding` page

**Username Step:**
3. Verify heading is announced: "Welcome to Adaptapedia!"
4. Verify input label is announced: "Choose your username"
5. Type invalid username
   - Expected: Error message is announced
6. Type valid username
   - Expected: Success message is announced
7. Navigate to "Continue" button
   - Expected: Button purpose is announced

**Quiz Step:**
8. Verify heading is announced: "Tell us what you like"
9. Navigate through genre buttons
   - Expected: Each button's text and state (pressed/not pressed) announced
10. Navigate through radio button groups
    - Expected: Group labels announced

**Suggestions Step:**
11. Verify heading is announced
12. Verify loading state is announced: "Loading..."
13. Navigate through suggestion links
    - Expected: Link text and destination announced

**Expected Results:**
✅ All headings announced
✅ Form labels announced
✅ Error/success messages announced
✅ Button states announced
✅ Loading states announced
✅ Logical reading order

---

### Flow 9: Mobile Responsiveness

**Objective:** Test onboarding on mobile devices/viewports.

**Test Viewports:**
- Mobile: 375px width (iPhone SE)
- Mobile Large: 414px width (iPhone 12 Pro)
- Tablet: 768px width (iPad)

**Steps:**

1. Open DevTools, enable device emulation
2. Set to 375px width
3. Navigate through onboarding

**Username Step:**
4. Verify input field is full width
5. Verify text is readable (not too small)
6. Verify suggestions wrap properly if multiple
7. Verify "Continue" button is full width and easily tappable (44px height minimum)

**Quiz Step:**
8. Verify genre grid shows 2 columns on mobile (check CSS `grid-cols-2`)
9. Verify buttons are full width and tappable
10. Verify no horizontal scrolling

**Suggestions Step:**
11. Verify comparison cards stack vertically
12. Verify text doesn't overflow
13. Verify "Get Started!" button is full width

**Tablet (768px):**
14. Verify genre grid shows 3 columns (`sm:grid-cols-3`)
15. Verify layout uses available space well

**Expected Results:**
✅ No horizontal scrolling
✅ All text readable (16px+ body text)
✅ Touch targets 44x44px minimum
✅ Layouts adapt to viewport size
✅ No content cutoff or overflow

---

### Flow 10: Error Handling

**Objective:** Test error states and recovery.

**Test Cases:**

**Network Error:**
1. Open DevTools, go to Network tab
2. Enable "Offline" mode
3. Start onboarding, try to submit username
   - Expected: User-friendly error message
   - "Failed to set username. Please try again."
4. Re-enable network
5. Try again
   - Expected: Works

**API Error (500):**
1. Use DevTools to intercept `/api/users/me/username/` request
2. Make it return 500 error
3. Submit username
   - Expected: Error message shown
   - "Failed to set username. Please try again."

**Timeout:**
1. Use DevTools to throttle to "Slow 3G"
2. Submit username
   - Expected: Loading spinner shows
   - Request eventually completes or times out with error

**Expected Results:**
✅ All errors handled gracefully
✅ User-friendly error messages
✅ Retry works after error
✅ No console errors that crash app

---

## Performance Testing

### Page Load Time

**Tools:** Chrome DevTools Lighthouse

**Steps:**
1. Open DevTools
2. Go to Lighthouse tab
3. Select "Performance" category
4. Run audit on `/onboarding` page

**Expected Results:**
- Performance score: > 90
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s

### Network Performance

**Test with Throttling:**
1. DevTools Network tab → Throttle to "Fast 3G"
2. Reload `/onboarding` page
3. Measure total load time

**Expected Results:**
- Page usable within 3 seconds
- Loading spinners show during async operations
- No layout shift during load

---

## Cross-Browser Testing

**Browsers to Test:**
- ✅ Chrome/Edge (Chromium) - Latest
- ✅ Firefox - Latest
- ✅ Safari - Latest (macOS/iOS)

**For Each Browser:**
1. Run Flow 1 (Social Auth) or Flow 2 (Traditional Signup)
2. Test keyboard navigation (Flow 7)
3. Test mobile viewport (Flow 9)

**Known Issues/Notes:**
- Safari may have different OAuth popup behavior
- Firefox focus states may look different (still must be visible)

---

## Automated Testing

### Unit Tests

**Run tests:**
```bash
cd frontend
npm run test
```

**Coverage check:**
```bash
npm run test:coverage
```

**Expected:**
- All tests pass
- Coverage > 80% for onboarding components

### E2E Tests (If Implemented)

**Tools:** Playwright or Cypress

**Test files to create:**
- `e2e/onboarding-social-auth.spec.ts`
- `e2e/onboarding-traditional-signup.spec.ts`
- `e2e/onboarding-resume.spec.ts`

---

## Regression Testing Checklist

Before marking onboarding complete, verify:

- [ ] TypeScript compiles without errors
- [ ] Production build succeeds
- [ ] ESLint passes (no errors)
- [ ] All unit tests pass
- [ ] Username validation works (all cases)
- [ ] Quiz preferences save correctly
- [ ] Suggestions load and are clickable
- [ ] Onboarding completion persists
- [ ] Banner shows/hides appropriately
- [ ] Cannot re-enter onboarding after completion
- [ ] Keyboard navigation works
- [ ] Screen reader announces content
- [ ] Mobile layouts work at 375px, 768px, 1440px
- [ ] No console errors in browser
- [ ] No network errors (check DevTools)
- [ ] Works in Chrome, Firefox, Safari
- [ ] Performance score > 90

---

## Bug Reporting Template

If you find a bug, document it:

```markdown
**Bug Title:** [Short description]

**Severity:** Critical / High / Medium / Low

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Result:**
What should happen

**Actual Result:**
What actually happened

**Screenshots:**
[Attach if relevant]

**Environment:**
- Browser: [Chrome 120, Firefox 121, Safari 17, etc.]
- OS: [macOS 14, Windows 11, iOS 17, etc.]
- Device: [Desktop, iPhone 12, etc.]
- Viewport: [1440x900, 375x667, etc.]

**Console Errors:**
```
[Paste any console errors]
```

**Additional Notes:**
[Any other relevant information]
```

---

## Test Status Log

| Date | Tester | Flow | Status | Notes |
|------|--------|------|--------|-------|
| 2026-01-08 | Claude | All Flows | ⏳ Pending | Documentation created |
| | | | | |
| | | | | |

---

## Notes

- All tests assume backend API is fully functional
- Database should be in a clean state for testing (or use test database)
- Clear browser cache/localStorage between test runs for accurate results
- Document any unexpected behavior even if test "passes"
