---
description: Security review for authentication, authorization, and vulnerabilities
allowed-tools: [Read, Grep, Task, Bash]
argument-hint: <file or directory>
---

Perform a security review of $ARGUMENTS checking for:

**Authentication & Authorization:**
- Authentication checks on all protected endpoints
- Proper permission classes in Django views
- User ownership validation where required
- Session management security

**Input Validation:**
- All user inputs are validated and sanitized
- No raw SQL queries (use ORM or parameterized queries)
- XSS prevention in frontend rendering
- CSRF protection enabled

**Data Security:**
- No secrets/API keys in code (check for hardcoded credentials)
- Environment variables used for sensitive config
- Proper database query parameterization
- No sensitive data in logs or error messages

**API Security:**
- CORS configuration (whitelist specific origins only)
- Rate limiting on public APIs
- Content Security Policy (CSP) headers
- Secure cookie settings (httpOnly, secure, sameSite)

**Spoiler System Security:**
- Spoiler scope enforcement on API endpoints
- No spoiler content in SSR/indexable pages
- Client-side spoiler reveals properly gated

Identify any vulnerabilities and provide specific remediation steps.
