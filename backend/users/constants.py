"""Constants for user validation and moderation."""

# Reserved usernames that cannot be claimed by regular users
RESERVED_USERNAMES = {
    'admin',
    'administrator',
    'support',
    'moderator',
    'mod',
    'adaptapedia',
    'api',
    'root',
    'system',
    'null',
    'undefined',
    'me',
    'user',
    'users',
    'account',
    'accounts',
    'settings',
    'help',
    'about',
    'contact',
    'privacy',
    'terms',
    'login',
    'logout',
    'signup',
    'register',
    'auth',
    'oauth',
}

# Profanity blocklist for username validation
# Can be expanded in future versions
PROFANITY_BLOCKLIST = {
    # Common profanity and offensive terms (minimal set for v1)
    'fuck', 'shit', 'ass', 'bitch', 'damn', 'hell',
    'bastard', 'crap', 'piss', 'dick', 'cock', 'pussy',
    'nigger', 'nigga', 'retard', 'fag', 'faggot',
    'cunt', 'whore', 'slut', 'asshole',
    # Common leetspeak variations
    'fck', 'sht', 'btch', 'dmn', 'a55',
}
