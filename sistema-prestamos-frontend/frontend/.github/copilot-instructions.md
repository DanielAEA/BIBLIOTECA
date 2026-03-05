
# Copilot Instructions for `sistema-prestamos-frontend`

This project is a role-based library management frontend built with Angular 20+ and TypeScript. It uses standalone components, Angular signals, and modern Angular patterns. Follow these guidelines to maximize productivity and maintain project conventions.

## Architecture Overview

- **Entry Point:** `src/main.ts` bootstraps the app with `App` and `appConfig`.
- **Routing:**
  - All routes are defined in `src/app/app.routes.ts`.
  - Role-based access is enforced using `authGuard` and `roleGuard` (see `guards/`).
  - Each dashboard (`admin`, `bibliotecario`, `cliente`) has its own component under `dashboard/`.
- **Authentication:**
  - Auth logic is in `auth/` and `services/auth.service.ts` (note: there are two `auth.service.ts` files; use the one in `auth/` for new features).
  - JWT tokens are stored in `localStorage` and attached to requests via `auth.interceptor.ts` or `jwt-interceptor.ts`.
- **State Management:**
  - Use Angular signals for local state in components.
  - Use RxJS `BehaviorSubject` for user state in services.
- **UI Structure:**
  - Components are organized by feature (e.g., `dashboard/admin-dashboard/users/`).
  - Use SCSS for styles; global styles in `src/styles.scss`.

## Developer Workflows

- **Start Dev Server:** `npm start` or `ng serve` (default port: 4200)
- **Build:** `npm run build` or `ng build` (output: `dist/`)
- **Unit Tests:** `npm test` or `ng test` (Karma + Jasmine)
- **Debug:** Use VS Code launch config "ng serve" or "ng test" (see `.vscode/launch.json`)
- **Scaffolding:** Use Angular CLI (`ng generate component <name>`) for new components; style defaults to SCSS.

## Project-Specific Conventions

- **Standalone Components:** All components are standalone; do not use NgModules.
- **State:** Prefer signals for state in components; use RxJS only in services.
- **Guards:** Use `inject()` for service access in guards; do not use constructor injection.
- **Forms:** Use Reactive Forms (`FormBuilder`, `FormGroup`), not template-driven forms.
- **HTTP:** Always use the provided `AuthService` for authentication and token management.
- **Role Checks:** Use `roleGuard` or `RoleGuard` for route protection; roles are `ADMIN`, `BIBLIOTECARIO`, `CLIENTE`.
- **Routing:** Use `provideRouter` and `provideHttpClient` in `app.config.ts`.
- **Component Patterns:**
  - Use `input()`/`output()` functions, not decorators.
  - Use `computed()` for derived state.
  - Use inline templates for small components; otherwise, use external HTML/SCSS.
- **No NgClass/NgStyle:** Use `[class]` and `[style]` bindings instead.
- **No HostBinding/HostListener:** Use the `host` object in decorators.

## Integration & External Dependencies

- **Backend API:** Assumes backend at `http://localhost:8080` (see `auth.service.ts` and `user.service.ts`).
- **No E2E by default:** End-to-end tests are not set up; add your own framework if needed.
- **Prettier:** HTML uses Angular parser; see `package.json` for config.

## Key Files & Directories

- `src/app/app.routes.ts` – Route definitions and guards
- `src/app/auth/` – Auth logic, guards, interceptors
- `src/app/dashboard/` – Feature dashboards by role
- `src/app/services/` – Shared services (user, auth)
- `.vscode/` – Editor tasks, launch configs
- `angular.json` – Build and serve config

---
If a pattern or workflow is unclear, check `README.md` or existing code for examples. When in doubt, follow the structure and conventions of the most recent files in each directory.
