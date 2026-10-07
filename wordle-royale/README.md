# Wordle Royale

Responsive account access for Wordle Royale, built with Next.js and Firebase Authentication from the supplied sprint plan.

## Get started

1. Run `npm install` inside this directory.
2. Copy `.env.example` to `.env.local` and fill in your Firebase web app configuration.
3. Enable Email/Password in Firebase Authentication.
4. Run `npm run dev` and open http://localhost:3000.

On Windows PowerShell, use `npm.cmd` if script execution is restricted.

Login, signup, password reset, persistent sessions, logout, and the protected `/play` account page are implemented. Multiplayer gameplay is a future feature.

See [authentication setup and testing](docs/authentication.md) for Firebase configuration, route behavior, security boundaries, and emulator-based browser tests.

## Checks

```sh
npm run lint
npm run build
npm run test:e2e
```

Browser tests use installed Chrome and Edge, include a mobile viewport, and run against a disposable local Firebase Authentication emulator. They do not create live accounts.
