# 🎓 CampusLink — Modern Event Microsite & Link-in-Bio Platform for Campus Organizations

![CampusLink Banner](https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200)

<p align="center">
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-Auth_%26_RLS-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Vercel-Deployment_Ready-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</p>

---

## 🌟 Overview

**CampusLink** is a production-grade, highly aesthetic event microsite builder and link-in-bio platform engineered specifically for college committees, student clubs, campus festivals, and hackathons. It enables organizers to launch art-directed, mobile-responsive event pages with dynamic countdowns, registration links, QR codes, and live phone preview mockups in minutes.

---

## ✨ Key Features

- ⚡ **Interactive 4-Step Event Builder**: Guided step-by-step wizard to create fests, hackathons, and workshops with real-time live phone preview.
- 🎨 **Art-Directed Themes & SVG Pattern Engine**:
  - **9 Curated Themes**: *Crimson Maroon*, *Scarlet Rose*, *Neo-Brutalist Pop*, *Midnight*, *Aurora*, *Cyber*, *Editorial*, *Festive*, *Minimal*.
  - **10 Vector Background Assets**: *Symbol Scatter*, *Blob Scatter*, *Circle Scatter*, *Blob Scene*, *Low Poly Grid*, *Stacked Waves*, *Stacked Peaks*, *Blob Haikei*, *Layered Peaks*, *Stacked Steps*.
- 🔐 **Supabase Authentication & Multi-Tenant Workspaces**:
  - Email & Password registration with strict signup-first validation.
  - **Google OAuth One-Tap Sign In** integration.
  - **Isolated User Workspaces**: Data scoping per organizer account so User A sees only User A's private dashboard events.
- 📊 **Real-Time Visitor Analytics**: Track total page views, link clicks, registration conversions, and top-performing links.
- 📱 **Instant QR Code Generation**: Download high-resolution PNG QR codes for poster printing and quick campus sharing.
- 🌐 **Public Microsites & Handles**: Custom Organization bio pages (`/@organizer-handle`) and event microsites (`/events/:slug`).

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript |
| **Build Tooling** | Vite 8 + SWC |
| **Styling** | Vanilla CSS + Tailwind CSS v4 |
| **Icons & UI** | Lucide React + Shadcn/ui Primitives |
| **Authentication & Database** | Supabase Auth + PostgreSQL (Row Level Security) |
| **Animations & Effects** | Framer Motion + Canvas Confetti |
| **Deployment** | Vercel SPA Routing (`vercel.json`) |

---

## 📂 Project Architecture

```
campuslink/
├── .env.example            # Environment variables template
├── supabase_schema.sql     # Complete Supabase PostgreSQL RLS schema
├── vercel.json             # Vercel SPA rewrite configuration
├── public/                 # Static public assets & favicon
└── src/
    ├── assets/             # Raw SVG background vector assets
    ├── components/         # Reusable UI components & Phone Mockup
    │   ├── common/         # Command palette, Navbar, Modals
    │   ├── phone/          # Interactive Live Mobile Mockup
    │   └── ui/             # Neural Access Login & Shadcn components
    ├── context/            # CampusLink Context & Isolated State Engine
    ├── data/               # Seed data & fallback presets
    ├── lib/                # Supabase SDK client & auth helpers
    ├── pages/              # App Pages
    │   ├── AuthPage.tsx    # Login & Registration Page
    │   ├── PublicEventPage # Public Event Microsite
    │   └── dashboard/      # Organizer Dashboard & Event Builder
    ├── types/              # TypeScript Type Definitions
    └── utils/              # SVG Background Encoders & Helpers
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
Ensure you have **Node.js 18+** and **npm** installed on your system.

### 2. Clone Repository & Install Dependencies
```bash
git clone https://github.com/Krishna250806/CampusLink.git
cd CampusLink
npm install
```

### 3. Setup Environment Variables
Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```
Update `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🗄️ Supabase Database Migration Setup

1. Open your [Supabase Console](https://supabase.com/dashboard) and create a project.
2. Go to **SQL Editor** -> Click **New Query**.
3. Copy and paste the entire contents of [`supabase_schema.sql`](./supabase_schema.sql) and click **RUN**.
4. To enable Google OAuth: Go to **Authentication -> Providers -> Google**, paste your Google Client ID & Secret from Google Cloud Console, and click **Save**.

---

## 🌐 Deploying to Vercel

1. Push your repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/new) -> Import `Krishna250806/CampusLink`.
3. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click **Deploy**. Vercel will automatically build and deploy your app with full SPA routing (`vercel.json`).

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

<p align="center">Made with ❤️ for Student Organizers & Campus Creators</p>
