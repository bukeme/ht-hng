# Habit Tracker PWA

A mobile-first Habit Tracker Progressive Web App built with Next.js App Router, React, TypeScript, Tailwind CSS, Zustand, React Hook Form, Vitest, React Testing Library, and Playwright.

## Project Overview

This project is a local-first habit tracker that lets a user:

- sign up with email and password
- log in and log out
- create, edit, and delete habits
- mark a habit complete for today and unmark it
- view the current streak for each habit
- persist app state across reloads
- install the app as a PWA
- load the cached app shell offline after it has been opened once

The application is intentionally deterministic and front-end only. It does not use a remote database or external authentication provider.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Zustand
- React Hook Form
- localStorage
- Vitest
- React Testing Library
- Playwright

## Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Install Playwright browsers

```bash
npx playwright install
```

### 3. Make sure the required files exist

The project expects these PWA files:

- `public/manifest.json`
- `public/sw.js`
- `public/icons/icon-192.png`
- `public/icons/icon-512.png`

## Run Instructions

### Development server

```bash
npm run dev
```

### Production build

```bash
npm run build
```

### Production server

```bash
npm run start
```

For PWA and offline checks, use the production build with `npm run build` and `npm run start`.

## Test Instructions

### Unit tests

```bash
npm run test:unit
```

### Integration tests

```bash
npm run test:integration
```

### End-to-end tests

```bash
npm run test:e2e
```

### Run the full test suite

```bash
npm run test
```

## Local Persistence Structure

The app stores all persistence in `localStorage` using these required keys:

- `habit-tracker-users`
- `habit-tracker-session`
- `habit-tracker-habits`

### `habit-tracker-users`

Stores a JSON array of users.

Each user has this shape:

```ts
{
  id: string;
  email: string;
  password: string;
  createdAt: string;
}
```

### `habit-tracker-session`

Stores either `null` or the current session object:

```ts
{
  userId: string;
  email: string;
}
```

### `habit-tracker-habits`

Stores a JSON array of habits.

Each habit has this shape:

```ts
{
  id: string;
  userId: string;
  name: string;
  description: string;
  frequency: "daily";
  createdAt: string;
  completions: string[];
}
```

### Persistence behavior

- Signup creates a new user and stores a session.
- Login stores the active session.
- Logout clears the session.
- Habits belong to the logged-in user only.
- Habit changes are saved immediately to `localStorage`.
- Reloading the app restores the saved session and habits.

## PWA Support

PWA support is implemented with:

- a `manifest.json` file in `public/`
- app icons at 192px and 512px
- a client-side service worker registration
- a service worker that caches the app shell

### Manifest

The manifest includes:

- app name
- short name
- start URL
- display mode
- background color
- theme color
- icons for 192px and 512px

### Service worker

The service worker:

- registers on the client
- caches the app shell
- serves cached content when offline
- prevents a hard crash when the network is unavailable

### Offline behavior

The app is designed so that after it has loaded once while online, the cached shell can still render offline.

## Trade-offs and Limitations

- Authentication is local only and is not secure for production use.
- Passwords are stored in localStorage because the assignment requires a local-only implementation.
- The service worker caches the app shell, not a full offline data sync layer.
- Offline support is limited to rendering the cached shell and previously cached assets.
- There is no backend API, so data only exists in the browser where it was created.
- Since the app is local-first, clearing site data clears all users, sessions, and habits.

## Test File Map

### Unit Tests

- `tests/unit/slug.test.ts`  
  Verifies `getHabitSlug` formatting, spacing, and character cleanup.

- `tests/unit/validators.test.ts`  
  Verifies habit name validation rules and error messages.

- `tests/unit/streaks.test.ts`  
  Verifies current streak calculation, duplicate handling, and gaps in streaks.

- `tests/unit/habits.test.ts`  
  Verifies toggling a habit completion date without mutating the original object and without duplicates.

### Integration Tests

- `tests/integration/auth-flow.test.tsx`  
  Verifies signup, duplicate signup rejection, login, and invalid login messaging.

- `tests/integration/habit-form.test.tsx`  
  Verifies creating, editing, deleting, and completing habits from the UI.

### End-to-End Tests

- `tests/e2e/app.spec.ts`  
  Verifies splash-screen routing, protected routes, signup, login, habit creation, completion, persistence, logout, and offline shell loading.

## Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test:unit": "vitest run --coverage",
    "test:integration": "vitest run",
    "test:e2e": "playwright test",
    "test": "npm run test:unit && npm run test:integration && npm run test:e2e"
  }
}
```

## Notes

This project follows the technical requirements closely and is structured to be easy to verify with automated tests.
