# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Ionic React dog walking app built with Vite, TypeScript, and Tailwind CSS. The app targets mobile platforms through Capacitor and uses Feature-Sliced Design (FSD) architecture. The app includes a multi-step dog profile onboarding flow, user authentication, and internationalization support.

## Development Commands

**Build & Development:**
```bash
npm run dev          # Start development server
npm run build        # Build for production (runs TypeScript check + Vite build)
npm run preview      # Preview production build
```

**Testing:**
```bash
npm run test.unit    # Run unit tests with Vitest
npm run test.e2e     # Run E2E tests with Cypress
```

**Code Quality:**
```bash
npm run lint         # Run ESLint
```

**API Management:**
```bash
npm run api:generate # Generate API client from OpenAPI spec
npm run api:watch    # Watch for OpenAPI changes and regenerate
npm run api:clean    # Remove generated API files
```

## Architecture

**Feature-Sliced Design (FSD):**
The project follows FSD methodology with these layers:
- `src/shared/` - Shared utilities, components, API client, store, hooks
- `src/entities/` - Business entities (currently empty)
- `src/features/` - Feature-specific logic (currently empty)
- `src/widgets/` - Large UI blocks (layout components)
- `src/pages/` - Route-level pages
- `src/app/` - App initialization and routing

**Key Technologies:**
- **UI Framework:** Ionic React with iOS mode for consistent design
- **State Management:** Zustand with persistence and devtools
- **API:** Auto-generated client using Orval from OpenAPI spec

**Component Priority Rules:**
1. **FIRST: Use existing components from @shared/ui** when they provide the needed functionality
2. **SECOND: Use Ionic components** when shared components don't exist (IonModal, IonButton, IonInput, IonPopover, etc.)
3. **THIRD: Create custom components** only when neither shared nor Ionic components provide the needed functionality
- **ALWAYS use Text component from @shared/ui** for all text elements instead of div, span, p, or h tags with manual styling
- **ALWAYS use native Ionic components** for mobile app development to ensure correct native behavior
- When using Ionic components, overlay custom styling/behavior rather than recreating from scratch
- Examples: Use IonModal with custom content instead of building custom modal, use IonInput with custom wrapper instead of pure HTML input
- **ALL shared UI components MUST be built on top of Ionic components** (Button wraps IonButton, Input wraps IonInput, etc.)
- **Data Fetching:** TanStack React Query
- **Styling:** Tailwind CSS + Ionic CSS variables
- **Internationalization:** i18next with English and Russian translations
- **Mobile:** Capacitor for native functionality

**API Configuration:**
- API Base URL: `https://api.dogappa.local:8443` (both dev and production)
- OpenAPI Spec: `/openapi/v1.json` endpoint
- Auto-generated types and hooks via Orval from OpenAPI specification
- Custom Axios instance with automatic Bearer token authentication
- React Query for data fetching and state management
- 10 second request timeout configured

**Component Generation:**
Use Plop.js for scaffolding:
```bash
npx plop page    # Generate new page
npx plop ui      # Generate UI component in any FSD layer
```

**Store Structure:**
Global app state managed by Zustand includes user authentication, app preferences (language, theme), loading states, and onboarding status. State is persisted to localStorage.

**Mobile Development:**
Capacitor configuration uses `dist/` as web directory. The app is configured as a generic Ionic starter but should be updated with proper app ID and name for production.

## Key Architecture Details

**Onboarding Flow:**
The app features a comprehensive dog profile creation process managed by `useDogProfileStepper.ts` hook:
- 10-step onboarding: Welcome → Dog Name → Gender → Weight → Breed → Birth Date → Health → Character → Comment → Photos → Owner Info
- Each step has validation and error handling
- Progress tracking with visual stepper header
- Data structure defined in `src/features/onboarding/model/types.ts`
- Complex multi-step state management with Zustand integration

**Internationalization System:**
- Uses i18next with English keys and Russian translations
- Configuration in `src/i18n/config.ts` with `changeLanguage()` helper
- All user-facing text wrapped in `t()` calls with English keys
- Complex interpolated text uses `Trans` component
- Translation files: `translation.en.json` and `translation.ru.json`
- Switch languages via `changeLanguage('en')` or `changeLanguage('ru')`

