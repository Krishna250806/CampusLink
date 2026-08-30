import React from 'react';
import { CinematicHero } from '../components/ui/cinematic-landing-hero';

export const LandingPage: React.FC = () => {
  return (
    <div className="overflow-x-hidden w-full min-h-screen bg-neutral-950">
      {/* 3D GSAP CINEMATIC HERO - EXCLUSIVE LANDING PAGE EXPERIENCE */}
      <CinematicHero />
    </div>
  );
};
