# 🎓 CampusLink — Next-Gen College Event Microsite & Link-in-Bio Platform

<p align="center">
  <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200" alt="CampusLink Banner" style="border-radius: 16px; width: 100%; max-height: 400px; object-fit: cover;" />
</p>

<p align="center">
  <strong>One link. Instant QR codes. Dynamic themes. Everything your college fest, hackathon, or student committee needs.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-Auth_%26_Postgres-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Vercel-Production_Ready-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</p>

---

## 🌟 Overview

**CampusLink** is a production-grade, art-directed event microsite builder designed specifically for college clubs, student chapters, cultural festivals, and technical committees. 

Traditional social bios or plain Google Forms lose attendee engagement. CampusLink empowers organizers to launch high-converting, mobile-first event microsites equipped with live schedule timelines, downloadable rulebooks, dynamic countdowns, customizable themes, and hyper-scannable QR codes — in under 2 minutes.

---

## ✨ Key Features

### ⚡ 4-Step Event Builder
- **Step 1: Event Essentials**: Event title, tagline, description, custom slug, banner/poster image upload with automatic client-side compression.
- **Step 2: Logistics & Schedule**: Start and end timestamps, venue, campus map links, and structured agenda items.
- **Step 3: Registration & Links**: Primary CTA button (e.g., Unstop, Devfolio, Google Forms), custom links with categorized icons (WhatsApp, Rulebook, Drive, Discord, Instagram).
- **Step 4: Design & Aesthetics**: Real-time live interactive phone mockup preview that syncs keystroke-by-keystroke.

### 🎨 Visual Theme Engine & Custom Theme Builder
- **9 Curated High-Contrast Presets**:
  - *Midnight* — Sleek deep-slate with electric indigo glows.
  - *Aurora* — Mystical emerald & cyan gradients.
  - *Cyber* — Neo-Tokyo retro-future green with dark terminal cards.
  - *Editorial* — Warm champagne & charcoal typography-first aesthetic.
  - *Festive* — Vibrant Indian cultural festival warmth (marigold & crimson).
  - *Minimal* — Clean Scandinavian monochromatic simplicity.
  - *Neo-Brutalist Pop* — High-energy yellow with bold borders and hard shadows.
  - *Crimson Maroon* — Academic prestige and deep wine luxury.
  - *Scarlet Rose* — Dramatic high-impact red with sleek dark carding.
- **Custom Theme Creator**: Build your own theme template! Custom background colors, card styles (glassmorphism, flat, bordered, brutalist), accent highlights, font pairings (sans, display, serif, mono), and corner radiuses. Fully synced with Supabase.

### 📱 Shortened Clean URLs & Instant QR Code Generator
- **Clean Short Route**: Direct access via `/e/:eventSlug` and `/@:committeeHandle/:eventSlug`.
- **Zero-Latency QR Code**: Generates clean, low-density QR codes that scan instantly across iOS and Android camera apps without delays.
- **Offline Resilient**: Encodes an ultra-compact, URL-safe Base64 payload as a seamless fallback, ensuring the event microsite renders instantly even before backend fetch completes.

### 🔐 Supabase Authentication & Multi-Tenant Isolation
- **Authentication**: Email/password authentication and Google OAuth 2.0 one-tap sign-in.
- **Workspace Scoping**: Committee data and draft events are securely isolated per user account.
- **Cross-Device Cloud Sync**: Database triggers, updated schemas, and Row Level Security (RLS) keep your dashboard and live microsite synchronized.

### 📊 Real-Time Analytics
- Track unique page views, outbound link clicks, registration CTA conversions, and top-performing links directly from the Organizer Dashboard.

---

## 🛠️ Technology Stack

| Domain | Tools / Libraries |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript |
| **Bundler & Build Tool** | Vite 8.2 (optimally chunked with Rollup/Rolldown) |
| **Styling & Design System** | Tailwind CSS v4, Vanilla CSS Design Tokens, CSS Glassmorphism |
| **Database & Auth** | Supabase (PostgreSQL with RLS, GoTrue Auth) |
| **Interactive Components** | Lucide React, Canvas Confetti, QR Code Engine, Radix UI Primitives |
| **Animations** | GSAP 3D Landing Canvas, Framer Motion |
| **Deployment & Hosting** | Vercel (Single Page App routing via `vercel.json`) |

