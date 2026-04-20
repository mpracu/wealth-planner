export default function ShieldLogo({ className }) {
  return (
    <svg className={className} viewBox="0 0 80 92" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Shield border: blue left → green right */}
        <linearGradient id="sl_border" x1="6" y1="46" x2="74" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>

        {/* Shield fill: soft golden radial glow */}
        <radialGradient id="sl_fill" cx="40" cy="32" r="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#fde68a" stopOpacity="0.30" />
          <stop offset="55%"  stopColor="#f59e0b" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>

        {/* Bars: bright gold → amber */}
        <linearGradient id="sl_bar" x1="0" y1="25" x2="0" y2="84" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#fde68a" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        {/* Arrow: lime → bright green */}
        <linearGradient id="sl_arrow" x1="11" y1="78" x2="70" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#22c55e" />
          <stop offset="100%" stopColor="#86efac" />
        </linearGradient>

        {/* Clip content to shield interior */}
        <clipPath id="sl_clip">
          <path d="M40 4 C20 4 6 12 6 22 L6 52 C6 70 22 82 40 88 C58 82 74 70 74 52 L74 22 C74 12 60 4 40 4 Z" />
        </clipPath>
      </defs>

      {/* Shield fill */}
      <path
        d="M40 4 C20 4 6 12 6 22 L6 52 C6 70 22 82 40 88 C58 82 74 70 74 52 L74 22 C74 12 60 4 40 4 Z"
        fill="url(#sl_fill)"
      />

      {/* Shield border */}
      <path
        d="M40 4 C20 4 6 12 6 22 L6 52 C6 70 22 82 40 88 C58 82 74 70 74 52 L74 22 C74 12 60 4 40 4 Z"
        fill="none"
        stroke="url(#sl_border)"
        strokeWidth="4.5"
        strokeLinejoin="round"
      />

      {/* Gold bar chart (clipped to shield) */}
      <g clipPath="url(#sl_clip)">
        <rect x="13" y="60" width="11" height="24" rx="2" fill="url(#sl_bar)" />
        <rect x="27" y="48" width="11" height="36" rx="2" fill="url(#sl_bar)" />
        <rect x="41" y="36" width="11" height="48" rx="2" fill="url(#sl_bar)" />
        <rect x="55" y="24" width="11" height="60" rx="2" fill="url(#sl_bar)" />
      </g>

      {/* Arrow shaft */}
      <path
        d="M 11 78 L 61 26"
        stroke="url(#sl_arrow)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* Arrowhead at (70, 17) — pointing upper-right */}
      <path d="M 70 17 L 57 24 L 64 32 Z" fill="#6ee7b7" />
    </svg>
  );
}
