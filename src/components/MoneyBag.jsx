export default function MoneyBag({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="mbG1" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
        <linearGradient id="mbG2" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>

      {/* ── Main bag shape: wide gather at top, large round body ── */}
      <path
        d="
          M 26 24
          C 26 20 28 18 32 18
          C 36 18 38 20 38 24
          C 46 26 52 34 52 44
          C 52 56 43 62 32 62
          C 21 62 12 56 12 44
          C 12 34 18 26 26 24
          Z
        "
        fill="url(#mbG1)"
      />

      {/* ── Knot dome: simple oval sitting on top of the gather ── */}
      <ellipse cx="32" cy="14" rx="13" ry="8" fill="url(#mbG2)" />

      {/* ── Subtle cinch crease where bag is tied ── */}
      <path
        d="M 24 24 Q 32 29 40 24"
        stroke="rgba(0,0,60,0.12)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* ── Inner highlight / sheen ── */}
      <ellipse cx="20" cy="38" rx="4" ry="7" fill="white" opacity="0.18" />
    </svg>
  );
}
