import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CampusLinkProvider } from './context/CampusLinkContext';
import { Toaster } from 'sonner';
import { CommandPalette } from './components/common/CommandPalette';

// Lazy-loaded pages for high-performance code-splitting
const LandingPage = React.lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const PublicEventPage = React.lazy(() => import('./pages/PublicEventPage').then(m => ({ default: m.PublicEventPage })));
const PublicCommitteePage = React.lazy(() => import('./pages/PublicCommitteePage').then(m => ({ default: m.PublicCommitteePage })));
const DashboardLayout = React.lazy(() => import('./pages/dashboard/DashboardLayout').then(m => ({ default: m.DashboardLayout })));
const EventBuilderPage = React.lazy(() => import('./pages/dashboard/EventBuilderPage').then(m => ({ default: m.EventBuilderPage })));
const AuthPage = React.lazy(() => import('./pages/AuthPage').then(m => ({ default: m.AuthPage })));

const PageLoadingFallback = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3">
    <div className="w-9 h-9 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
    <span className="text-xs font-mono text-slate-500 tracking-wider uppercase">Loading CampusLink...</span>
  </div>
);

export function App() {
  return (
    <CampusLinkProvider>
      <BrowserRouter>
        <Toaster position="bottom-right" theme="dark" richColors />
        <CommandPalette />
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/signup" element={<AuthPage mode="signup" />} />

            {/* Organizer Dashboard */}
            <Route path="/dashboard" element={<DashboardLayout />} />
            <Route path="/dashboard/builder" element={<EventBuilderPage />} />
            <Route path="/dashboard/builder/:eventId" element={<EventBuilderPage />} />

            {/* Public Event Routes */}
            <Route path="/e/:eventSlug" element={<PublicEventPage />} />
            <Route path="/events/:eventSlug" element={<PublicEventPage />} />
            <Route path="/event/:eventSlug" element={<PublicEventPage />} />
            <Route path="/@:handle/:eventSlug" element={<PublicEventPage />} />
            <Route path="/@:handle" element={<PublicCommitteePage />} />
            <Route path="/c/:handle" element={<PublicCommitteePage />} />
            <Route path="/:handle/:eventSlug" element={<PublicEventPage />} />

            {/* Fallback redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </CampusLinkProvider>
  );
}

export default App;
