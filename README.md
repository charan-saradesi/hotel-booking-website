# Lumihaven

A modern hotel booking web app for browsing and reserving stays across Indian cities — clean card-based listings, city/region search, and role-based dashboards for guests, hotel owners, and admins.

**Live demo:** [https://lumihaven.vercel.app](https://lumihaven.vercel.app) <!-- ⚠️ replace with your actual Vercel deployment URL -->

---

## About the Project

Lumihaven is a full-stack hotel booking platform built as a React + Supabase application. Guests can browse hotels by Indian city, search by destination/dates/guests, view hotel details, and manage their bookings. Hotel owners get a dashboard to manage their property, availability, and incoming bookings, while admins can manage hotels, cities, and users platform-wide.

**Core features:**
- Home page with a "Browse by Indian Cities" section (cards linking to city-filtered search)
- Search bar with destination, check-in/check-out dates, and guest count
- Hotel listing cards with images, ratings, amenities, and pricing
- Hotel detail pages with availability-based booking
- Authentication via Clerk, with role-based post-login redirects (user / hotel_owner / admin)
- User dashboard — "My Bookings"
- Hotel owner dashboard — Property, Availability, and Bookings tabs
- Admin dashboard — Hotels, Cities, and Users tabs
- Supabase Postgres backend with Row Level Security (RLS)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| Routing | react-router-dom |
| Styling | Tailwind CSS v3 (custom HSL design tokens, shadcn-style conventions) |
| Auth | Clerk |
| Database & Storage | Supabase (Postgres, Storage, Row Level Security) |
| Deployment | Vercel |

### Database Schema (Supabase)

- `hotels`
- `profiles`
- `bookings`
- `availability`
- `cities`

## Setup Process

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/lumihaven.git
cd lumihaven
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run the schema migrations to create the `hotels`, `profiles`, `bookings`, `availability`, and `cities` tables.
3. Enable Row Level Security (RLS) policies on each table (start permissive for MVP, then tighten via a Clerk JWT bridge).
4. Copy your Project URL and anon/public API key.

### 4. Set up Clerk

1. Create an application at [clerk.com](https://clerk.com).
2. Copy your publishable key.

### 5. Configure environment variables

Create a `.env` file in the project root:

```bash
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
```

> All Vite env vars **must** be prefixed with `VITE_` to be exposed to the client at build time.

### 6. Run locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 7. Build for production

```bash
npm run build
```

### 8. Deploy to Vercel

1. Push your repo to GitHub and import it into [Vercel](https://vercel.com).
2. Add the three `VITE_*` environment variables in **Project Settings → Environment Variables**.
3. Trigger a redeploy after adding/changing env vars — saving them alone does not update an existing build.
4. If your deployment prompts for a Vercel login, go to **Project Settings → Deployment Protection** and disable it to make the site publicly accessible.

---

## Notes

- This is currently a demo/personal project with no live payment processing. If real transactions are added later, review Vercel's plan terms (Hobby plan is fine for public, non-commercial use).
- Prices are stored in cents and formatted for display (USD, with an INR display swap noted as a possible follow-up).
