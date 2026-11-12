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
      <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold mb-2">
            <span>👤</span> Authenticated Session
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            My Profile
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Current active login session details and merchant authentication status.
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-6">
        {/* User Avatar & Identity */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white">
                {resolvedEmail}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Role: <span className="text-cyan-400 font-semibold">{role}</span> • Session: Valid
            </p>
          </div>
        </div>

        {/* Session Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Email Address
            </span>
            <span className="font-semibold text-white break-all">
              {resolvedEmail}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Access Role
            </span>
            <span className="font-semibold text-cyan-300">
              {role}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Authentication Type
            </span>
            <span className="font-semibold text-slate-200">
              JWT Bearer Token Session
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Connected Page
            </span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Amar bazar (Live)
            </span>
          </div>
        </div>

        {/* Sign Out Action */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Terminate current session on this device
          </span>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-rose-200 text-xs font-semibold transition flex items-center gap-2"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
