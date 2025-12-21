# DiffItemCard Usage Guide

## Overview
The `DiffItemCard` component now supports interactive voting with optimistic updates and error handling.

## Basic Usage

```tsx
import DiffItemCard from '@/components/diff/DiffItemCard';

function ComparisonView() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLoginRequired = () => {
    // Redirect to login or show login modal
    alert('Please login to vote');
    // router.push('/login');
  };

  return (
    <div>
      {diffs.map((diff) => (
        <DiffItemCard
          key={diff.id}
          diff={diff}
          isAuthenticated={isAuthenticated}
          onLoginRequired={handleLoginRequired}
        />
      ))}
    </div>
  );
}
```

## Props

### `diff: DiffItem` (required)
The diff item object containing:
- `id`: Unique identifier
- `claim`: The main claim/difference
- `detail`: Additional details
- `vote_counts`: Object with `accurate`, `needs_nuance`, `disagree` counts
- `spoiler_scope`: Spoiler level
- `created_by_username`: Username of creator

### `isAuthenticated?: boolean` (optional, default: false)
Whether the current user is authenticated. If `false`, clicking vote buttons triggers `onLoginRequired`.

### `onLoginRequired?: () => void` (optional)
Callback function triggered when user tries to vote without being authenticated.

## Features

### 1. Interactive Voting
- Three vote types: Accurate (↑), Needs Nuance (~), Disagree (↓)
- Visual feedback with color-coded buttons
- Selected state highlighted with colored background and border

### 2. Optimistic Updates
- Vote counts update immediately on click
- Automatically rolls back if API call fails
- No loading spinners needed (seamless UX)

### 3. Error Handling
- Network errors displayed in red banner
- Auto-dismisses after 5 seconds
- Previous state restored on error

### 4. Vote Changing
- Users can change their vote from one type to another
- Clicking the same vote does nothing (prevent accidental unvotes)
- Vote counts adjust correctly when changing votes

### 5. Loading States
- Buttons disabled during API calls
- Visual opacity change to indicate disabled state

## Authentication Integration

When you have authentication, update the component usage:

```tsx
import { useAuth } from '@/hooks/useAuth'; // Your auth hook

function ComparisonView() {
  const { isAuthenticated, redirectToLogin } = useAuth();

  return (
    <DiffItemCard
      diff={diff}
      isAuthenticated={isAuthenticated}
      onLoginRequired={redirectToLogin}
    />
  );
}
```

## API Endpoint

The component calls:
```
POST /api/diffs/items/{id}/vote/
Body: { vote: 'ACCURATE' | 'NEEDS_NUANCE' | 'DISAGREE' }
```

Backend must:
- Enforce authentication
- Handle unique constraint (one vote per user per diff)
- Return updated vote counts or success status

## Styling

Uses Tailwind CSS classes with:
- Green for Accurate votes
- Yellow for Needs Nuance votes
- Red for Disagree votes
- Hover states on all buttons
- Smooth transitions for visual feedback
