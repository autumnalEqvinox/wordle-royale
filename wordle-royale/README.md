# Wordle Royale

Responsive account access for Wordle Royale, built with Next.js and Firebase Authentication from the supplied sprint plan.

## Get started

1. Run `npm install` inside this directory.
2. Copy `.env.example` to `.env.local` and fill in your Firebase web app configuration.
3. Enable Email/Password and Google in Firebase Authentication. For Google, select a project support email and save.
4. Run `npm run dev` and open http://localhost:3000.

On Windows PowerShell, use `npm.cmd` if script execution is restricted.

Email/password and Google login/signup, password reset, persistent sessions, logout, and the protected `/play` account page are implemented. Multiplayer gameplay is a future feature.

See [authentication setup and testing](docs/authentication.md) for Firebase configuration, route behavior, security boundaries, and emulator-based browser tests.

## Firebase Hosting deployment

The app exports static files to `out/` when you run `npm run build`. Firebase Hosting serves that folder with clean URLs, so `/login`, `/signup`, `/forgot-password`, and `/play` work on direct visits and refreshes. Firebase Authentication still runs in the browser. Server routes/actions and server-rendered gameplay would need a separate backend or a different hosting setup.

The workflows in the repository's `.github/workflows/` directory install and build from `wordle-royale/`. Same-repository pull requests create preview deployments; commits pushed or merged into `main` deploy to the live site. Check GitHub Actions for the result before refreshing https://wordle-royale-11400.web.app/.

The workflows include this project's public Firebase web configuration so CI does not depend on your ignored `.env.local`. The repository must have the Actions secret `FIREBASE_SERVICE_ACCOUNT_WORDLE_ROYALE_11400` created by Firebase initialization. Keep that service-account credential private; it is different from the public web configuration. Check **Settings → Secrets and variables → Actions** if deployment reports a missing credential. Never commit `.env.local` or a service-account key.

In Firebase Authentication, enable Email/Password and Google, and authorize `wordle-royale-11400.web.app` (plus any custom domains). Google sign-in on a preview URL also requires that preview hostname to be authorized.

For a manual deployment, run `npm run build` and then `firebase deploy --only hosting --project wordle-royale-11400` from this directory. `npm run dev` is still the local development command; `next start` is not used for static exports.

## Checks

```sh
npm run lint
npm run build
npm run test:e2e
```

Browser tests use installed Chrome and Edge, include a mobile viewport, and run against a disposable local Firebase Authentication emulator. They do not create live accounts.
