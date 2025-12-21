# Moderation Queue Setup Guide

## Overview

This guide documents the complete moderation queue system for Adaptapedia, allowing moderators and admins to review and approve pending content submissions.

## Features Implemented

### Backend (Django)

1. **Updated Models** (`backend/diffs/models.py`):
   - Added `REJECTED` and `FLAGGED` statuses to `DiffStatus`
   - Added `PENDING` and `DELETED` statuses to `CommentStatus`

2. **Moderation Serializers** (`backend/moderation/serializers.py`):
   - `DiffModerationSerializer` - Includes all diff details, work/screen work titles, creator info, vote counts
   - `CommentModerationSerializer` - Includes comment details, related diff info, creator info
   - `ModerationActionSerializer` - For actions requiring a reason (e.g., rejection)

3. **Moderation Endpoints** (`backend/moderation/views.py`):

   **Diff Moderation:**
   - `GET /api/mod/diffs/` - List pending/flagged diffs (filter by status, category, spoiler_scope)
   - `POST /api/mod/diffs/{id}/approve/` - Approve diff (sets status to LIVE)
   - `POST /api/mod/diffs/{id}/reject/` - Reject diff (sets status to REJECTED, accepts optional reason)
   - `POST /api/mod/diffs/{id}/flag/` - Flag diff for review (sets status to FLAGGED)

   **Comment Moderation:**
   - `GET /api/mod/comments/` - List pending/live comments (filter by status, spoiler_scope)
   - `POST /api/mod/comments/{id}/approve/` - Approve comment (sets status to LIVE)
   - `POST /api/mod/comments/{id}/hide/` - Hide comment (sets status to HIDDEN)
   - `POST /api/mod/comments/{id}/delete/` - Delete comment (sets status to DELETED)

4. **Permissions**:
   - All moderation endpoints require `IsModerator` permission
   - Only users with role `MOD` or `ADMIN` can access
   - Returns 403 Forbidden for unauthorized users

5. **URL Configuration** (`backend/moderation/urls.py`):
   - Registered `DiffModerationViewSet` at `/api/mod/diffs/`
   - Registered `CommentModerationViewSet` at `/api/mod/comments/`

### Frontend (Next.js)

1. **Type Definitions** (`frontend/lib/types.ts`):
   - Added `DiffStatus` and `CommentStatus` types
   - Added `ModerationDiff` and `ModerationComment` interfaces
   - Added `ModerationAction` interface

2. **API Client** (`frontend/lib/api.ts`):
   - Added `api.moderation.diffs.*` namespace with all diff moderation endpoints
   - Added `api.moderation.comments.*` namespace with all comment moderation endpoints

3. **Components**:

   **ModerationActions** (`components/mod/ModerationActions.tsx`):
   - Reusable component for action buttons
   - Handles approve, reject, flag, hide, delete actions
   - Shows loading states and success/error feedback
   - Reject requires optional reason input
   - Delete requires confirmation dialog

   **DiffReviewCard** (`components/mod/DiffReviewCard.tsx`):
   - Displays diff details: claim, detail, category, spoiler scope
   - Shows work → screen work context with links
   - Shows creator username and created date
   - Displays vote counts
   - Integrates ModerationActions component

   **CommentReviewCard** (`components/mod/CommentReviewCard.tsx`):
   - Displays comment body and spoiler scope
   - Shows related diff claim and comparison link
   - Shows creator username and created date
   - Integrates ModerationActions component

   **ModQueue** (`components/mod/ModQueue.tsx`):
   - Main container with three tabs: Pending Diffs, Pending Comments, Flagged Items
   - Filter by status (Pending, Flagged, All)
   - Loading states and error handling
   - Empty state when queue is empty
   - Auto-refreshes after moderation actions

4. **Page** (`app/mod/queue/page.tsx`):
   - Protected route with role-based access control
   - Checks if user is authenticated
   - Verifies user role is MOD or ADMIN
   - Redirects unauthorized users to home page
   - Redirects unauthenticated users to login with redirect parameter

## Database Migration

After deploying these changes, you need to run migrations to update the database schema:

```bash
# Using Docker
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate

# Or locally (if running outside Docker)
cd backend
python manage.py makemigrations
python manage.py migrate
```

## Testing the Moderation Flow

### 1. Set up a moderator user

```bash
# Access Django shell
docker-compose exec backend python manage.py shell

# In the Django shell:
from users.models import User
user = User.objects.get(username='your_username')
user.role = 'MOD'
user.save()
exit()
```

### 2. Create test pending content

**Create a pending diff:**

```bash
# Access Django shell
docker-compose exec backend python manage.py shell

# In the Django shell:
from diffs.models import DiffItem
from works.models import Work
from screen.models import ScreenWork
from users.models import User

user = User.objects.first()
work = Work.objects.first()
screen_work = ScreenWork.objects.first()

diff = DiffItem.objects.create(
    work=work,
    screen_work=screen_work,
    category='PLOT',
    claim='Test pending diff for moderation',
    detail='This is a test diff that should appear in the moderation queue.',
    spoiler_scope='NONE',
    status='PENDING',
    created_by=user
)
print(f'Created pending diff #{diff.id}')
exit()
```

**Create a pending comment:**