**State Management Architecture:**
- Zustand store (`app.store.ts`) handles global state including:
  - User authentication and profile data
  - App preferences (language, theme)
  - Onboarding status and loading states
- State persisted to localStorage with selective persistence
- DevTools integration enabled for debugging

**Routing Structure:**
- Currently minimal: single `/welcome` route redirecting from root
- Uses Ionic React Router with React Router v5
- Tab-based navigation structure prepared but not fully implemented
- Route definitions in `src/app/routes/AppRoutes.tsx`

**Mobile Navigation Patterns:**
- ✅ **BOTTOM TAB BAR:** Primary navigation using `IonTabs` + `IonTabBar` with `IonTabButton`
- ✅ **STACK PER TAB:** Each tab has its own stack navigation using nested `IonRouterOutlet`
- ✅ **ROUTES ARE ROUTES:** All screens (including modals, drawers, detail pages) are routes in `IonRouterOutlet`
- ✅ **IONIC MANAGES TRANSITIONS:** Ionic automatically handles page transitions and animations via router
- ❌ **NEVER REPLACE TAB:** Don't navigate away from tab structure - maintain navigation context
- ❌ **NEVER DEEP STACK IN TAB:** Keep tab stacks shallow (1-2 levels max)

**CRITICAL: IonModal Usage Rules:**
- 🔴 **IonModal is NOT for route-based screens** - NEVER wrap routes/pages in IonModal
- 🔴 **IonModal is NOT for drawers** - Use IonPage + CSS for bottom sheets/drawers
- 🔴 **IonModal is NOT for navigation** - Use IonRouterOutlet with proper routing
- ✅ **ONLY use IonModal for:**
  - Confirmation dialogs (confirm/cancel actions)
  - Alert messages (one-time notifications)
  - Action sheets (select from options)
  - Temporary UI overlays (color pickers, mini forms)
- ❌ **NEVER use IonModal for:**
  - Entity detail screens (dog profile, walk details, etc.)
  - Any screen accessible via URL/route
  - Deep-linkable content
  - Navigable screens in app flow

**How to Create Modals/Drawers Correctly:**
1. **Bottom Sheet / Drawer:**
   - Create as IonPage route in AppRoutes.tsx
   - Use IonPage + IonContent with custom CSS
   - Style with `height`, `transform`, `border-radius` for drawer effect
   - Router handles transitions automatically

2. **Full-Screen Modal:**
   - Create as IonPage route in AppRoutes.tsx
   - Use presentation="modal" on IonRouterOutlet (iOS-style)
   - Or use standard IonPage with CSS animations
   - Router manages the stack

3. **True Dialog (rare):**
   - Use IonModal ONLY for non-navigable UI
   - Keep state local (not route-based)
   - No deep-linking required

**Navigation Best Practices:**
- All screens are routes managed by IonRouterOutlet
- Use `router.push()` and `router.goBack()` for navigation
- Ionic handles all animations natively
- CSS handles visual presentation (drawer, modal, etc.)
- NEVER mix IonModal with route-based navigation

**Component Generation System:**
Plop.js templates support FSD architecture:
- Page generation: Creates complete page structure with lazy loading
- UI component generation: Supports all FSD layers (shared, features, widgets, etc.)
- Automatic index.ts file management and exports

## Development Guidelines

**Working with Translations:**
- Always use English keys in `t()` calls: `t("Create Account")` not `t("Создать аккаунт")`
- Add new keys to both `translation.en.json` and `translation.ru.json`
- Use `Trans` component for complex text with interpolation: `<Trans i18nKey="Profile is {{percentage}}% complete" values={{percentage: 85}} />`

**Onboarding Flow Modifications:**
- Step modifications require updates to `useDogProfileStepper.ts` validation logic
- New steps need corresponding UI components in `src/features/onboarding/ui/steps/`
- Update total step count in `DogProfileStepper.tsx` and progress calculation
- Data structure changes require updates to `DogProfileData` interface in `types.ts`

**State Management Patterns:**
- Use `useAppStore()` for global app state (auth, preferences)
- Feature-specific state should use local hooks (like `useDogProfileStepper`)
- Persistent data goes through Zustand's `partialize` function in store config

**API Integration with Orval:**

