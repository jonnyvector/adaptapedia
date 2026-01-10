"""Constants for the diffs app."""
from .models import SpoilerScope

# Pagination limits for different endpoints
DEFAULT_TRENDING_LIMIT = 8
DEFAULT_BROWSE_LIMIT = 12
DEFAULT_NEEDS_HELP_LIMIT = 20
DEFAULT_CATALOG_LIMIT = 20
MAX_BROWSE_LIMIT = 50

# Featured works - manually curated for homepage/browse sections
# These work IDs represent high-quality, popular comparisons
FEATURED_WORKS = {
    'lord-of-the-rings': 1,
    'jurassic-park': 12,
    'harry-potter': 9,
    'it': 23,
    'dune': 10,
    'hunger-games': 11,
    'the-shining': 22,
    'fight-club': 38,
}
CURATED_WORK_IDS = list(FEATURED_WORKS.values())

# Spoiler scope ordering for filtering
# Lower number = less spoilery, users can see scopes <= their chosen level
SPOILER_SCOPE_ORDER = {
    SpoilerScope.NONE: 0,
    SpoilerScope.BOOK_ONLY: 1,
    SpoilerScope.SCREEN_ONLY: 1,
    SpoilerScope.FULL: 2,
}

# Trending algorithm parameters
TRENDING_LOOKBACK_DAYS = 7  # How many days to consider "recent" activity
TRENDING_MAX_PER_WORK = 2  # Maximum comparisons from the same book in trending

# Activity score weights for trending
TRENDING_DIFF_WEIGHT = 3.0  # Weight for new diffs (encourage content creation)
TRENDING_VOTE_WEIGHT = 1.0  # Weight for votes

# Engagement score weights for featured
FEATURED_DIFF_WEIGHT = 2.0  # Weight for total diffs
FEATURED_VOTE_WEIGHT = 1.0  # Weight for total votes

# Disputed diff thresholds
MIN_VOTES_FOR_DISPUTE = 5  # Minimum votes before considering dispute
DISPUTE_ACCURACY_MIN = 0.3  # Disputed if accurate % is between these bounds
DISPUTE_ACCURACY_MAX = 0.7

# Recently updated cutoff
RECENTLY_UPDATED_HOURS = 48  # Activity within this window counts as "recent"
