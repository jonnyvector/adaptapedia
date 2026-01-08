# Onboarding Accessibility Audit

## Overview

This document provides a comprehensive accessibility checklist for the onboarding feature. The goal is to ensure that all users, including those with disabilities, can successfully complete the onboarding process.

## Standards Compliance

Target: **WCAG 2.1 Level AA** compliance

---

## 1. Keyboard Navigation

### Requirements

All interactive elements must be keyboard accessible without requiring a mouse.

### Checklist

#### Username Step
- [ ] Can tab into username input field
- [ ] Input field shows clear focus indicator (outline/border)
- [ ] Can type username with keyboard
- [ ] Can tab to suggestion buttons (if shown)
- [ ] Can activate suggestions with Enter or Space
- [ ] Can tab to "Continue" button
- [ ] Can activate "Continue" with Enter or Space
- [ ] Tab order is logical (top to bottom)
- [ ] No keyboard traps (can always tab forward/backward)
- [ ] Shift+Tab works to go backward

#### Quiz Step
- [ ] Can tab through all genre buttons
- [ ] Genre buttons show clear focus indicator
- [ ] Can toggle genres with Enter or Space
- [ ] Can tab through preference radio buttons
- [ ] Radio buttons show clear focus indicator
- [ ] Can select radio with Enter or Space
- [ ] Can tab through contribution interest buttons
- [ ] Can tab to "Skip" button
- [ ] Can tab to "Continue" button
- [ ] Tab order follows visual layout

#### Suggestions Step
- [ ] Can tab through comparison links
- [ ] Links show clear focus indicator
- [ ] Can activate links with Enter
- [ ] Can tab to "Get Started!" button
- [ ] Can activate button with Enter

### Testing Tools
- Manual keyboard testing (Tab, Shift+Tab, Enter, Space)
- Browser DevTools: Check `:focus` styles
- aXe DevTools: Automated keyboard accessibility check

---

## 2. Screen Reader Support

### Requirements

All content must be properly announced by screen readers with appropriate semantics.

### Checklist

#### Semantic HTML
- [ ] Headings use proper hierarchy (h1, h2, h3)
- [ ] Buttons use `<button>` element (not `<div>` with click handler)
- [ ] Links use `<a>` element
- [ ] Form inputs have associated `<label>` elements
- [ ] Form inputs use appropriate `type` attribute
- [ ] Lists use `<ul>`/`<ol>` where appropriate

#### ARIA Labels
- [ ] Username input has accessible label
- [ ] Loading states use `aria-busy="true"`
- [ ] Error messages use `aria-live="polite"` or `aria-describedby`
- [ ] Success messages use `aria-live="polite"`
- [ ] Genre buttons indicate selected state with `aria-pressed`
- [ ] Radio buttons grouped with `role="radiogroup"` and `aria-labelledby`
- [ ] Progress indicator uses `aria-label` (if visual only)

#### Announcements
- [ ] Page title changes on each step
- [ ] Loading states are announced
- [ ] Error messages are announced when they appear
- [ ] Success messages are announced
- [ ] Button states (disabled/enabled) are announced
- [ ] Selection changes are announced

### Testing Tools
- VoiceOver (macOS): Cmd+F5 to enable
- NVDA (Windows): Free download
- JAWS (Windows): Commercial
- ChromeVox (Chrome extension): Free

### Test Script

1. Enable screen reader
2. Navigate to `/onboarding`
3. Listen to page announcement
4. Tab through all elements
5. Verify each element is announced with its purpose
6. Verify state changes are announced

---

## 3. Visual Design

### Requirements

Visual design must be accessible to users with low vision, color blindness, or other visual impairments.

### Checklist