The project uses **Orval** to auto-generate a type-safe API client from OpenAPI specification. This ensures API calls are always in sync with backend contract.

**Orval Configuration (`orval.config.cjs`):**
- **Source:** OpenAPI spec from `https://api.dogappa.local:8443/openapi/v1.json`
- **Output:** `src/shared/api/generated/` - organized by OpenAPI tags (tags-split mode)
- **Client:** React Query (TanStack Query) hooks with full TypeScript support
- **Custom Instance:** Uses `customInstance` from `src/shared/api/client.ts` for all requests
- **Type Suffixes:**
  - Schemas: `Type` (e.g., `UserType`, `DogProfileType`)
  - Responses: `Response`
  - Parameters: `Params`

**Generated Structure:**
```
src/shared/api/generated/
├── types/              # TypeScript types from OpenAPI schemas
│   ├── index.ts
│   └── *Type.ts       # Generated types with "Type" suffix
├── [tag-name]/        # Endpoints grouped by OpenAPI tags
│   └── [tag-name].ts  # React Query hooks and API functions
└── index.ts
```

**Available React Query Hooks:**
For each endpoint, Orval generates:
- `useQuery` hooks for GET requests (e.g., `useGetUsers()`)
- `useMutation` hooks for POST/PUT/PATCH/DELETE (e.g., `usePostUsersCreate()`)
- `useInfiniteQuery` hooks for paginated endpoints
- `useSuspenseQuery` hooks for React Suspense integration
- Query key getters for cache management (e.g., `getGetUsersQueryKey()`)
- Options helpers for custom configuration (e.g., `getGetUsersQueryOptions()`)

**Custom API Instance (`src/shared/api/client.ts`):**
- **Base Axios Instance:** Configured with base URL and 10s timeout
- **Authentication:** Automatic Bearer token injection from cookies (`auth_token`)
- **Request Interceptor:** Adds `Authorization` header to all requests
- **Error Handling:** Centralized error handling and response transformation
- **Usage:** All generated hooks use this instance automatically

**API Development Commands:**
```bash
npm run api:generate    # Generate client from OpenAPI spec (with NODE_TLS_REJECT_UNAUTHORIZED=0)
npm run api:watch       # Watch for OpenAPI changes and auto-regenerate
npm run api:clean       # Remove all generated files (use before fresh generation)
```

**CRITICAL RULES - API Client Usage:**

🔴 **NEVER EDIT GENERATED FILES:**
- All files in `src/shared/api/generated/` are auto-generated by Orval
- Manual changes will be overwritten on next generation
- Generated files include comment: `* Generated by orval v7.9.0 🍺 * Do not edit manually.`

🔴 **ALWAYS USE GENERATED HOOKS:**
- ✅ **CORRECT:** Use generated React Query hooks (`useGetUsers()`, `usePostUsersCreate()`)
- ❌ **WRONG:** Direct Axios calls or manual fetch
- ✅ **CORRECT:** Import types from `src/shared/api/generated/types`
- ❌ **WRONG:** Manual type definitions for API data

🔴 **BACKEND-FIRST API CHANGES:**
- API contract changes must be made in backend OpenAPI spec first
- Run `npm run api:generate` to sync frontend types
- Never create manual API wrappers or duplicate types

🔴 **CUSTOM AXIOS CONFIGURATION:**
- All Axios customizations go in `src/shared/api/client.ts`
- Auth token handling, base URL, timeouts configured there
- Custom interceptors and error handling in `customInstance`

**Example Usage:**
```typescript
import { useGetUsers, usePostUsersCreate } from '@/shared/api/generated/users/users';
import type { UserType, CreateUserCommandType } from '@/shared/api/generated/types';

// Query example
const { data, isLoading, error } = useGetUsers();

// Mutation example
const { mutate: createUser } = usePostUsersCreate();
createUser({
  data: { name: 'John', email: 'john@example.com' }
});
```

**OpenAPI Spec Sync:**
- Development: OpenAPI spec served at `https://api.dogappa.local:8443/openapi/v1.json`
- Use `api:watch` during active backend development for auto-sync
- Regenerate client after pulling backend changes that modify API

**Ionic React Considerations:**
- App uses iOS mode for consistent design across platforms
- Ionic components preferred over basic HTML elements for mobile optimization
- Navigation uses Ionic Router with React Router v5 (not v6)
- Capacitor plugins available for native functionality (camera, geolocation, etc.)

