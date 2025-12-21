# Moderation Queue Implementation Report

## Executive Summary

A complete moderation queue system has been implemented for Adaptapedia, allowing moderators and admins to review and manage pending content submissions. The system includes backend API endpoints, frontend UI components, role-based access control, and comprehensive testing documentation.

## Implementation Overview

### Core Features Delivered

1. **Backend Moderation API** - Complete REST API for moderating diffs and comments
2. **Frontend Moderation UI** - Intuitive queue interface with tabs and action buttons
3. **Role-Based Access Control** - Secure permissions system restricting access to MOD/ADMIN roles
4. **Status Management** - Extended status options for both diffs and comments
5. **Action Feedback** - Real-time loading states and success/error messages
6. **Comprehensive Documentation** - Setup guides, testing procedures, and API documentation

## Files Modified/Created

### Backend Changes

#### 1. `/backend/diffs/models.py` - Model Updates

**Changes Made:**
- Added `REJECTED` and `FLAGGED` statuses to `DiffStatus` choices
- Added `PENDING` and `DELETED` statuses to `CommentStatus` choices

**Code Sections:**
```python
class DiffStatus(models.TextChoices):
    LIVE = 'LIVE', 'Live'
    HIDDEN = 'HIDDEN', 'Hidden'
    LOCKED = 'LOCKED', 'Locked'
    PENDING = 'PENDING', 'Pending'
    REJECTED = 'REJECTED', 'Rejected'  # NEW
    FLAGGED = 'FLAGGED', 'Flagged'      # NEW

class CommentStatus(models.TextChoices):
    LIVE = 'LIVE', 'Live'
    HIDDEN = 'HIDDEN', 'Hidden'
    PENDING = 'PENDING', 'Pending'      # NEW
    DELETED = 'DELETED', 'Deleted'      # NEW
```

**Impact:**
- Enables pending workflow for user-submitted content
- Allows moderators to flag problematic content for review
- Provides rejected state for tracking declined submissions

#### 2. `/backend/moderation/serializers.py` - Moderation Serializers

**Created Classes:**
- `DiffModerationSerializer` - Serializes diffs with full context for moderation
- `CommentModerationSerializer` - Serializes comments with related diff information
- `ModerationActionSerializer` - Handles optional reason field for moderation actions

**Key Features:**
- Includes work and screen work titles with slugs for easy navigation
- Shows creator username and profile link
- Exposes vote counts for diffs
- Provides full context for informed moderation decisions

**Code Example:**
```python
class DiffModerationSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    work_title = serializers.CharField(source='work.title', read_only=True)
    work_slug = serializers.CharField(source='work.slug', read_only=True)
    screen_work_title = serializers.CharField(source='screen_work.title', read_only=True)
    screen_work_slug = serializers.CharField(source='screen_work.slug', read_only=True)
    vote_counts = serializers.ReadOnlyField()
    # ... fields configuration
```

#### 3. `/backend/moderation/views.py` - Moderation Endpoints

**Created ViewSets:**

**DiffModerationViewSet:**
- `GET /api/mod/diffs/` - List pending/flagged diffs
  - Filters: status, category, spoiler_scope
  - Ordered by creation date (newest first)
- `POST /api/mod/diffs/{id}/approve/` - Approve diff → LIVE status
- `POST /api/mod/diffs/{id}/reject/` - Reject diff → REJECTED status (with optional reason)
- `POST /api/mod/diffs/{id}/flag/` - Flag diff → FLAGGED status

**CommentModerationViewSet:**
- `GET /api/mod/comments/` - List pending/live comments
  - Filters: status, spoiler_scope
  - Ordered by creation date (newest first)
- `POST /api/mod/comments/{id}/approve/` - Approve comment → LIVE status
- `POST /api/mod/comments/{id}/hide/` - Hide comment → HIDDEN status
- `POST /api/mod/comments/{id}/delete/` - Delete comment → DELETED status

**Permission Class:**
```python
class IsModerator(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.role in ['MOD', 'ADMIN'] or request.user.is_staff
        )
```

**Security Features:**
- All endpoints require authentication
- Only MOD and ADMIN roles can access
- Returns 403 Forbidden for unauthorized users
- Read-only access to queue listings (GET)
- Action endpoints use POST for state changes

#### 4. `/backend/moderation/urls.py` - URL Configuration

**Changes Made:**
```python
router.register(r'diffs', DiffModerationViewSet, basename='diff-moderation')
router.register(r'comments', CommentModerationViewSet, basename='comment-moderation')
```

