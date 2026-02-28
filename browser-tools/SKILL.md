---
name: browser-tools
description: Interactive browser automation via Chrome DevTools Protocol. Use when you need to interact with web pages, test frontends, or when user interaction with a visible browser is required.
---

# Browser Tools

Chrome DevTools Protocol tools for agent-assisted web automation. These tools connect to Chrome running on `:9222` with remote debugging enabled.

## Setup

Run once before first use:

```
cd {baseDir}/browser-tools
npm install
```

## Start Chrome

```
{baseDir}/browser-tools/browser-start.js              # Fresh profile
{baseDir}/browser-tools/browser-start.js --profile    # Copy user's profile (cookies, logins)
```

Launch Chrome with remote debugging on `:9222`. Use `--profile` to preserve user's authentication state.

> **Note**: Currently only works on macOS. For other platforms, manually start Chrome with `--remote-debugging-port=9222`.

## Navigate

```
{baseDir}/browser-tools/browser-nav.js https://example.com
{baseDir}/browser-tools/browser-nav.js https://example.com --new
```

Navigate to URLs. Use `--new` flag to open in a new tab instead of reusing current tab.

## Evaluate JavaScript

```
{baseDir}/browser-tools/browser-eval.js 'document.title'
{baseDir}/browser-tools/browser-eval.js 'document.querySelectorAll("a").length'
```

Execute JavaScript in the active tab. Code runs in async context. Use this to extract data, inspect page state, or perform DOM operations programmatically.

## Screenshot

```
{baseDir}/browser-tools/browser-screenshot.js
```

Capture current viewport and return temporary file path. Use this to visually inspect page state or verify UI changes.

## Pick Elements

```
{baseDir}/browser-tools/browser-pick.js "Click the submit button"
```

**IMPORTANT**: Use this tool when the user wants to select specific DOM elements on the page. This launches an interactive picker that lets the user click elements to select them. The user can select multiple elements (Cmd/Ctrl+Click) and press Enter when done. The tool returns CSS selectors for the selected elements.

Common use cases:

- User says "I want to click that button" → Use this tool to let them select it
- User says "extract data from these items" → Use this tool to let them select the elements
- When you need specific selectors but the page structure is complex or ambiguous

## Cookies

```
{baseDir}/browser-tools/browser-cookies.js
```

Display all cookies for the current tab including domain, path, httpOnly, and secure flags. Use this to debug authentication issues or inspect session state.

## Extract Page Content

```
{baseDir}/browser-tools/browser-content.js https://example.com
```

Navigate to a URL and extract readable content as markdown. Uses Mozilla Readability for article extraction and Turndown for HTML-to-markdown conversion. Works on pages with JavaScript content (waits for page to load).

## Click Element

```
{baseDir}/browser-tools/browser-click.js '#submit-button'
{baseDir}/browser-tools/browser-click.js 'button:nth-child(2)' --double
{baseDir}/browser-click.js '.menu-item' --right
```

Click an element by CSS selector. Supports single click, double click, and right click.

Options:
- `--double` - Double click instead of single click
- `--right` - Right click (context menu)

## Type Text

```
{baseDir}/browser-tools/browser-type.js '#search-input' 'hello world'
{baseDir}/browser-tools/browser-type.js '#search-input' 'new text' --clear
{baseDir}/browser-tools/browser-type.js '#search-input' 'appended' --append
{baseDir}/browser-tools/browser-type.js '#search-input' 'slow' --typing
```

Type text into an input element.

Options:
- `--clear` - Clear input before typing
- `--append` - Append to existing text
- `--typing` - Simulate real typing (character by character)

## Scroll

```
{baseDir}/browser-tools/browser-scroll.js down
{baseDir}/browser-tools/browser-scroll.js down 1000
{baseDir}/browser-tools/browser-scroll.js up 500
{baseDir}/browser-tools/browser-scroll.js top
{baseDir}/browser-tools/browser-scroll.js bottom
{baseDir}/browser-tools/browser-scroll.js element '#footer'
```

Scroll the page.

Arguments:
- `up/down` - Scroll direction (default: 500px)
- `top/bottom` - Scroll to page top/bottom
- `element` - Scroll to specific element

Options:
- `--smooth` - Use smooth scrolling animation

## Wait for Element

```
{baseDir}/browser-tools/browser-wait.js wait-for '#loading-spinner' --visible
{baseDir}/browser-tools/browser-wait.js wait-gone '.loading'
{baseDir}/browser-tools/browser-wait.js wait-for '.modal' --timeout=5000
```

Wait for an element to appear or disappear.

Arguments:
- `wait-for` - Wait for element to exist
- `wait-gone` - Wait for element to be removed

