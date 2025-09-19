# Folders

A small Angular 20 app that explores a feature-first structure, a token-based design system, and a tree selector with keyboard and screen reader support.

Project start time: 19 Sep 2025 14:37  
Project end time: 19 Sep 2025 17:37


Note : I took 3 days to understand how angular works and how to structure a project. I'm not a main angular developer, but I learned a lot.

---

## Table of contents
- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Available scripts](#available-scripts)
- [Project structure](#project-structure)
- [Design system](#design-system)
- [Item selector](#item-selector)
- [Accessibility](#accessibility)
- [Skeleton loaders](#skeleton-loaders)
- [Testing](#testing)
- [Roadmap](#roadmap)

---

## Features
- Standalone Angular components with a feature-first layout
- Design system with CSS variables and utilities
- Inter font with full weight range
- Item tree selector with collapse, cascade selection, and indeterminate states
- Folders first then items, both sorted alphabetically at every level
- Loading and error states
- Unit tests for the homepage and selector

---

## Tech stack
- Node: v22.18.0  
- Angular: 20.3.0  
- TypeScript: 5.9.2

`.nvmrc` is included. If you use nvm:

```bash
nvm use
```


## Getting started

Install dependencies:

```bash
npm install
```

Start the dev server:
```bash
npm start
```

Open `http://localhost:4200` in your browser.

The app runs at http://localhost:4200


## Project structure
```vbnet
src/
├─ assets/
│  └─ styles/                 # global css, design tokens, utilities
├─ app/
│  ├─ core/
│  │  ├─ http/
│  │  │  └─ response.service.ts
│  │  └─ guards|services ...
│  ├─ shared/
│  │  └─ components/
│  │     └─ item-selector/
│  │        ├─ item-selector.component.ts
│  │        ├─ item-selector.component.html
│  │        └─ item-selector.component.css
│  └─ features/
│     └─ homepage/
│        ├─ homepage.page.ts
│        ├─ homepage.page.html
│        └─ homepage.page.css
└─ index.html

```


## Design system

Tokens live in src/assets/styles/design-system.css.

```css
:root {
  --color-surface: hsl(0 0% 100%);
  --color-surface-hover: hsl(0 0% 96%);
  --color-text-on-surface: hsl(195 3% 24%);
  --color-border: hsl(210 0% 89%);
  --color-primary-600: hsl(213 97% 53%);
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --radius-base: 3px;
}

```

## Fonts
Inter is loaded with the full optical and weight range:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');

html, body {
  font-family: "Inter", sans-serif;
  font-optical-sizing: auto;
  font-weight: 400;
}
```

Optional utilities:

```css
.inter-100  { font-weight: 100; }
.inter-200  { font-weight: 200; }
/* ... */
.inter-900  { font-weight: 900; }
.inter-400i { font-weight: 400; font-style: italic; }
```


## Accessibility
The selector follows ARIA tree semantics:

- role="tree" at the root, role="group" for nested <ul>
- role="treeitem" on rows with aria-level and aria-expanded
- Checkbox labels are bound with <label for>
- Chevron button announces Expand or Collapse with aria-label
- Keyboard support: ArrowRight, ArrowLeft, Enter, Space
- Loading containers set aria-busy="true"


## Skeleton loaders

A lightweight CSS skeleton is included to show loading states.

CDN in index.html:
`<link rel="stylesheet" href="https://unpkg.com/css-skeletons@1.0.7/dist/css-skeletons.min.css" />`

## Testing
Unit tests use Jasmine and Karma.

```bash
npm test
```

## Roadmap
- [+] Add .npmrc with registry and settings
- [ ] Add detailed instructions for running the app in different environments
- [ ] Add detailed instructions for running tests in CI and headless mode
- [+] Add docs for skeleton loader
- [+] Add accessibility features