**URL Structure:**
- `/api/mod/diffs/` - Diff moderation endpoints
- `/api/mod/comments/` - Comment moderation endpoints
- Actions accessible via `/api/mod/{resource}/{id}/{action}/`

### Frontend Changes

#### 1. `/frontend/lib/types.ts` - Type Definitions

**Added Types:**
```typescript
export type DiffStatus = 'LIVE' | 'HIDDEN' | 'LOCKED' | 'PENDING' | 'REJECTED' | 'FLAGGED';
export type CommentStatus = 'LIVE' | 'HIDDEN' | 'PENDING' | 'DELETED';

export interface ModerationDiff extends DiffItem {
  status: DiffStatus;
}

export interface ModerationComment extends Comment {
  status: CommentStatus;
  diff_item_id: number;
}

export interface ModerationAction {
  reason?: string;
}
```

**Benefits:**
- Full TypeScript type safety for moderation features
- Prevents invalid status assignments
- IDE autocomplete support

#### 2. `/frontend/lib/api.ts` - API Client

**Added Namespace:**
```typescript
moderation: {
  diffs: {
    list: async (params?) => fetchApi(`/mod/diffs/${query}`),
    approve: async (diffId) => fetchApi(`/mod/diffs/${diffId}/approve/`, POST),
    reject: async (diffId, reason?) => fetchApi(`/mod/diffs/${diffId}/reject/`, POST),
    flag: async (diffId) => fetchApi(`/mod/diffs/${diffId}/flag/`, POST),
  },
  comments: {
    list: async (params?) => fetchApi(`/mod/comments/${query}`),
    approve: async (commentId) => fetchApi(`/mod/comments/${commentId}/approve/`, POST),
    hide: async (commentId) => fetchApi(`/mod/comments/${commentId}/hide/`, POST),
    delete: async (commentId) => fetchApi(`/mod/comments/${commentId}/delete/`, POST),
  },
}
```

**Features:**
- Consistent API interface
- Automatic JWT token inclusion
- Type-safe parameters and return values

#### 3. `/frontend/components/mod/ModerationActions.tsx` - Action Buttons Component

**Features:**
- Reusable action button component for both diffs and comments
- Action-specific buttons based on content type:
  - Diffs: Approve, Reject (with reason), Flag
  - Comments: Approve, Hide, Delete (with confirmation)
- Loading states during API calls
- Success/error feedback messages
- Inline reject reason input
- Confirmation dialog for destructive actions

**UI Elements:**
- Green "Approve" button for publishing content
- Red "Reject"/"Delete" buttons for removal
- Yellow "Flag" button for further review
- Orange "Hide" button for soft deletion
- Modal inputs for reasons and confirmations

**Code Highlights:**
```typescript
const handleAction = async (action, successMessage) => {
  setIsLoading(true);
  try {
    await action();
    setActionMessage({ type: 'success', text: successMessage });
  } catch (error) {
    setActionMessage({ type: 'error', text: error.message });
  } finally {
    setIsLoading(false);
  }
};
```

#### 4. `/frontend/components/mod/DiffReviewCard.tsx` - Diff Review Component

**Display Elements:**
- Status badge (PENDING/FLAGGED)
- Work → Screen Work context with navigation links
- Category and spoiler scope labels
- Diff claim (heading) and detail (body)
- Vote counts (Accurate, Needs Nuance, Disagree)
- Creator username with profile link
- Creation timestamp (formatted)

**Actions:**
- Approve button - Makes diff LIVE
- Reject button - Opens reason input, marks REJECTED
- Flag button - Marks diff FLAGGED

**Design:**
- Clean card layout with clear visual hierarchy
- Color-coded badges for quick status identification
- Contextual links for work comparison review
- Responsive design for various screen sizes

#### 5. `/frontend/components/mod/CommentReviewCard.tsx` - Comment Review Component

**Display Elements:**
- Status badge (PENDING/LIVE)
- Related diff claim and comparison link
- Comment body in formatted box
- Spoiler scope label
- Creator username with profile link
- Creation timestamp (formatted)

**Actions:**
- Approve button - Makes comment LIVE
- Hide button - Marks comment HIDDEN
- Delete button - Opens confirmation, marks DELETED

**Design:**
- Nested context showing parent diff
- Highlighted comment body for easy review
- Clear distinction between comment and diff content
- Confirmation required for permanent deletion

