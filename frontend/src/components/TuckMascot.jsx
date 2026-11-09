import React from 'react';

export default function TuckMascot({ mascotState = 'default', showThumbsUp = false }) {
  const getLeftEyeTransform = () => {
    if (mascotState === 'hiding' || mascotState === 'peeking') return 'translate(0, 36px) scale(1, 0.15)';
    if (mascotState === 'error') return 'translate(0, 34px) scale(1, 0.2)';
    if (mascotState === 'success') return 'translate(0, -6px) scale(1, 1.08)';
    if (mascotState === 'email') return 'translate(0, 4px)';
    return 'translate(0, 0px)';
  };

  const getRightEyeTransform = () => {
    if (mascotState === 'hiding') return 'translate(0, 36px) scale(1, 0.15)';
    if (mascotState === 'peeking') return 'translate(0, 12px) scale(1, 0.85)';
    if (mascotState === 'error') return 'translate(0, 34px) scale(1, 0.2)';
    if (mascotState === 'success') return 'translate(0, -6px) scale(1, 1.08)';
    if (mascotState === 'email') return 'translate(0, 4px)';
    return 'translate(0, 0px)';
  };

  return (
    <div className="absolute -top-[90px] left-1/2 -translate-x-1/2 z-20 pointer-events-none select-none">
      <svg className="w-48 h-28 drop-shadow-2xl overflow-visible transition-transform duration-300" viewBox="0 0 190 110">
        <ellipse cx="85" cy="100" rx="46" ry="7" fill="rgba(0,0,0,0.4)" filter="blur(3px)" />
        <path d="M 43 96 C 50 88, 60 86, 80 88 C 105 90, 125 92, 135 96 C 137 98, 131 102, 115 102 C 70 102, 39 100, 43 96 Z" fill="#F8A589" />
        <path d="M 125 94 C 133 88, 143 90, 147 95 C 143 99, 135 100, 125 94 Z" fill="#EE9478" />
        <ellipse cx="69" cy="74" rx="26" ry="24" fill="#F08A6B" />
        <ellipse cx="69" cy="74" rx="20" ry="18" fill="#F79F83" />
        <ellipse cx="70" cy="73" rx="14" ry="13" fill="#EE8465" />
        <ellipse cx="71" cy="73" rx="8" ry="7" fill="#FBB6A0" />
        <path d="M 69 60 C 79 62, 83 72, 79 80 C 75 86, 67 84, 63 80 C 61 76, 63 72, 69 72" fill="none" stroke="#E07252" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 103 94 C 103 80, 115 70, 129 74 C 139 77, 143 88, 139 96 C 131 99, 107 99, 103 94 Z" fill="#FBB6A0" />
        <circle cx="117" cy="85" r="4" fill="#F87171" opacity={mascotState === 'success' ? '0.9' : '0.3'} />
        <circle cx="135" cy="85" r="4" fill="#F87171" opacity={mascotState === 'success' ? '0.9' : '0.3'} />
        <path
          d={mascotState === 'error' ? 'M 124 92 Q 128 87 132 92' : mascotState === 'success' ? 'M 121 87 Q 128 97 135 87' : 'M 123 88 Q 128 93 133 88'}
          fill="none"
          stroke="#A74226"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* LEFT EYE STALK */}
        <g style={{ transform: getLeftEyeTransform(), transformOrigin: '117px 74px', transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
          <path d="M 117 74 Q 115 50 115 40" fill="none" stroke="#FBB6A0" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="115" cy="38" r="9" fill="#FFFFFF" stroke="#F08A6B" strokeWidth="1.5" />
          <circle cx="116" cy="38" r="4.2" fill="#1E293B" />
          <circle cx="114.5" cy="36.5" r="1.5" fill="#FFFFFF" />
        </g>

        {/* RIGHT EYE STALK */}
        <g style={{ transform: getRightEyeTransform(), transformOrigin: '129px 74px', transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
          <path d="M 129 74 Q 131 48 133 38" fill="none" stroke="#FBB6A0" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="133" cy="36" r="9" fill="#FFFFFF" stroke="#F08A6B" strokeWidth="1.5" />
          <circle cx={mascotState === 'peeking' ? '131' : '134'} cy="36" r="4.2" fill="#1E293B" />
          <circle cx={mascotState === 'peeking' ? '129.5' : '132.5'} cy="34.5" r="1.5" fill="#FFFFFF" />
        </g>

        {/* ANIMATED THUMBS UP HAND */}
        {showThumbsUp && (
          <g style={{ transformOrigin: '155px 75px' }} className="thumbs-up-pop">
            <circle cx="160" cy="55" r="19" fill="#10B981" />
            <circle cx="160" cy="55" r="16" fill="#059669" />
            <path d="M 154 57 L 154 62 C 154 63 155 64 156 64 L 166 64 C 167.5 64 168.5 63 168.5 61.5 L 168.5 56.5 C 168.5 55.5 167.5 54.5 166.5 54.5 L 162.5 54.5 L 163.5 50 C 163.7 48.5 162.5 47 161 47 C 160 47 159 47.7 158.6 48.6 L 155.5 54.5 L 154 57 Z" fill="#FFFFFF" />
            <rect x="151.5" y="56" width="3" height="8" rx="1.5" fill="#FBB6A0" />
          </g>
        )}
      </svg>
    </div>
  );
}