```bash
# Access Django shell
docker-compose exec backend python manage.py shell

# In the Django shell:
from diffs.models import DiffItem, DiffComment
from users.models import User

user = User.objects.first()
diff = DiffItem.objects.filter(status='LIVE').first()

comment = DiffComment.objects.create(
    diff_item=diff,
    user=user,
    body='This is a test comment pending moderation.',
    spoiler_scope='NONE',
    status='PENDING'
)
print(f'Created pending comment #{comment.id}')
exit()
```

### 3. Access the moderation queue

1. Log in as a user with MOD or ADMIN role
2. Navigate to `/mod/queue`
3. You should see the moderation queue with tabs
4. Pending items will appear in their respective tabs
5. Review and approve/reject items using the action buttons

### 4. Test API endpoints directly (optional)

```bash
# Get auth token
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "mod_user", "password": "your_password"}'

# List pending diffs
curl -X GET http://localhost:8000/api/mod/diffs/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Approve a diff
curl -X POST http://localhost:8000/api/mod/diffs/1/approve/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Reject a diff with reason
curl -X POST http://localhost:8000/api/mod/diffs/2/reject/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Inaccurate information"}'

# List pending comments
curl -X GET http://localhost:8000/api/mod/comments/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Approve a comment
curl -X POST http://localhost:8000/api/mod/comments/1/approve/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Hide a comment
curl -X POST http://localhost:8000/api/mod/comments/2/hide/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## User Flow (Moderator)

1. Moderator logs in with MOD or ADMIN role
2. Navigates to `/mod/queue`
3. Sees tabs for "Pending Diffs", "Pending Comments", and "Flagged Items"
4. Switches between tabs to review different types of content
5. For each item:
   - Reviews the content and context
   - Sees creator information and creation date
   - For diffs: sees vote counts if any
   - For comments: sees the related diff claim and comparison
6. Takes action:
   - **Approve**: Content becomes LIVE and visible to all users
   - **Reject** (diffs): Content is marked REJECTED, optionally with a reason
   - **Flag** (diffs): Content is marked FLAGGED for further review
   - **Hide** (comments): Content is marked HIDDEN, not visible to users
   - **Delete** (comments): Content is marked DELETED (requires confirmation)
7. After action, item disappears from current queue view
8. Queue auto-refreshes to show updated list

## Security Considerations

1. **Role-Based Access Control**:
   - Backend uses `IsModerator` permission class
   - Frontend checks user role before rendering moderation UI
   - Unauthorized API requests return 403 Forbidden
   - Unauthenticated users are redirected to login

2. **Authentication**:
   - All moderation endpoints require valid JWT token
   - Token is sent in Authorization header
   - Frontend automatically includes token from tokenManager

3. **Data Integrity**:
   - Only MOD and ADMIN roles can change content status
   - Regular users cannot access moderation endpoints
   - Database constraints prevent invalid status values

4. **Audit Trail** (Future Enhancement):
   - Currently, status changes are tracked via `updated_at` timestamp
   - Consider adding ModerationLog model to track who approved/rejected what and when
   - Store rejection reasons in a separate model for reporting

## Future Enhancements

### Priority Enhancements:
1. **Audit Log**: Track all moderation actions with moderator, timestamp, and reason
2. **Bulk Actions**: Allow moderators to approve/reject multiple items at once
3. **Rejection Reasons**: Store and display rejection reasons to content creators
4. **Moderator Notes**: Allow moderators to add internal notes on items
5. **Queue Statistics**: Show counts and charts of moderation activity

### Nice-to-Have Features:
1. **Keyboard Shortcuts**: A to approve, R to reject, F to flag
2. **Notification System**: Alert moderators when new items need review
3. **Filter by Category/Scope**: More granular filtering options
4. **Preview Mode**: Preview how content will look when live
5. **User History**: View moderation history for specific users
6. **Appeal System**: Allow creators to appeal rejected content
7. **Auto-moderation**: ML-based spam detection and auto-flagging

## Troubleshooting

### "Permission denied" errors
- Verify user role is MOD or ADMIN: `User.objects.get(username='...').role`
- Check JWT token is valid and not expired
- Ensure token is being sent in Authorization header

### Empty moderation queue
- Create test pending items using Django shell (see testing section)
- Check if status filter is set correctly
- Verify items have status='PENDING' or status='FLAGGED'

### Actions not working
- Check browser console for API errors
- Verify backend is running: `docker-compose ps`
- Check Django logs: `docker-compose logs backend`
- Ensure migrations have been run

### TypeScript errors
- Run `npm run build` in frontend directory to check for type errors
- Verify all imports are correct
- Check that types in lib/types.ts match backend serializers

## Files Modified/Created

### Backend Files:
- `backend/diffs/models.py` - Updated status choices
- `backend/moderation/serializers.py` - Added moderation serializers
- `backend/moderation/views.py` - Added moderation viewsets
- `backend/moderation/urls.py` - Registered new viewsets

### Frontend Files:
- `frontend/lib/types.ts` - Added moderation types
- `frontend/lib/api.ts` - Added moderation API namespace
- `frontend/components/mod/ModerationActions.tsx` - Created
- `frontend/components/mod/DiffReviewCard.tsx` - Created
- `frontend/components/mod/CommentReviewCard.tsx` - Created
- `frontend/components/mod/ModQueue.tsx` - Created
- `frontend/app/mod/queue/page.tsx` - Created

### Documentation:
- `MODERATION_SETUP.md` - This file

## Support

For issues or questions about the moderation system:
1. Check this documentation
2. Review Django logs for backend issues
3. Check browser console for frontend issues
4. Verify permissions and authentication
5. Test API endpoints directly with curl
