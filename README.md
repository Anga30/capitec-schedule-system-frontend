# Branch Appointment Booking — Frontend

Next.js customer booking flow. The backend and full Docker Compose setup are in `../capitec-schedule-system-backend`.

For local development, start PostgreSQL and Mailpit with `docker compose up -d db mailpit` from the backend directory, then start the backend API and worker in their own terminals. From this directory, run `npm install` once and `npm run dev`. Open <http://localhost:3000>.

Next.js reads the API base URL from `.env.local` (copy `.env.example` there once). The backend API defaults to <http://localhost:4000>. To run every service in containers instead, use `docker compose up --build` from the backend directory.

## Checks

- `npm run lint` runs ESLint with the Next.js Core Web Vitals and TypeScript rules.
- `npm test` runs Jest and React Testing Library tests.
- `npm run test:watch` reruns Jest tests as files change.

## Source layout

```text
src/
  app/                           # Next.js routes, root layout and global styles
  components/ui/                 # Shared presentation components
  features/
    booking/                     # Booking page, flow components, hook, types and API
    branches/                    # Branch types and API access
    slots/                       # Slot types and API access
  lib/api/                       # Shared HTTP client
  lib/config/                    # Shared application configuration
```

Pages compose feature components. Feature services call the shared API client; hooks coordinate client-side feature state. Feature-specific types stay with their feature.
