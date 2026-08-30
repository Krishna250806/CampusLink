import React, { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../../lib/utils';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NeuralAccessLoginProps {
  isLogin?: boolean;
  onToggleMode?: () => void;
  onGoogleSubmit?: () => void;
  onSubmit?: (data: {
    email: string;
    password?: string;
    name?: string;
    committeeName?: string;
    handle?: string;
  }) => void;
}

export const NeuralAccessLogin: React.FC<NeuralAccessLoginProps> = ({
  isLogin = true,
  onToggleMode,
  onGoogleSubmit,
  onSubmit
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [committeeName, setCommitteeName] = useState('');
  const [handle, setHandle] = useState('');

  // Generate static random values once per mount to prevent hydration errors
  const blobsData = useMemo(() => {
    return Array.from({ length: 6 }).map(() => ({
      size: Math.random() * 220 + 140,
      left: Math.random() * 80 + 10,
      top: Math.random() * 80 + 10,
      animationDelay: Math.random() * -20,
      animationDuration: Math.random() * 15 + 15,
    }));
  }, []);

  // Keep track of the blob DOM elements for high-performance updates
  const blobRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      blobRefs.current.forEach((blob, index) => {
        if (blob) {
          const speed = (index + 1) * 20;
          blob.style.marginLeft = `${x * speed}px`;
          blob.style.marginTop = `${y * speed}px`;
        }
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ email, password, name, committeeName, handle });
    }
  };

  return (
    <div className="mercury-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;800&family=Space+Mono:wght@400;700&display=swap');

        :root {
          --bg: #09090b;
          --mercury: #e4e4e7;
          --mercury-dark: #27272a;
          --accent: #ffffff;
          --text-dim: rgba(255, 255, 255, 0.55);
          --filter-goo: url('#gooey');
        }

        .mercury-wrapper {
          background-color: var(--bg);
          color: var(--accent);
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          width: 100vw;
          overflow-x: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 2rem 1rem;
        }

        .mercury-wrapper * {
          box-sizing: border-box;
          -webkit-font-smoothing: antialiased;
        }

        /* Background Liquid Physics Simulation */
        .stage {
          position: absolute;
          width: 100%;
          height: 100%;
          z-index: 0;
          filter: var(--filter-goo);
          opacity: 0.45;
          pointer-events: none;
        }

        .blob {
          position: absolute;
          background: linear-gradient(135deg, var(--mercury), #3f3f46);
          border-radius: 50%;
          filter: blur(22px);
          animation: float 20s infinite alternate ease-in-out;
          box-shadow: inset -10px -10px 20px rgba(0,0,0,0.8), 
                      10px 10px 30px rgba(255,255,255,0.15);
          transition: margin 0.1s ease-out;
        }

        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(10vw, 20vh) scale(1.2); }
          66% { transform: translate(-5vw, 10vh) scale(0.8); }
          100% { transform: translate(5vw, -10vh) scale(1.1); }
        }

        /* Interface Container */
        .auth-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 460px;
          padding: 32px 28px;
          background: rgba(24, 24, 27, 0.75);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 32px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.9);
        }

        .header {
          margin-bottom: 36px;
          text-align: left;
        }

        .brand-id {
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--text-dim);
          margin-bottom: 10px;
          display: flex;
          items-center;
          gap: 8px;
        }

        .header h1 {
          font-weight: 800;
          font-size: 2.5rem;
          line-height: 0.95;
          letter-spacing: -1.5px;
          margin-left: -2px;
          margin-top: 0;
          color: #ffffff;
        }

        /* Mode Switcher */
        .mode-switcher {
          display: flex;
          background: rgba(9, 9, 11, 0.8);
          padding: 4px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 28px;
        }

        .mode-btn {
          flex: 1;
          padding: 8px 12px;
          font-size: 11px;
          font-family: 'Space Mono', monospace;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-radius: 12px;
          border: none;
          background: transparent;
          color: var(--text-dim);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .mode-btn.active {
          background: #ffffff;
          color: #09090b;
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.15);
        }

        /* Form Elements */
        .form-group {
          position: relative;
          margin-bottom: 24px;
          transition: transform 0.4s cubic-bezier(0.2, 1, 0.3, 1);
        }

        .form-group:focus-within {
          transform: translateX(6px);
        }

        .form-group label {
          display: block;
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          color: var(--text-dim);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }

        .form-group input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
          color: var(--accent);
          padding: 10px 0;
          font-size: 15px;
          outline: none;
          transition: border-color 0.4s;
        }

        .input-glow {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0%;
          height: 2px;
          background: #ffffff;
          transition: width 0.6s cubic-bezier(0.2, 1, 0.3, 1);
          box-shadow: 0 0 15px #ffffff;
        }

        .form-group input:focus + .input-glow {
          width: 100%;
        }

        /* The Mercury Button */
        .submit-wrap {
          margin-top: 36px;
          position: relative;
          filter: var(--filter-goo);
        }

        .btn-base {
          background: #ffffff;
          color: #09090b;
          border: none;
          padding: 16px 32px;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2px;
          cursor: pointer;
          width: 100%;
          position: relative;
          z-index: 2;
          border-radius: 16px;
          transition: letter-spacing 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-base:hover {
          letter-spacing: 3.5px;
          background: #fafafa;
        }

        .mercury-drop {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          background: var(--mercury);
          transform: translate(-50%, -50%);
          z-index: 1;
          border-radius: 50px;
          transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .submit-wrap:hover .mercury-drop {
          transform: translate(-50%, -50%) scale(1.04, 1.18);
          filter: brightness(1.2);
        }

        /* Utility */
        .footer-nav {
          margin-top: 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          color: var(--text-dim);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 16px;
        }

        .footer-nav a {
          color: var(--text-dim);
          text-decoration: none;
          transition: color 0.3s;
        }

        .footer-nav a:hover {
          color: var(--accent);
        }

        .svg-filter-hidden {
          position: absolute;
          width: 0;
          height: 0;
        }
      `}</style>

      {/* SVG Gooey Filter */}
      <svg className="svg-filter-hidden">
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
            <feColorMatrix 
              in="blur" 
              mode="matrix" 
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" 
              result="goo" 
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
          </filter>
        </defs>
      </svg>

      {/* Parallax Blobs Background Stage */}
      <div className="stage" id="stage">
        {blobsData.map((data, index) => (
          <div
            key={index}
            ref={(el) => {
              blobRefs.current[index] = el;
            }}
            className="blob"
            style={{
              width: `${data.size}px`,
              height: `${data.size}px`,
              left: `${data.left}%`,
              top: `${data.top}%`,
              animationDelay: `${data.animationDelay}s`,
              animationDuration: `${data.animationDuration}s`,
            }}
          />
        ))}
      </div>

      <main className="auth-container">
        <header className="header">
          <Link to="/" className="brand-id hover:text-white transition-colors">
            <Sparkles className="w-4 h-4 text-white" />
            <span>CAMPUSLINK PLATFORM</span>
          </Link>
          <h1>{isLogin ? 'CampusLink\nLogin' : 'CampusLink\nSignup'}</h1>
        </header>

        {/* Mode Switcher */}
        <div className="mode-switcher">
          <button
            type="button"
            onClick={onToggleMode}
            className={cn("mode-btn", isLogin && "active")}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={onToggleMode}
            className={cn("mode-btn", !isLogin && "active")}
          >
            Register Org
          </button>
        </div>

        <form autoComplete="off" onSubmit={handleFormSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Alex Vance"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                <div className="input-glow"></div>
              </div>

              <div className="form-group">
                <label>Committee / Org Name</label>
                <input
                  type="text"
                  placeholder="TechNova Society"
                  required
                  value={committeeName}
                  onChange={e => setCommitteeName(e.target.value)}
                />
                <div className="input-glow"></div>
              </div>

              <div className="form-group">
                <label>Org Handle (@handle)</label>
                <input
                  type="text"
                  placeholder="technova"
                  required
                  value={handle}
                  onChange={e => setHandle(e.target.value)}
                />
                <div className="input-glow"></div>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="alex@technova.org"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <div className="input-glow"></div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••••••"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <div className="input-glow"></div>
          </div>

          <div className="submit-wrap">
            <div className="mercury-drop"></div>
            <button type="submit" className="btn-base">
              <span>{isLogin ? 'Sign In to Dashboard' : 'Create Committee Account'}</span>
              <ArrowRight className="w-4 h-4 text-neutral-950" />
            </button>
          </div>

          {/* Google OAuth Provider */}
          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            <button
              type="button"
              onClick={onGoogleSubmit}
              className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono font-bold text-slate-200 flex items-center justify-center gap-2.5 transition-all cursor-pointer hover:border-white/30 active:scale-98"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.6-1.5-1-3.2-1-5z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        </form>

        <footer className="footer-nav">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> ENCRYPTED SESSION
          </span>
          <Link to="/">BACK TO HOME</Link>
        </footer>
      </main>
    </div>
  );
};

export const Component = NeuralAccessLogin;
export default NeuralAccessLogin;
