/**
 * OmniMarket AI - My Profile View
 * Displays exclusively the active login session information without any personal or developer details.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MyProfileView({ userEmail, role = 'Merchant', onSignOut }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    } else {
      logout();
      navigate('/login');
    }
  };

  const resolvedEmail = userEmail || user?.email || localStorage.getItem('userEmail') || 'moufik241-35-391@diu.edu.bd';
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-300 text-xs font-semibold mb-2">
            <span>👤</span> Authenticated Session
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            My Profile
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm mt-1">
            Current active login session details and merchant authentication status.
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white shadow-sm border border-gray-200 dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 dark:shadow-2xl space-y-6">
        {/* User Avatar & Identity */}
        <div className="flex items-center gap-4 pb-6 border-b border-gray-200 dark:border-white/10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                {resolvedEmail}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Active
              </span>
            </div>
            <p className="text-xs text-gray-700 dark:text-gray-300 mt-0.5">
              Role: <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{role}</span> • Session: Valid
            </p>
          </div>
        </div>

        {/* Session Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:shadow-sm dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 space-y-1 transition-all duration-300 dark:hover:bg-white/10 dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]">
            <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
              Email Address
            </span>
            <span className="font-semibold text-gray-900 dark:text-white break-all">
              {resolvedEmail}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:shadow-sm dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 space-y-1 transition-all duration-300 dark:hover:bg-white/10 dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]">
            <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
              Access Role
            </span>
            <span className="font-semibold text-cyan-600 dark:text-cyan-300">
              {role}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:shadow-sm dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 space-y-1 transition-all duration-300 dark:hover:bg-white/10 dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]">
            <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
              Authentication Type
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              JWT Bearer Token Session
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:shadow-sm dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 space-y-1 transition-all duration-300 dark:hover:bg-white/10 dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]">
            <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
              Connected Page
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Amar bazar (Live)
            </span>
          </div>
        </div>

        {/* Sign Out Action */}
        <div className="pt-4 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
          <span className="text-xs text-gray-700 dark:text-gray-300">
            Terminate current session on this device
          </span>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-300 hover:text-rose-700 dark:hover:text-rose-200 text-xs font-semibold transition flex items-center gap-2"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
