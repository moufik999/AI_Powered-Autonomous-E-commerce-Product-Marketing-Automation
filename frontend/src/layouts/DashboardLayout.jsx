/**
 * OmniMarket AI - Persistent Dashboard Layout
 * Architecture:
 * - Left Sidebar (Fixed / Sticky): Houses the interactive Denim Zipper Menu.
 * - Right Content Area (Flexible): Glassmorphism container with backdrop blur, rendering active routes via <Outlet />.
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import ZipperMenu from '../components/ZipperMenu';

export default function DashboardLayout({ userEmail, onSignOut }) {
  return (
    <div className="min-h-screen bg-[#070a12] text-white p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-[1550px] mx-auto flex flex-col lg:flex-row items-center lg:items-start gap-8">
        {/* Left Sidebar: Fixed/Sticky interactive Denim Zipper Menu */}
        <aside className="w-full lg:w-auto flex-shrink-0 flex justify-center lg:sticky lg:top-8 z-20">
          <ZipperMenu onSignOut={onSignOut} />
        </aside>

        {/* Right Content Area: Glassmorphism container rendering active routes */}
        <main className="flex-1 min-w-0 w-full bg-slate-900/40 border border-slate-800/70 rounded-3xl p-5 sm:p-8 min-h-[580px] shadow-2xl backdrop-blur-md">
          <Outlet context={{ userEmail }} />
        </main>
      </div>
    </div>
  );
}
