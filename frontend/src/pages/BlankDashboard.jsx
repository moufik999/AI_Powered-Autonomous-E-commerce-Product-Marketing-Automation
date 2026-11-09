/**
 * OmniMarket AI - Blank Dashboard Page
 * Main merchant workspace featuring top status bar and RAG Post Generator.
 */

import React from 'react';
import Navbar from '../components/Navbar';
import RAGPostGenerator from '../components/RAGPostGenerator';

export default function BlankDashboard({ userEmail, onSignOut }) {
  return (
    <div className="min-h-screen bg-[#070a12] text-white flex flex-col p-4 sm:p-6 font-sans">
      {/* Dashboard Top Navigation Bar */}
      <Navbar
        userEmail={userEmail}
        role="Merchant"
        onSignOut={onSignOut}
      />

      {/* Main Workspace Body with RAG Post Generator */}
      <main className="w-full max-w-6xl mx-auto flex-1 my-6 bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 sm:p-8 min-h-[500px]">
        <RAGPostGenerator />
      </main>
    </div>
  );
}
