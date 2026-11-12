/**
 * OmniMarket AI - Clean Unified Workspace
 * Centralizes all navigation exclusively inside the interactive Denim Zipper Menu.
 * Refined 4-item navigation:
 * 1. AI Post Generator
 * 2. Photocard (Saved Posts & Photocards with full details and Download button)
 * 3. My Profile (Active Session info only)
 * 4. Sign Out (Distinct Red Danger Hover)
 */

import React, { useState } from 'react';
import ZipperMenu from '../components/ZipperMenu';
import RAGPostGenerator from '../components/RAGPostGenerator';
import SavedPostsView from '../components/SavedPostsView';
import MyProfileView from '../components/MyProfileView';

const REFINED_PROJECT_FEATURES = [
  {
    id: 'rag-generator',
    label: 'AI Post Generator',
    subtitle: 'RAG copy & product marketing',
    icon: '⚡'
  },
  {
    id: 'photocard',
    label: 'Photocard',
    subtitle: 'Saved posts & download gallery',
    icon: '🎨'
  },
  {
    id: 'profile',
    label: 'My Profile',
    subtitle: 'Active merchant session',
    icon: '👤',
    isProfile: true
  },
  {
    id: 'auth-logout',
    label: 'Sign Out',
    subtitle: 'End session & return to login',
    icon: '🚪',
    isSignout: true
  }
];

export default function BlankDashboard({ userEmail, onSignOut }) {
  const [activeView, setActiveView] = useState('rag-generator');

  const handleFeatureSelect = (featureId) => {
    // 4. Sign Out: Bind to existing JWT session clear & redirect
    if (featureId === 'auth-logout') {
      onSignOut();
      return;
    }

    // 1-3. Switch workspace view
    setActiveView(featureId);
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-white p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-[1520px] mx-auto flex flex-col lg:flex-row items-center lg:items-start gap-8">
        {/* Left Column: The Exclusive Central Denim Zipper Navigation (400px height) */}
        <aside className="w-full lg:w-auto flex-shrink-0 flex justify-center lg:sticky lg:top-8 z-20">
          <ZipperMenu
            features={REFINED_PROJECT_FEATURES}
            activeFeatureId={activeView}
            onSelectFeature={handleFeatureSelect}
          />
        </aside>

        {/* Right Column: Active Feature Workspace */}
        <main className="flex-1 min-w-0 w-full bg-slate-900/40 border border-slate-800/70 rounded-3xl p-5 sm:p-8 min-h-[500px] shadow-2xl backdrop-blur-md">
          {/* 1. AI Post Generator */}
          {activeView === 'rag-generator' && <RAGPostGenerator />}

          {/* 2. Photocard: Dedicated Saved Posts & Photocards View */}
          {activeView === 'photocard' && (
            <SavedPostsView
              userEmail={userEmail}
              onNavigateToGenerator={() => setActiveView('rag-generator')}
            />
          )}

          {/* 3. My Profile (Active session info only) */}
          {activeView === 'profile' && (
            <MyProfileView
              userEmail={userEmail}
              role="Merchant"
              onSignOut={onSignOut}
            />
          )}
        </main>
      </div>
    </div>
  );
}