**Capacitor Native Features:**
- **Available Plugins:** Camera, Geolocation, Haptics, Keyboard, StatusBar, PushNotifications, App
- **Usage Pattern:** Always import from `@capacitor/[plugin-name]` and check platform before using
- **Error Handling:** Wrap Capacitor calls in try/catch blocks for web fallbacks
- **Example Usage:** 
  ```typescript
  import { Camera, CameraResultType } from '@capacitor/camera';
  import { Capacitor } from '@capacitor/core';
  
  if (Capacitor.isNativePlatform()) {
    const image = await Camera.getPhoto({ resultType: CameraResultType.Uri });
  }
  ```

## Critical Best Practices & Anti-Patterns

**IONIC PAGE STRUCTURE - MANDATORY REQUIREMENTS:**
- ✅ **ALWAYS WRAP PAGES IN:** `<IonPage><IonContent>...content...</IonContent></IonPage>`
- ❌ **NEVER USE:** `<IonPage><div>...content...</div></IonPage>` (missing IonContent)
- ✅ **REQUIRED STRUCTURE:** Every page must have `IonContent` for proper transitions and scrolling
- ✅ **LAYOUT CONTAINERS:** Use `IonGrid`, `IonRow`, `IonCol` instead of `div` grids when possible
- ✅ **LIST CONTAINERS:** Use `IonList`, `IonItem` instead of `ul`, `li` for mobile optimization
- ✅ **CARD CONTAINERS:** Use `IonCard`, `IonCardHeader`, `IonCardContent` instead of generic divs
- ✅ **HEADER/FOOTER:** Use `IonHeader`, `IonToolbar`, `IonFooter` for native-like behavior

**NAVIGATION - USE PROPER IONIC ROUTER:**
- ✅ **CORRECT:** `const router = useIonRouter(); router.push('/path', 'forward', 'push');`
- ✅ **CORRECT:** `router.goBack();` for back navigation
- ❌ **WRONG:** `const history = useHistory(); history.goBack();` (use useIonRouter instead)
- ❌ **WRONG:** `window.history.back()` or `window.location.href`
- ✅ **TRANSITIONS:** Always specify direction: `router.push(path, 'forward'|'back', 'push'|'replace')`

**IONIC COMPONENT HIERARCHY - REPLACE HTML WITH IONIC:**
- ✅ **BUTTONS:** Use `IonButton` instead of `<button>` for native styling and haptics
- ✅ **INPUTS:** Use `IonInput`, `IonTextarea` instead of `<input>`, `<textarea>`
  - Use `type="tel"` for phone/code inputs (opens numeric keyboard)
  - Use `type="email"` for email inputs (opens email keyboard)
- ✅ **IMAGES:** Use `IonImg` instead of `<img>` for lazy loading and better performance
- ✅ **ICONS:** Use `IonIcon` from `ionicons/icons` - NEVER use emoji (🐕, 🛡️, etc.)
- ✅ **PROGRESS:** Use `IonProgressBar` instead of custom SVG progress indicators
- ✅ **CONTAINERS:** Use `IonCard`, `IonItem`, `IonGrid` instead of generic `<div>` where needed for native behavior
- ✅ **LISTS:** Use `IonList`, `IonItem`, `IonLabel` instead of `<ul>`, `<li>`
- ✅ **MODALS:** Use `IonModal`, `IonPopover` instead of custom overlay solutions
- ✅ **LOADING:** Use `IonLoading`, `IonSpinner` instead of custom loading indicators
- ✅ **TABS:** Use `IonTabs`, `IonTabBar`, `IonTabButton` for tab navigation
- ⚠️ **DIV USAGE:** Simple layout divs are acceptable when they don't interfere with native behavior (keyboard, scrolling, touch)
- ❌ **NEVER USE:** HTML `<button>`, `<input>`, `<textarea>`, `<select>`, `<img>` directly
- ❌ **NEVER USE:** Emoji icons - always use IonIcon with proper ionicons
- ❌ **NEVER USE:** Custom SVG for standard UI elements (progress bars, icons) - use Ionic components

