# Todo Card

A minimal, dark-themed todo card UI built with vanilla HTML, CSS, and JavaScript. No frameworks, no dependencies — just three files.

## Preview

A single task card with priority badge, status indicator, due date countdown, category tags, and inline editing.

## Features

- **Priority badge** — High / Med / Low with color coding
- **Status indicator** — In Progress, To Do, Blocked, Done with animated pip
- **Inline editing** — Edit title and description in place; save with the check button
- **Complete toggle** — Checkbox with a pulse animation on completion
- **Delete** — Removes the card and shows a confirmation message
- **Live countdown** — Time remaining updates every 30 seconds; turns red when overdue
- **Category tags** — Pill-style labels from the task's categories array
- **Overdue styling** — Card border and time label turn red past the due date

## Usage

Open `todo-card.html` directly in a browser — no build step required.

To change the task data, edit the `TASK` object at the top of `todo-card.js`:

```js
const TASK = {
  title: 'Your task title',
  description: 'Task description...',
  priority: 'high',        // 'high' | 'medium' | 'low'
  status: 'in-progress',  // 'in-progress' | 'todo' | 'blocked' | 'done'
  dueDate: new Date('2026-05-01'),
  categories: ['design', 'mobile'],
};
```

## File Structure

```
todo-card.html   — markup and font imports
todo-card.css    — all styles and animations
todo-card.js     — state, rendering, and event handling
```

## Fonts

- [Syne](https://fonts.google.com/specimen/Syne) — headings and UI labels
- [DM Mono](https://fonts.google.com/specimen/DM+Mono) — monospace text, badges, dates
