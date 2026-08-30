import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CampusLinkProvider } from './context/CampusLinkContext';
import { LandingPage } from './pages/LandingPage';
import { PublicEventPage } from './pages/PublicEventPage';
import { PublicCommitteePage } from './pages/PublicCommitteePage';
import { DashboardLayout } from './pages/dashboard/DashboardLayout';
import { EventBuilderPage } from './pages/dashboard/EventBuilderPage';
import { AuthPage } from './pages/AuthPage';
import { Toaster } from 'sonner';
import { CommandPalette } from './components/common/CommandPalette';

export function App() {
  return (
    <CampusLinkProvider>
      <BrowserRouter>
        <Toaster position="bottom-right" theme="dark" richColors />
        <CommandPalette />
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
          <Route path="/events/:eventSlug" element={<PublicEventPage />} />
          <Route path="/event/:eventSlug" element={<PublicEventPage />} />
          <Route path="/@:handle/:eventSlug" element={<PublicEventPage />} />
          <Route path="/@:handle" element={<PublicCommitteePage />} />

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CampusLinkProvider>
  );
}

export default App;
