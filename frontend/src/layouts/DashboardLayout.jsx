/**
 * OmniMarket AI - Persistent Dashboard Layout
 * Architecture:
 * - Left Sidebar (Fixed / Sticky): Houses the interactive Denim Zipper Menu.
 * - Right Content Area (Flexible): Glassmorphism container with backdrop blur, rendering active routes via <Outlet />.
 */

import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { FaLightbulb, FaRegLightbulb } from 'react-icons/fa';
import ZipperMenu from '../components/ZipperMenu';

export default function DashboardLayout({ userEmail, onSignOut }) {
  const [theme, setTheme] = useState('dark');

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

  return (
    <div className="relative min-h-screen bg-[#F8F7F4] dark:bg-gradient-to-br dark:from-zinc-900 dark:to-black text-gray-700 dark:text-white p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-300">
      {/* Pull-String Lightbulb Button (Top-Right) */}
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

      <div className="w-full max-w-[1550px] mx-auto flex flex-col lg:flex-row items-center lg:items-start gap-8">
        {/* Left Sidebar: Fixed/Sticky interactive Denim Zipper Menu */}
        <aside className="w-full lg:w-auto flex-shrink-0 flex justify-center lg:sticky lg:top-8 z-20">
          <ZipperMenu onSignOut={onSignOut} theme={theme} />
        </aside>

        {/* Right Content Area: Glassmorphism content panel */}
        <main className="flex-1 min-w-0 w-full bg-white shadow-sm border border-gray-200 dark:bg-white/5 dark:backdrop-blur-xl dark:border-white/10 dark:shadow-2xl rounded-3xl p-5 sm:p-8 min-h-[580px] transition-colors duration-300">
          <Outlet context={{ userEmail, theme, setTheme, toggleTheme }} />
        </main>
      </div>
    </div>
  );
}
