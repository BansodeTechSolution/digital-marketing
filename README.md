# Small business digital marketing training

A frontend-only React demo for the digital marketing training project. The website currently uses sample content and browser storage only; it does not call an API or connect to SQL Server.

## Run locally

1. Install dependencies with `npm install`.
2. Start the app with `npm run dev`.
3. Open the local URL printed by Vite (usually `http://localhost:5173`).

## Demo behavior

- The Join form saves sample interest entries in this browser's local storage. They appear in the Organiser view alongside the seeded sample rows.
- Demo organiser login: username `organizer`, password `demo-admin-2026`. This frontend-only login is for preview and does not secure real data.
- The Ads page shows sample campaign concepts. They are not live or paid advertisements.
- Theme choice and checklist progress stay in local browser storage. Clearing site data removes the local demo entries and preferences.

Sample registrations and ad concepts are in [`src/data/demoData.js`](src/data/demoData.js).

## Build

Run `npm run build` to create a static production bundle, then `npm run preview` to preview it locally.

The previous Express and SQL Server scaffold remains in `server/` and `database/` for possible later use, but it is not installed or started by this frontend-only demo.
