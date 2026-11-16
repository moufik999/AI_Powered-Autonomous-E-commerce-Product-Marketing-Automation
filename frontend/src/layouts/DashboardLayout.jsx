/**
 * OmniMarket AI - Persistent Dashboard Layout
 * Architecture:
 * - Hamburger button (Fixed, top-left): Toggles the left sidebar open/closed.
 * - Left Sidebar (Fixed overlay): Slides in/out with the HamburgerMenu inside it.
 * - Right Content Area (Flexible): Glassmorphism container with backdrop blur,
 *   rendering active routes via <Outlet />.
 *
 * Everything except the zipper open mechanism is 100% unchanged:
 * - Light/Dark mode toggle (pull-string lightbulb, top-right)
 * - Sidebar background colour, glassmorphism/transparent-grey effects
 * - Text colours and hover effects on menu items
 * - Menu items: Dashboard, AI Post Generator, Photocard, All Posts, My Profile, Sign Out
 */

import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { FaLightbulb, FaRegLightbulb } from 'react-icons/fa';
import HamburgerMenu from '../components/HamburgerMenu';

export default function DashboardLayout({ userEmail, onSignOut }) {
  const [theme, setTheme] = useState('dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="relative min-h-screen bg-[#F8F7F4] dark:bg-gradient-to-br dark:from-zinc-900 dark:to-black text-gray-700 dark:text-white p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-300">

      {/* ── Hamburger Button (Fixed, top-left) ───────────────────────────── */}
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={sidebarOpen}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 60,
          width: '44px',
          height: '44px',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.15)',
          background: sidebarOpen
            ? 'rgba(245,158,11,0.18)'
            : 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '5px',
          padding: '10px',
          transition: 'background 0.25s ease, box-shadow 0.25s ease, transform 0.15s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.07)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.35)';
        }}
      >
        {/* Three horizontal bars — hamburger icon */}
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              display: 'block',
              width: '22px',
              height: '2.5px',
              borderRadius: '2px',
              background: sidebarOpen ? '#fbbf24' : (theme === 'dark' ? '#e2e8f0' : '#374151'),
              transition: 'background 0.25s ease, transform 0.25s ease, opacity 0.25s ease',
              /* Animate middle bar to fade when open */
              opacity: sidebarOpen && i === 1 ? 0 : 1,
              transform:
                sidebarOpen && i === 0
                  ? 'translateY(7.5px) rotate(45deg)'
                  : sidebarOpen && i === 2
                  ? 'translateY(-7.5px) rotate(-45deg)'
                  : 'none'
            }}
          />
        ))}
      </button>

      {/* ── Backdrop (click to close sidebar) ────────────────────────────── */}
      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 40,
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
            animation: 'fadeIn 0.2s ease'
          }}
        />
      )}

      {/* ── Sliding Sidebar Panel ─────────────────────────────────────────── */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: 50,
          paddingTop: '80px',
          paddingLeft: '16px',
          paddingRight: '16px',
          paddingBottom: '24px',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-110%)',
          transition: 'transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          alignItems: 'flex-start',
          pointerEvents: sidebarOpen ? 'auto' : 'none'
        }}
      >
        <HamburgerMenu onSignOut={onSignOut} isOpen={sidebarOpen} onClose={closeSidebar} />
      </aside>

      {/* ── Pull-String Lightbulb Button (Top-Right, unchanged) ───────────── */}
      <div className="absolute top-0 right-10 z-50 flex flex-col items-center">
        {/* Vertical String */}
        <div className="w-0.5 h-10 bg-gray-400 dark:bg-gray-600" />
        {/* Pull Button */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="transition-transform duration-200 active:translate-y-4 focus:outline-none cursor-pointer flex items-center justify-center p-1"
        >
          {theme === 'light' ? (
            <FaLightbulb className="w-6 h-6 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
          ) : (
            <FaRegLightbulb className="w-6 h-6 text-gray-500" />
          )}
        </button>
      </div>

      {/* ── Main Content Area (unchanged) ───────────────────────────────── */}
      <div className="w-full max-w-[1550px] mx-auto flex flex-col lg:flex-row items-center lg:items-start gap-8">
        <main className="flex-1 min-w-0 w-full bg-white shadow-sm border border-gray-200 dark:bg-white/5 dark:backdrop-blur-xl dark:border-white/10 dark:shadow-2xl rounded-3xl p-5 sm:p-8 min-h-[580px] transition-colors duration-300">
          <Outlet context={{ userEmail, theme, setTheme, toggleTheme }} />
        </main>
      </div>

      {/* ── Fade-in keyframe for backdrop ────────────────────────────────── */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
