// "m." monogram: one continuous stroke for the m, with the full stop as a milestone dot on the road ahead.
export function LogoMark({ className = 'logo-mark' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="18" fill="#2952c8" />
      <path d="M14 46V31a7.5 7.5 0 0 1 15 0v15M29 31a7.5 7.5 0 0 1 15 0v6" fill="none" stroke="#f5f4ee" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="50" cy="45" r="4.2" fill="#f5f4ee" />
    </svg>
  );
}
