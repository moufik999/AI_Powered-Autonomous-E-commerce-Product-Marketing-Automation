
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const DEFAULT_MENU_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: '📊'
  },
  {
    id: 'generate',
    label: 'AI Post Generator',
    path: '/generate',
    icon: '⚡'
  },
  {
    id: 'photocards',
    label: 'Photocard',
    path: '/photocards',
    icon: '🎨'
  },
  {
    id: 'history',
    label: 'All Posts',
    path: '/history',
    icon: '📑'
  },
  {
    id: 'profile',
    label: 'My Profile',
    path: '/profile',
    icon: '👤',
    isProfile: true
  },
  {
    id: 'signout',
    label: 'Sign Out',
    path: '/login',
    icon: '🚪',
    isSignout: true
  }
];

export default function HamburgerMenu({
  items = DEFAULT_MENU_ITEMS,
  onSignOut,
  isOpen,
  onClose
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleItemClick = (item) => {
    if (item.isSignout) {
      if (onSignOut) {
        onSignOut();
      } else {
        localStorage.clear();
        navigate('/login');
      }
    } else if (item.path) {
      navigate(item.path);
    }
    onClose();
  };

  return (
    /* Sidebar panel — same glassmorphism/background as the original nav.zipper */
    <nav
      className="bg-[#F8F7F4] dark:bg-white/5"
      style={{
        width: '260px',
        borderRadius: '20px',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: `
          0 25px 50px -12px rgba(0, 0, 0, 0.9),
          0 0 0 1px rgba(255, 255, 255, 0.10),
          inset 0 2px 6px rgba(0, 0, 0, 0.5)
        `,
        overflow: 'hidden',
        padding: '18px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}
    >
      {/* Inner dashed-gold stitch border (matches nav.zipper::before) */}
      <div
        style={{
          position: 'absolute',
          inset: '10px',
          border: '1.5px dashed rgba(212, 163, 89, 0.45)',
          borderRadius: '14px',
          pointerEvents: 'none',
          zIndex: 2,
          boxShadow: 'inset 0 0 8px rgba(0,0,0,0.5)'
        }}
      />

      {/* Menu Items — text-only boxes, neat spacing, lift-on-hover */}
      <ul className="flex flex-col gap-2.5 relative z-[3] list-none m-0 p-1">
        {items.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <li key={item.id} className="w-full">
              <button
                type="button"
                onClick={() => handleItemClick(item)}
                className={[
                  /* ── base box ── */
                  'w-full text-left px-5 py-3.5 rounded-xl',
                  'border transition-all duration-300 cursor-pointer',
                  'font-semibold text-[15px] tracking-[0.01em]',
                  /* ── default colours (dark / light) ── */
                  'dark:bg-[#222222]/60 dark:border-transparent dark:text-gray-200',
                  'bg-black/[0.04] border-black/[0.08] text-gray-800',
                  /* ── hover: lift + highlight ── */
                  'hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg',
                  'dark:hover:bg-[#2a2a2a] dark:hover:border-[#333]',
                  'hover:bg-black/[0.07] hover:border-black/[0.14]',
                  /* ── active route: amber glow ── */
                  isActive
                    ? 'dark:!bg-amber-500/[0.16] dark:!border-amber-400 dark:!text-amber-300 !shadow-[0_0_16px_rgba(251,191,36,0.35)] !border-amber-400/60'
                    : '',
                  /* ── sign-out: subtle red tint on hover (dark only) ── */
                  item.isSignout
                    ? 'dark:hover:!bg-red-500/[0.15] dark:hover:!border-red-500 dark:hover:!text-red-400'
                    : '',
                ].join(' ')}
              >
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
