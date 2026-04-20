export default function MoneyBag({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="mbGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
        <linearGradient id="mbGradHi" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>

      {/* ── Left bow lobe ── */}
      <path
        d="M20 18 C14 18 10 14 12 10 C14 6 20 8 22 12 C23 14 22 17 20 18Z"
        fill="url(#mbGrad)"
      />
      {/* ── Right bow lobe ── */}
      <path
        d="M44 18 C50 18 54 14 52 10 C50 6 44 8 42 12 C41 14 42 17 44 18Z"
        fill="url(#mbGrad)"
      />
      {/* ── Centre knot ── */}
      <ellipse cx="32" cy="16" rx="7" ry="5" fill="url(#mbGradHi)" />

      {/* ── Neck (cinched part below knot) ── */}
      <path
        d="M24 20 Q32 18 40 20 L39 26 Q32 24 25 26 Z"
        fill="url(#mbGrad)"
      />

      {/* ── Bag body ── */}
      <path
        d="M10 42 C10 28 19 26 25 26 L39 26 C45 26 54 28 54 42 C54 54 44 60 32 60 C20 60 10 54 10 42 Z"
        fill="url(#mbGrad)"
      />

      {/* ── Highlight / sheen ── */}
      <ellipse cx="21" cy="38" rx="4" ry="6" fill="white" opacity="0.15" />
    </svg>
  );
}