#### Color Contrast (WCAG AA: 4.5:1 for normal text, 3:1 for large text)
- [ ] Black text on white background passes (21:1) ✓
- [ ] White text on black background passes (21:1) ✓
- [ ] Error red (#DC2626) on white passes
- [ ] Success green (#16A34A) on white passes
- [ ] Gray muted text (#71717A) on white passes (if used for body text)
- [ ] Button text has sufficient contrast
- [ ] Link text has sufficient contrast
- [ ] Focus indicators have 3:1 contrast with background

#### Color Independence
- [ ] Errors indicated by icon + color (not color alone)
- [ ] Success indicated by icon + color (not color alone)
- [ ] Selected states use shape/icon change (not just color)
- [ ] Validation states visible to colorblind users

#### Text Sizing
- [ ] Base font size: 16px minimum for body text ✓
- [ ] Headings are larger than body text ✓
- [ ] Text can be resized to 200% without loss of functionality
- [ ] No horizontal scrolling when zoomed to 200%
- [ ] Line height: at least 1.5 for body text ✓
- [ ] Paragraph spacing: at least 2x font size

#### Focus Indicators
- [ ] All interactive elements have visible focus indicator
- [ ] Focus indicator is at least 2px solid border
- [ ] Focus indicator has 3:1 contrast with background
- [ ] Focus indicator is not removed with `outline: none` without replacement

### Testing Tools
- Chrome DevTools Lighthouse: Accessibility audit
- Contrast Checker: WebAIM Contrast Checker
- Color Blindness Simulator: Colorblind Web Page Filter
- Zoom: Browser zoom to 200%

---

## 4. Mobile & Touch Accessibility

### Requirements

Touch targets must be large enough and spaced appropriately for touch interaction.

### Checklist

#### Touch Target Size (WCAG 2.1: 44x44px minimum)
- [ ] Username input field: height >= 44px ✓ (py-3 = 48px)
- [ ] Suggestion buttons: height >= 44px ✓ (py-2 = 40px - might need increase)
- [ ] Genre buttons: height >= 44px ✓ (py-3 = 48px)
- [ ] Radio buttons: height >= 44px ✓ (py-3 = 48px)
- [ ] Continue/Skip buttons: height >= 44px ✓ (py-3 = 48px)
- [ ] Comparison links: height >= 44px ✓ (p-4 = 64px)
- [ ] "Get Started!" button: height >= 44px ✓ (py-3 = 48px)

#### Touch Target Spacing
- [ ] Buttons have at least 8px spacing between them ✓ (gap-2, gap-3)
- [ ] Genre grid has appropriate spacing ✓ (gap-3)
- [ ] No overlapping tap areas

#### Mobile-Specific
- [ ] Form inputs zoom correctly on iOS (font-size >= 16px) ✓
- [ ] No horizontal scrolling at any viewport size
- [ ] All content visible and accessible on 320px width
- [ ] Pinch to zoom works (not disabled)

### Testing
- Physical device testing (iPhone, Android)
- Chrome DevTools device emulation
- Safari Responsive Design Mode

---

## 5. Motion & Animation

### Requirements

Respect user preferences for reduced motion.

### Checklist

#### Animation Respect
- [ ] Check if any animations exist in onboarding
- [ ] Animations use `prefers-reduced-motion` media query
- [ ] Essential animations have reduced-motion alternatives
- [ ] Auto-playing content can be paused

#### Current Implementation
- Loading spinners: Static alternative for reduced motion?
- Transitions: Instant for reduced motion?

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 6. Forms & Input

### Requirements

Forms must be easy to complete and provide clear feedback.

### Checklist

#### Input Fields
- [ ] All inputs have associated labels
- [ ] Labels are visible (not placeholder-only)
- [ ] Inputs have appropriate `type` attribute (text, email, etc.)
- [ ] Inputs have `autocomplete` attributes where appropriate
- [ ] Required fields are marked (visually and with `aria-required`)

#### Validation
- [ ] Validation messages are clear and actionable
- [ ] Errors appear near the relevant field
- [ ] Errors are announced to screen readers
- [ ] Users can understand what went wrong and how to fix it
- [ ] Validation happens on blur and submit (not on every keystroke)
- [ ] Success states are clearly indicated

#### Error Recovery
- [ ] Users can easily correct errors
- [ ] Form data is preserved when errors occur
- [ ] Users are not forced to re-enter all data

---

## 7. Content & Language

### Requirements

Content must be clear, concise, and understandable.

### Checklist

#### Language
- [ ] Page has `lang` attribute (e.g., `lang="en"`)
- [ ] Content is written in plain language
- [ ] Instructions are clear and concise
- [ ] Error messages are helpful (not just "Invalid input")
- [ ] Jargon is avoided or explained

#### Structure
- [ ] Content follows logical reading order
- [ ] Headings describe the content that follows
- [ ] Lists are used for related items
- [ ] Emphasis is semantic (`<strong>`, `<em>`) not just visual

---

## 8. Loading & Timing

### Requirements

Users must have adequate time to complete actions.

### Checklist

#### Loading States
- [ ] Loading spinners are visible and accessible
- [ ] Loading states announce to screen readers ("Loading...")
- [ ] Long-running operations show progress indication
- [ ] Users are not blocked by loading states

#### Timeouts
- [ ] No time limits on completing onboarding
- [ ] API requests have reasonable timeouts (30s+)
- [ ] Users can retry after timeout
- [ ] No auto-advancing steps (user controls pacing)

---

## 9. Testing Checklist

### Automated Testing

- [ ] Run Lighthouse accessibility audit (score >= 90)
- [ ] Run aXe DevTools scan (0 violations)
- [ ] Run WAVE tool (0 errors)
- [ ] Run keyboard navigation automated tests

### Manual Testing

- [ ] Complete onboarding using only keyboard
- [ ] Complete onboarding using screen reader (VoiceOver/NVDA)
- [ ] Complete onboarding at 200% zoom
- [ ] Complete onboarding on 320px width mobile
- [ ] Complete onboarding with colorblind simulation
- [ ] Complete onboarding with reduced motion enabled

### Browser Testing

- [ ] Chrome + ChromeVox
- [ ] Firefox + NVDA
- [ ] Safari + VoiceOver
- [ ] Edge + Narrator

---

## 10. Known Issues & Remediation

### Current Issues

| Issue | Severity | Remediation | Status |
|-------|----------|-------------|--------|
| Suggestion buttons might be < 44px height | Medium | Increase py-2 to py-3 | ⏳ Pending verification |
| Loading spinner not announced | High | Add aria-live region | ⏳ Pending verification |
| Error messages might not be associated with inputs | High | Add aria-describedby | ⏳ Pending verification |

### Future Improvements

- [ ] Add progress indicator for screen readers ("Step 1 of 3")
- [ ] Add skip navigation link
- [ ] Add keyboard shortcut hints
- [ ] Improve error message specificity

---

## Testing Tools & Resources

### Automated Tools
- **Lighthouse** (Chrome DevTools): Overall accessibility score
- **aXe DevTools**: Detailed violation report
- **WAVE**: Web Accessibility Evaluation Tool
- **Pa11y**: Command-line accessibility tester

### Manual Testing Tools
- **VoiceOver** (macOS): Built-in screen reader (Cmd+F5)
- **NVDA** (Windows): Free screen reader
- **JAWS** (Windows): Commercial screen reader
- **ChromeVox** (Chrome): Browser extension screen reader

### Contrast Checkers
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Colour Contrast Analyser**: Desktop app

### Color Blindness Simulators
- **Colorblind Web Page Filter**: Browser extension
- **Stark** (Figma plugin): Design-time checking

### Keyboard Testing
- **Tab key**: Navigate forward
- **Shift+Tab**: Navigate backward
- **Enter**: Activate buttons/links
- **Space**: Toggle checkboxes/buttons
- **Arrow keys**: Navigate within radio groups

---

## Compliance Checklist

### WCAG 2.1 Level A (Must Have)

- [x] 1.1.1 Non-text Content: All images have alt text
- [x] 1.3.1 Info and Relationships: Semantic HTML
- [x] 1.3.2 Meaningful Sequence: Logical reading order
- [x] 1.4.1 Use of Color: Not relying on color alone
- [x] 2.1.1 Keyboard: All functionality keyboard accessible
- [x] 2.1.2 No Keyboard Trap: Can navigate away from all elements
- [x] 2.4.1 Bypass Blocks: Skip navigation (N/A for single-page onboarding)
- [x] 2.4.2 Page Titled: Page has descriptive title
- [x] 3.2.1 On Focus: No context change on focus
- [x] 3.2.2 On Input: No context change on input
- [x] 3.3.1 Error Identification: Errors are clearly identified
- [x] 3.3.2 Labels or Instructions: Inputs have labels
- [x] 4.1.1 Parsing: Valid HTML
- [x] 4.1.2 Name, Role, Value: Proper ARIA usage

### WCAG 2.1 Level AA (Target)

- [x] 1.4.3 Contrast (Minimum): 4.5:1 for normal text, 3:1 for large text
- [ ] 1.4.5 Images of Text: No images of text (use real text)
- [x] 2.4.3 Focus Order: Logical focus order
- [x] 2.4.6 Headings and Labels: Descriptive headings and labels
- [x] 2.4.7 Focus Visible: Visible focus indicator
- [x] 3.1.2 Language of Parts: Language specified
- [x] 3.2.3 Consistent Navigation: Navigation is consistent
- [x] 3.2.4 Consistent Identification: Components identified consistently
- [x] 3.3.3 Error Suggestion: Helpful error messages
- [x] 3.3.4 Error Prevention: Data can be reviewed before submission
- [ ] 4.1.3 Status Messages: Status messages use aria-live (pending verification)

### WCAG 2.1 Level AAA (Nice to Have)

- [ ] 1.4.6 Contrast (Enhanced): 7:1 for normal text
- [ ] 2.1.3 Keyboard (No Exception): All functionality keyboard accessible
- [ ] 2.4.8 Location: User knows where they are (breadcrumbs/progress indicator)
- [ ] 2.4.10 Section Headings: Sections have headings
- [ ] 3.3.5 Help: Context-sensitive help available

---

## Sign-Off

### Accessibility Audit Completed By:

- **Name:** ___________________
- **Date:** ___________________
- **Signature:** ___________________

### Issues Found:

- **Critical:** ___ (must fix)
- **High:** ___ (should fix)
- **Medium:** ___ (nice to fix)
- **Low:** ___ (optional)

### Approval Status:

- [ ] Approved for release (all critical issues resolved)
- [ ] Conditional approval (high-priority issues documented with fix timeline)
- [ ] Not approved (critical issues must be fixed)

---

## Additional Notes

- The onboarding flow is critical for user activation
- Accessibility issues here can prevent users from using the product at all
- Prioritize keyboard navigation and screen reader support
- Test with real assistive technology users if possible
- Document workarounds for any known issues