---

## 📂 Project Structure

```
campuslink/
├── public/                     # Favicon, robots, and static branding assets
├── src/
│   ├── components/
│   │   ├── common/             # CommandPalette, CustomThemeModal, QrModal, ShareModal, Modal
│   │   ├── phone/              # Interactive Real-Time Mobile Phone Mockup
│   │   └── ui/                 # 3D Cinematic Hero & Neural Access Login
│   ├── context/                # CampusLinkContext (State engine, auth, real-time sync)
│   ├── data/                   # Initial analytics schema & empty default datasets
│   ├── lib/                    # Supabase client singleton & auth methods
│   ├── pages/
│   │   ├── AuthPage.tsx        # Login & Signup experience
│   │   ├── LandingPage.tsx     # 3D GSAP interactive cinematic landing page
│   │   ├── PublicCommitteePage # Committee profile hub (/@:handle)
│   │   ├── PublicEventPage.tsx # The live public event microsite (/e/:slug)
│   │   └── dashboard/          # Organizer tabs: Overview, Events, Links, Appearance, Analytics, Settings
│   ├── types/                  # Strict TypeScript definitions for Events, Committees, Themes
│   ├── utils/                  # imageCompressor, urlPayload, dateUtils
│   ├── App.tsx                 # Route-level code-splitting with React.lazy & Suspense
│   ├── index.css               # Design system & theme stylesheets
│   └── main.tsx                # Application bootstrap
├── supabase_schema.sql         # Production database schema & RLS policies
├── supabase_clean_reset.sql    # Clean reset script to start with an empty database
├── vercel.json                 # SPA fallback rewrite configuration for Vercel
└── vite.config.ts              # Vite 8 config with manualChunks vendor optimization
```

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- **Node.js**: v18.0 or higher
- **npm**: v9.0 or higher

### 2. Clone the Repository
```bash
git clone https://github.com/Krishna250806/CampusLink.git
cd CampusLink
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the project root based on `.env.example`:
```bash
cp .env.example .env
```
Fill in your Supabase project credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

### 5. Launch the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🗄️ Database Setup (Supabase)

### Setting Up a Fresh Database
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
2. Navigate to the **SQL Editor** from the left navigation.
3. Click **New Query**, copy the contents of [`supabase_schema.sql`](./supabase_schema.sql), and click **Run**.
4. This will create:
   - `committees` table (with handle uniqueness and user scoping)
   - `events` table (supporting custom theme configs, links JSON, schedule, announcements)
   - `event_analytics` table (daily view counters and link metrics)
   - Optimized indexes and Row Level Security (RLS) policies

### Wiping Test Data for Production
To clear all demo accounts and testing rows while leaving the schema structure intact:
1. Open **SQL Editor** in Supabase.
2. Paste the contents of [`supabase_clean_reset.sql`](./supabase_clean_reset.sql) and click **Run**.

---

## 📦 Production Build & Optimization

CampusLink is engineered for high performance with route-level lazy loading and vendor chunking:
```bash
# Verify TypeScript types and compile production bundle
npm run build

# Preview production build locally
npm run preview
```

### Bundle Size Highlights
- Route-level code splitting ensures visitors loading public event links only download ~**167 kB** of JavaScript instead of the entire application.
- Vendor libraries (`gsap`, `@supabase/supabase-js`, `react-router-dom`) are split into independent cacheable chunks.

---

## 🌐 Deployment (Vercel)

CampusLink is 100% deployment-proof and pre-configured for Vercel:

1. Push your code to your GitHub repository.
2. Log into [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your `CampusLink` repository.
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = `https://your-supabase-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-supabase-anon-key`
5. Click **Deploy**. Vercel will run `npm run build` and route all deep links (e.g., `/e/my-fest`, `/@my-org`) through `vercel.json` without 404 errors.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

<p align="center">
  Crafted with ❤️ for College Committees, Student Hackathons, and Campus Creators.
</p>