Options:
- `--visible` - Wait for element to be visible
- `--hidden` - Wait for element to be hidden/removed
- `--timeout=N` - Timeout in milliseconds (default: 10000)

## Tab Management

```
{baseDir}/browser-tools/browser-tabs.js list
{baseDir}/browser-tools/browser-tabs.js switch 2
{baseDir}/browser-tools/browser-tabs.js switch-url 'github.com'
{baseDir}/browser-tools/browser-tabs.js new https://google.com
{baseDir}/browser-tools/browser-tabs.js active
```

Manage browser tabs.

Actions:
- `list` - List all open tabs
- `switch <index>` - Switch to tab by index (0-based)
- `switch-url <url>` - Switch to tab containing URL
- `new <url>` - Open new tab with URL
- `active` - Show current active tab

## Close Tab

```
{baseDir}/browser-tools/browser-close.js
{baseDir}/browser-tools/browser-close.js 2
```

Close the current tab or a specific tab by index. Cannot close the last tab.

## When to Use

- Testing frontend code in a real browser
- Interacting with pages that require JavaScript
- When user needs to visually see or interact with a page
- Debugging authentication or session issues
- Scraping dynamic content that requires JS execution

* * *

## Efficiency Guide

### DOM Inspection Over Screenshots

**Don't** take screenshots to see page state. **Do** parse the DOM directly:

```
// Get page structure
document.body.innerHTML.slice(0, 5000)

// Find interactive elements
Array.from(document.querySelectorAll('button, input, [role="button"]')).map(e => ({
  id: e.id,
  text: e.textContent.trim(),
  class: e.className
}))
```

### Complex Scripts in Single Calls

Wrap everything in an IIFE to run multi-statement code:

```
(function() {
  // Multiple operations
  const data = document.querySelector('#target').textContent;
  const buttons = document.querySelectorAll('button');

  // Interactions
  buttons[0].click();

  // Return results
  return JSON.stringify({ data, buttonCount: buttons.length });
})()
```

### Batch Interactions

**Don't** make separate calls for each click. **Do** batch them:

```
(function() {
  const actions = ["btn1", "btn2", "btn3"];
  actions.forEach(id => document.getElementById(id).click());
  return "Done";
})()
```

### Typing/Input Sequences

```
(function() {
  const text = "HELLO";
  for (const char of text) {
    document.getElementById("key-" + char).click();
  }
  document.getElementById("submit").click();
  return "Submitted: " + text;
})()
```

### Reading App/Game State

Extract structured state in one call:

```
(function() {
  const state = {
    score: document.querySelector('.score')?.textContent,
    status: document.querySelector('.status')?.className,
    items: Array.from(document.query')).map(el =>SelectorAll('.item ({
      text: el.textContent,
      active: el.classList.contains('active')
    }))
  };
  return JSON.stringify(state, null, 2);
})()
```

### Waiting for Updates

If DOM updates after actions, add a small delay with bash:

```
sleep 0.5 && {baseDir}/browser-tools/browser-eval.js '...'
```

### Investigate Before Interacting

Always start by understanding the page structure:

```
(function() {
  return {
    title: document.title,
    forms: document.forms.length,
    buttons: document.querySelectorAll('button').length,
    inputs: document.querySelectorAll('input').length,
    mainContent: document.body.innerHTML.slice(0, 3000)
  };
})()
```

Then target specific elements based on what you find.

* * *

## Important Notes

### Prerequisites

1. **Chrome Must Be Running**: Before using any tool, Chrome must be running with remote debugging enabled on port 9222. Use `browser-start.js` to start Chrome, or manually start Chrome with:
   ```
   chrome --remote-debugging-port=9222
   ```

2. **Install Dependencies**: Run `npm install` in the browser-tools directory before first use.

3. **Platform Limitation**: `browser-start.js` currently only works on macOS. For Windows/Linux, manually start Chrome with the debugging flag.

### Common Issues

| Issue | Solution |
|-------|----------|
| "No active tab found" | Make sure Chrome is running with `--remote-debugging-port=9222` |
| "Element not found" | Use `browser-pick.js` to interactively select the element |
| "Failed to click" | Element may be hidden or not interactable. Try scrolling to it first |
| "Timeout waiting for element" | Increase timeout with `--timeout=N` option |
| "Cannot close last tab" | Chrome requires at least one tab open |

### Best Practices

1. **Always check page state first** - Use `browser-eval.js` to inspect the page before interacting
2. **Use selectors wisely** - Prefer ID (#id) or unique classes over complex selectors
3. **Handle errors gracefully** - Check console output for error messages
4. **Keep Chrome running** - Don't call `browser-start.js` before every operation
5. **Wait when needed** - Use `browser-wait.js` after actions that trigger DOM changes
