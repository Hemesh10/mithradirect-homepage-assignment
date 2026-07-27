# Repository Guidelines

## Project Structure & Module Organization

This is a Vite-powered React 19 single-page application.

- `src/App.jsx` assembles the marketing homepage.
- `src/components/` contains substantial UI features, including the API-backed neighbourhood discovery experience.
- `src/api/` owns HTTP requests and normalization of backend data.
- `src/hooks/` contains reusable React state and request lifecycle logic.
- `src/data.js` holds static marketing content.
- `src/styles.css` defines the core visual system; `src/discovery.css` styles the commerce experience.
- Tests are colocated with their source as `*.test.js` or `*.test.jsx`. Shared fixtures and setup live in `src/test/`.
- `dist/` is generated output and must not be edited.

Keep raw API field names inside the adapter. Components should consume normalized application objects.

## Build, Test, and Development Commands

- `npm install` installs dependencies from `package-lock.json`.
- `npm run dev` starts the local Vite development server.
- `npm test` runs all Vitest tests once in jsdom.
- `npm run build` creates the production bundle in `dist/`.
- `npm run preview` serves the production bundle locally for final verification.

Run both `npm test` and `npm run build` before submitting changes.

## Coding Style & Naming Conventions

Use two-space indentation, single quotes, trailing commas, and no semicolons, matching existing files. Prefer small functional React components and native browser APIs over unnecessary dependencies.

- React components: `PascalCase`
- Hooks: `useCamelCase`
- Variables and functions: `camelCase`
- CSS classes: descriptive BEM-style names such as `.preview-drawer__panel`

No formatter or linter is currently configured; preserve the established style manually. Keep accessibility labels, keyboard behavior, reduced-motion support, and 44px touch targets intact.

## Testing Guidelines

Vitest, React Testing Library, `user-event`, and `jest-dom` are configured in `vite.config.js`. Test observable behavior rather than implementation details. Mock network and geolocation APIs; tests must not depend on the live Render endpoint. Cover normalization, request failures, loading and empty states, validation, and keyboard interactions.

## Commit & Pull Request Guidelines

No repository Git history is available to establish a local convention. Use concise Conventional Commit messages, for example `feat: add vendor preview drawer` or `fix: handle missing banner images`.

Pull requests should include a clear summary, test results, linked issue when applicable, and screenshots for visual changes. Call out API contract, CORS, accessibility, or responsive-layout impacts.

## Security & Configuration

Configure the endpoint through `VITE_HOME_API_BASE_URL`; never commit secrets. Production origins must be allowlisted by the API’s CORS policy.