**MANDATORY IONIC INTEGRATION RULES:**
- 🔴 **ALWAYS USE:** Capacitor Keyboard plugin with `KeyboardResize.Ionic` for keyboard handling
- 🔴 **NEVER OVERRIDE:** Ionic's native keyboard behavior with custom CSS or JS
- 🔴 **ALWAYS PLACE:** Navigation buttons INSIDE IonContent, never as fixed overlays
- 🔴 **ALWAYS USE:** Ionic's built-in viewport and safe area handling
- 🔴 **FORCE IONIC:** When using third-party components (Swiper, etc), add CSS to force Ionic mechanisms:
  ```css
  /* Force stable heights to prevent conflicts */
  .third-party-component {
    height: 100% !important;
    min-height: 100% !important;
  }
  /* Ensure Ionic keyboard handling takes precedence */
  ion-content.keyboard-open .third-party-component {
    height: 100% !important;
  }
  ```
- 🔴 **KEYBOARD RESTORATION:** Always use multiple setTimeout attempts to restore viewport after keyboard hide
- 🔴 **SWIPER INTEGRATION:** When using Swiper with Ionic, force height restoration and call `updateSize()` on keyboard events

**IONIC COMPONENT NESTING CONFLICTS - CRITICAL:**
- ❌ **NEVER NEST:** `IonPage` inside another `IonPage` (only one per route/screen)
- ❌ **NEVER NEST:** `IonContent` inside another `IonContent` (causes scroll conflicts)
- ✅ **RULE:** Only the top-level page component should have `IonPage` + `IonContent`
- ✅ **RULE:** Child components should return plain divs or Ionic components (no IonPage/IonContent)
- ✅ **RULE:** Feature components (like steppers, forms) should NOT include IonPage/IonContent
- ❌ **WRONG:** Page → Component → IonPage (nested IonPage)
- ❌ **WRONG:** Page (IonPage + IonContent) → Feature (IonPage + IonContent) - double nesting!
- ✅ **CORRECT:** Page (IonPage + IonContent) → Feature Component (Fragment or div)
- ✅ **CORRECT:** Page (IonPage + IonContent) → Stepper/Form/Modal (plain React elements)

**CODE QUALITY RULES:**
- ❌ **NEVER USE:** `console.log()` in production code (remove all debug statements)
- ❌ **NEVER USE:** `any` types (always specify proper TypeScript types)
- ❌ **NEVER USE:** Direct DOM manipulation (use React refs and proper patterns)
- ❌ **NEVER USE:** `!important` in CSS/Tailwind (breaks maintainability and specificity)
- ❌ **NEVER USE:** `<h1>`, `<h2>`, `<p>`, `<span>` tags - ALWAYS use `Text` component from @shared/ui
- ❌ **NEVER USE:** `<img>` - ALWAYS use `IonImg` for better mobile performance
- ❌ **NEVER USE:** `div` with `onClick` for interactive elements - ALWAYS use Button component
- ❌ **NEVER USE:** Emoji for icons - ALWAYS use IonIcon from ionicons library
- ❌ **NEVER USE:** Custom SVG for standard UI (progress, icons) - use Ionic components
- ✅ **ALWAYS USE:** Text component for all text elements with proper variant and tag prop
- ✅ **ALWAYS USE:** Button component for all clickable elements (even icon-only buttons)
- ✅ **ALWAYS USE:** IonImg for all images (lazy loading, mobile optimized)
- ✅ **ALWAYS USE:** IonIcon for all icons (from ionicons library)
- ✅ **ALWAYS USE:** IonProgressBar for progress indicators
- ✅ **ALWAYS USE:** Proper React hooks and patterns
- ✅ **ALWAYS USE:** Proper error handling (try/catch, error boundaries)
- ✅ **ALWAYS USE:** Semantic HTML and accessibility best practices
- ✅ **CSS PRIORITY:** Use proper CSS specificity and Tailwind utilities instead of `!important`

**MOBILE-SPECIFIC BEST PRACTICES:**
- ✅ **INPUT TYPES:** Use correct `type` attribute for proper keyboard on mobile
  - `type="tel"` for phone numbers and numeric codes (opens numeric keyboard)
  - `type="email"` for email addresses (opens email keyboard with @ symbol)
  - `type="number"` for numeric inputs