#### 6. `/frontend/components/mod/ModQueue.tsx` - Main Queue Component

**Features:**
- Tabbed interface:
  - "Pending Diffs" - Shows diffs with PENDING status
  - "Pending Comments" - Shows comments with PENDING status
  - "Flagged Items" - Shows diffs with FLAGGED status
- Status filter dropdown (Pending, Flagged, All)
- Item count badges on tabs
- Auto-refresh after moderation actions
- Loading states with spinner
- Error handling with retry button
- Empty state messages

**State Management:**
```typescript
const [activeTab, setActiveTab] = useState<TabType>('pending-diffs');
const [diffs, setDiffs] = useState<ModerationDiff[]>([]);
const [comments, setComments] = useState<ModerationComment[]>([]);
const [statusFilter, setStatusFilter] = useState<StatusFilter>('PENDING');
```

**Auto-Refresh:**
```typescript
const handleActionComplete = () => {
  loadItems(); // Reloads current tab after any action
};
```

#### 7. `/frontend/app/mod/queue/page.tsx` - Moderation Page

**Security Features:**
- Client-side authentication check
- Role-based authorization (MOD/ADMIN only)
- Redirect to login if unauthenticated
- Redirect to home if unauthorized
- Loading state while checking permissions

**Code:**
```typescript
useEffect(() => {
  if (!isLoading) {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/mod/queue');
      return;
    }
    const isModerator = user?.role === 'MOD' || user?.role === 'ADMIN';
    if (!isModerator) {
      router.push('/');
      return;
    }
    setIsAuthorized(true);
  }
}, [user, isLoading, isAuthenticated, router]);
```

**Layout:**
- Full-height page with gray background
- Centered content with max-width container
- Clean, minimal design focusing on content review

### Documentation Files

#### 1. `/MODERATION_SETUP.md` - Comprehensive Setup Guide

**Sections:**
- Overview and features
- Backend implementation details
- Frontend component descriptions
- Database migration instructions
- Testing procedures with code examples
- User flow documentation
- Security considerations
- Future enhancement roadmap
- Troubleshooting guide
- File reference list

#### 2. `/backend/scripts/create_test_moderation_items.py` - Test Data Script

**Purpose:**
- Automated creation of test pending/flagged items
- Creates 3 pending diffs, 2 flagged diffs, 3 pending comments
- Useful for development and QA testing

**Usage:**
```bash
docker-compose exec backend python scripts/create_test_moderation_items.py
```

## Testing the Implementation

### 1. Database Migration

Required before testing:

```bash
# Create migrations
docker-compose exec backend python manage.py makemigrations

# Apply migrations
docker-compose exec backend python manage.py migrate
```

### 2. Create Moderator User

```bash
docker-compose exec backend python manage.py shell
```

```python
from users.models import User
user = User.objects.get(username='your_username')
user.role = 'MOD'
user.save()
exit()
```

### 3. Generate Test Data

```bash
docker-compose exec backend python scripts/create_test_moderation_items.py
```

### 4. Access Moderation Queue

1. Start the application: `docker-compose up`
2. Log in as moderator at `http://localhost:3000/auth/login`
3. Navigate to `http://localhost:3000/mod/queue`
4. Review and moderate pending items

### 5. API Testing with cURL

```bash
# Login and get token
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "mod_user", "password": "password"}'

# List pending diffs
curl -X GET http://localhost:8000/api/mod/diffs/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# Approve a diff
curl -X POST http://localhost:8000/api/mod/diffs/1/approve/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# Reject with reason
curl -X POST http://localhost:8000/api/mod/diffs/2/reject/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Contains inaccurate information"}'
```

## Security Considerations

### Authentication & Authorization

1. **Backend Protection:**
   - All moderation endpoints require JWT authentication
   - `IsModerator` permission class enforces role check
   - Returns 403 for non-moderator users
   - Returns 401 for unauthenticated requests

2. **Frontend Protection:**
   - Page-level authorization check in useEffect
   - Redirects to login if not authenticated
   - Redirects to home if not authorized
   - No moderation UI rendered for regular users

3. **Token Management:**
   - JWT tokens stored in localStorage
   - Automatically included in API requests
   - Validated on every request
   - Expired tokens handled gracefully

### Data Integrity

1. **Status Transitions:**
   - Only MOD/ADMIN can change content status
   - Django model choices prevent invalid statuses
   - Atomic database operations prevent race conditions

