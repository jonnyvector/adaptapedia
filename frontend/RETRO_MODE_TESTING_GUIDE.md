# Retro Mode Testing Guide

Quick reference for testing the new Retro Mode theme feature.

## Quick Start

1. **Start the dev server:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Open in browser:**
   ```
   http://localhost:3000
   ```

3. **Toggle retro mode:**
   - Scroll to footer
   - Click "💾 Retro Mode" button
   - Page should transform with neon colors and retro styling

## What to Expect

### Modern Mode (Default)
- White background
- Dark gray text
- Blue links
- Clean, modern design
- Sans-serif fonts
- Rounded corners

### Retro Mode
- Dark navy background (#000033)
- Neon green terminal text (#00ff00)
- Magenta/pink links (#ff00ff)
- Cyan borders (#00ffff)
- Courier New monospace font
- Thick 3px borders everywhere
- No rounded corners (square edges)
- Scanlines background effect
- CRT screen overlay (subtle)
- 3D beveled buttons
- Easter eggs appear on homepage:
  - Visitor counter
  - Under construction banner
  - Netscape Navigator badge
  - Scrolling marquee text
  - Blinking "NEW!" text
  - Web ring navigation
  - Guestbook link

## Testing Checklist

### Basic Functionality
- [ ] Theme toggle appears in footer
- [ ] Click toggle switches to retro mode
- [ ] Click again switches back to modern mode
- [ ] Refresh page - theme persists
- [ ] Close browser and reopen - theme still persists
- [ ] Clear localStorage - resets to modern mode

### Visual Testing
Navigate to these pages in both modes:

- [ ] Homepage (/)
- [ ] Search page (/search?q=test)
- [ ] Book page (e.g., /book/jurassic-park)
- [ ] Screen adaptation page (e.g., /screen/jurassic-park-1993)
- [ ] Comparison page (e.g., /compare/jurassic-park/jurassic-park-1993)
- [ ] Login page (/auth/login)
- [ ] Signup page (/auth/signup)

Verify in each page:
- [ ] Text is readable (good contrast)
- [ ] Buttons work and look correct
- [ ] Cards have proper styling
- [ ] Forms are usable
- [ ] No layout breaks
- [ ] No overflow/scrolling issues

### Accessibility Testing

#### Keyboard Navigation
- [ ] Tab to theme toggle button
- [ ] Press Enter or Space to toggle theme
- [ ] Tab through all interactive elements
- [ ] All have visible focus indicators
- [ ] Focus order is logical

#### Color Contrast
Use browser DevTools or contrast checker:
- [ ] Modern mode: text on background passes WCAG AA (4.5:1)
- [ ] Retro mode: green text on navy passes WCAG AA (should be ~7.6:1)
- [ ] Retro mode: magenta links pass WCAG AA (should be ~6.8:1)

#### Screen Reader (Optional)
- [ ] Enable screen reader (VoiceOver/NVDA)
- [ ] Navigate to theme toggle
- [ ] Verify it announces "Switch to retro mode, button"
- [ ] Toggle theme
- [ ] Verify it announces "Switch to modern mode, button"

### Mobile Testing

Test on mobile device or browser DevTools device mode:

**Devices to test:**
- [ ] iPhone (375px width)
- [ ] iPad (768px width)
- [ ] Android phone (360px width)

**What to check:**
- [ ] Theme toggle button is at least 44px tall
- [ ] All buttons are easily tappable
- [ ] No horizontal scrolling
- [ ] Text is readable without zooming
- [ ] Easter eggs display correctly on narrow screens

### LocalStorage Testing

1. **Check storage:**
   - Open DevTools
   - Go to Application tab (Chrome) or Storage tab (Firefox)
   - Find Local Storage → http://localhost:3000
   - Look for key: `adaptapedia-theme`

2. **Test scenarios:**
   - [ ] Switch to retro mode → verify value is "retro"
   - [ ] Switch to modern mode → verify value is "modern"
   - [ ] Delete the key → page should default to modern
   - [ ] Set invalid value → should handle gracefully

### Browser Compatibility

Test in multiple browsers if available:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari

### Performance Testing

- [ ] Theme switch feels instant (no lag)
- [ ] Scrolling is smooth in both modes
- [ ] No console errors
- [ ] No console warnings
- [ ] CSS animations run at 60fps

## Common Issues and Solutions

### Issue: Theme doesn't persist after refresh
**Solution:** Check if localStorage is enabled in your browser. Private/Incognito mode may block it.

### Issue: Easter eggs don't appear in retro mode
**Solution:** Make sure you're on the homepage (/). Easter eggs only show there.

### Issue: Styles look broken
**Solution:** Hard refresh the page (Cmd+Shift+R or Ctrl+Shift+R) to clear CSS cache.

### Issue: Text is hard to read in retro mode
**Solution:** This is intentional for the retro aesthetic, but contrast ratios meet WCAG AA standards. If genuinely problematic, switch back to modern mode.

### Issue: Toggle button not responding
**Solution:** Check browser console for JavaScript errors. Ensure dev server is running.

## Manual Visual Inspection

### Retro Mode Elements to Check

1. **Background:**
   - Dark navy with subtle scanlines
   - Slight CRT screen effect overlay

2. **Text:**
   - Bright green (#00ff00) for main text
   - Monospace Courier New font
   - Headings are UPPERCASE with cyan/magenta shadow

3. **Buttons:**
   - Thick 3px borders
   - 3D beveled appearance
   - Gradient backgrounds
   - Offset drop shadow
   - Hover effect: shadow increases, slight movement
   - Active effect: shadow decreases, opposite movement

4. **Cards:**
   - 3px cyan borders
   - Square corners (no rounding)
   - 5px offset drop shadow
   - Dark gradient background

5. **Links:**
   - Magenta/pink color
   - Glow effect on text
   - Hover: underline + brighter glow

6. **Vote Buttons (on comparison pages):**
   - Accurate: Bright green
   - Needs Nuance: Yellow
   - Disagree: Magenta
   - All maintain 3D beveled look

7. **Theme Toggle Button:**
   - Pulsing glow animation
   - Magenta/yellow color scheme
   - Most prominent retro element

## Testing Easter Eggs

On homepage in retro mode, verify:

1. **Visitor Counter:**
   - Shows random 6-digit number
   - Has yellow "YOU ARE VISITOR NUMBER" text
   - Number is large and green
   - Bordered black box

2. **Under Construction:**
   - Yellow and black diagonal stripes
   - Bold text saying "SITE UNDER CONSTRUCTION"

3. **Netscape Badge:**
   - Small text
   - Cyan border
   - Says "BEST VIEWED IN NETSCAPE NAVIGATOR 4.0"

4. **Marquee:**
   - Text scrolls right to left continuously
   - Yellow text on dark background
   - Smooth animation (no jank)

5. **Blinking NEW:**
   - Pink/magenta stars and text
   - Blinks at 1 second intervals
   - Says "★ NEW! ★"
   - Additional text about nostalgia

6. **Web Ring:**
   - Cyan bordered panel
   - Has PREV/RANDOM/NEXT buttons (disabled)
   - Shows fake member number

7. **Guestbook:**
   - Bordered yellow text
   - Says "Please sign our GUESTBOOK!"
   - Has "Year 2000" joke

## Automated Testing Commands

```bash
# Type checking
npm run type-check

# Run tests
npm test

# Start dev server
npm run dev

# Build for production
npm run build
```

Note: Build may fail due to pre-existing TypeScript errors in the codebase, unrelated to retro mode implementation.

## Success Criteria

All these should be true:
- ✓ Theme toggle works in footer
- ✓ Theme persists after refresh
- ✓ Both themes look correct
- ✓ No console errors
- ✓ Keyboard accessible
- ✓ Good color contrast in both modes
- ✓ Mobile friendly
- ✓ Easter eggs show in retro mode
- ✓ Easter eggs hide in modern mode
- ✓ Smooth performance

If all checkboxes pass, implementation is successful! 🎉

## Tips for Reviewers

1. **Try switching themes rapidly** - Should handle it smoothly with no flickering

2. **Test on actual mobile device** if possible - Touch targets and readability are crucial

3. **Use browser zoom** - Test at 50%, 100%, 200%, and 400% zoom levels

4. **Check different screen sizes** - Use responsive design mode in DevTools

5. **Try with images disabled** - Should still be usable (mainly text-based)

6. **Test with JavaScript disabled** - Will gracefully degrade to modern mode

7. **Look for "flash of unstyled content"** - Should not happen due to proper hydration handling

## Reporting Issues

If you find bugs or issues, please report with:
- Browser name and version
- Screen size / device
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Console errors (if any)

## Additional Notes

- Retro mode is meant to be FUN but still FUNCTIONAL
- Don't sacrifice usability for aesthetics
- Accessibility is non-negotiable
- Performance should remain smooth
- No external dependencies added
- Works entirely in browser (no server changes)

Happy testing! 💾🖥️