- ✅ **TOUCH OPTIMIZATION:** Use `touchAction: "manipulation"` to prevent double-tap zoom
- ✅ **SCROLL INTO VIEW:** Auto-scroll inputs into view on focus for better UX (already in Input component)
- ✅ **SAFE AREAS:** Always respect safe areas on devices with notches/home indicators
- ✅ **LAYOUT SIMPLICITY:** Keep component nesting minimal - avoid unnecessary wrapper divs
- ✅ **PERFORMANCE:** Use IonImg for lazy loading, IonVirtualScroll for long lists

**TYPESCRIPT RULES:**
- Define proper interfaces instead of `any`
- Use union types for restricted values
- Proper error handling with typed errors
- No implicit any, enable strict mode compliance

## Code Adaptation Workflow

**WHEN ADAPTING EXTERNAL CODE:**
When user provides original code to adapt, follow this strict process:

0. **CHECK FIRST - CRITICAL:**
   - 🔴 **ALWAYS CHECK:** If this functionality already exists in the project
   - 🔴 **SEARCH BEFORE CODING:** Look for similar components/features already implemented
   - 🔴 **READ EXISTING CODE:** Check if component can be reused or extended
   - ❌ **NEVER DUPLICATE:** Don't create new code if similar already exists
   - ✅ **EXTEND, DON'T RECREATE:** Modify existing components instead of creating new ones

1. **ANALYZE STYLES CAREFULLY:**
   - ✅ Study ALL spacing (paddings, margins, gaps)
   - ✅ Note exact font sizes, line heights, weights
   - ✅ Record border radius, shadows, opacity values
   - ✅ Capture color values and their usage
   - ✅ Document responsive breakpoints and behavior
   - ✅ Identify animation/transition properties

2. **USE PROJECT STANDARDS:**
   - ✅ Replace with `@shared/ui` components (Text, Button, Input, etc.)
   - ✅ Use Tailwind CSS variables for colors (text-primary, bg-secondary, etc.)
   - ✅ Use Tailwind spacing utilities matching original values (p-4, gap-6, etc.)
   - ✅ Use project's font size system (text-sm, text-base, text-lg, etc.)
   - ✅ Replace HTML tags with Ionic components (IonImg, IonIcon, etc.)
   - ✅ Use i18n with `t()` for all text
   - ✅ Apply FSD architecture (proper layer placement)

3. **WRITE CLEAN, SIMPLE CODE:**
   - ✅ Write SIMPLIFIED code that matches visual result
   - ✅ Remove unnecessary wrappers and complexity
   - ✅ Use clean, minimal structure
   - ❌ **NEVER USE WORKAROUNDS (костыли)** - write proper solutions
   - ❌ **NEVER DUPLICATE CODE** - reuse existing components/functions
   - ❌ **NEVER OVER-ENGINEER** - keep it simple and maintainable
   - ✅ Use proper React patterns (hooks, composition)
   - ✅ Keep component hierarchy flat when possible

4. **PRESERVE ORIGINAL DESIGN:**
   - ✅ Maintain EXACT spacing proportions from original
   - ✅ Keep same visual hierarchy and layout structure
   - ✅ Preserve responsive behavior patterns
   - ✅ Match animation timing and easing
   - ❌ NEVER change spacing arbitrarily
   - ❌ NEVER simplify visual result (but DO simplify code)

5. **MANDATORY ADAPTATIONS:**
   - Replace all text tags (h1, p, span) with `Text` component
   - Replace buttons with `Button` from @shared/ui
   - Replace inputs with `Input` from @shared/ui
   - Replace images with `IonImg`
   - Replace icons with `IonIcon` (never emoji)
   - Use Tailwind classes instead of inline styles
   - Add proper TypeScript types
   - Add i18n keys for all text

**EXAMPLE ADAPTATION:**
Original:
```jsx
<div style={{padding: '24px', gap: '16px'}}>
  <h2 style={{fontSize: '24px', fontWeight: 'bold'}}>Title</h2>
  <button style={{padding: '12px 24px'}}>Click</button>
</div>
```

Adapted:
```tsx
<div className="p-6 flex flex-col gap-4">
  <Text variant="h2" className="text-2xl font-bold">{t("Title")}</Text>
  <Button className="px-6 py-3">{t("Click")}</Button>
</div>
```