2. **Audit Trail:**
   - `updated_at` timestamp tracks all changes
   - Creator information preserved
   - Future: Add ModerationLog model for complete audit trail

### Input Validation

1. **Rejection Reasons:**
   - Max length validation (500 chars)
   - Optional field with graceful handling
   - Sanitized before storage

2. **API Parameters:**
   - DRF serializer validation
   - Type checking on frontend
   - Query parameter sanitization

## User Flow

### Moderator Experience

1. **Login:** User logs in with MOD or ADMIN credentials
2. **Access Queue:** Navigates to `/mod/queue` via direct link or navigation
3. **View Queue:** Sees tabs for different content types
4. **Review Item:**
   - Reads diff claim, detail, context
   - Or reads comment and related diff
   - Views creator profile and history
   - Checks vote counts (for diffs)
5. **Take Action:**
   - Clicks "Approve" for good content → Item becomes LIVE
   - Clicks "Reject" (diffs) → Enters reason → Item becomes REJECTED
   - Clicks "Flag" (diffs) → Item becomes FLAGGED for team review
   - Clicks "Hide" (comments) → Item becomes HIDDEN
   - Clicks "Delete" (comments) → Confirms → Item becomes DELETED
6. **See Feedback:** Success message appears, item removed from queue
7. **Continue:** Reviews next item in queue

### Non-Moderator Experience

1. User tries to access `/mod/queue`
2. If not logged in → Redirected to `/auth/login?redirect=/mod/queue`
3. If logged in but not MOD/ADMIN → Redirected to `/` (home)
4. No error message shown (security through obscurity)

## Known Limitations & Future Work

### Current Limitations

1. **No Audit Log:** Rejection reasons not stored permanently
2. **No Bulk Actions:** Must review items one at a time
3. **No Notifications:** Moderators must manually check queue
4. **No User Feedback:** Content creators not notified of rejections
5. **Basic Filtering:** Limited filter and sort options
6. **No Pagination:** Shows all pending items (could be slow with many items)

### Planned Enhancements

**High Priority:**
1. ModerationLog model to track all actions with moderator, timestamp, reason
2. Notification system for moderators (new items) and creators (decisions)
3. Pagination for large queues
4. Better filtering (by category, date range, creator)

**Medium Priority:**
5. Bulk actions (approve/reject multiple items)
6. Moderator dashboard with statistics
7. Appeal system for rejected content
8. Keyboard shortcuts (A=approve, R=reject, etc.)

**Low Priority:**
9. Preview mode (see how content will look live)
10. Auto-moderation with ML spam detection
11. Moderator notes and internal discussions
12. Advanced sorting options

## Deployment Checklist

Before deploying to production:

- [ ] Run database migrations
- [ ] Create initial moderator accounts
- [ ] Test all moderation actions
- [ ] Verify role-based access control
- [ ] Check error handling and edge cases
- [ ] Test with large queue (performance)
- [ ] Verify mobile responsiveness
- [ ] Set up monitoring/logging for moderation actions
- [ ] Document moderation guidelines for team
- [ ] Train moderators on new system

## Troubleshooting

### Common Issues

**"Permission denied" when accessing /mod/queue:**
- Check user role: `User.objects.get(username='...').role`
- Should be 'MOD' or 'ADMIN'
- Update: `user.role = 'MOD'; user.save()`

**Empty moderation queue:**
- Verify items exist with PENDING/FLAGGED status
- Run test script: `python scripts/create_test_moderation_items.py`
- Check status filter setting

**Actions not working:**
- Check browser console for errors
- Verify backend is running: `docker-compose ps`
- Check Django logs: `docker-compose logs backend`
- Ensure migrations ran successfully

**TypeScript errors:**
- Run `npm run build` to check for type errors
- Verify all imports match file locations
- Check types match backend serializers

## Conclusion

The moderation queue system is fully implemented and ready for testing. All core functionality has been delivered:

- ✅ Backend API with moderation endpoints
- ✅ Frontend UI with review cards and actions
- ✅ Role-based access control
- ✅ Status management for diffs and comments
- ✅ Comprehensive documentation and testing guides

The system provides a solid foundation for content moderation and can be extended with the planned enhancements as needed.

## Support

For questions or issues:
1. Review this documentation
2. Check `/MODERATION_SETUP.md` for detailed setup steps
3. Inspect Django logs for backend errors
4. Check browser console for frontend issues
5. Verify permissions and authentication
6. Test API endpoints with cURL
