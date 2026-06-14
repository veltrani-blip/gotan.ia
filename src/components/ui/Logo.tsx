// Logo placeholder próprio — marca "g." em gradiente roxo. Não reproduz nenhuma marca de terceiros.
export function Logo({ className }: { className?: string }) {
  return (
    <span className={className} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <rect width="28" height="28" rx="8" fill="url(#g)" />
        <path
          d="M18 9.5a5 5 0 1 0 0 7v1.2c0 1.8-1.4 3.1-3.4 3.1-1.5 0-2.7-.7-3.2-1.8M18 9.5v6.5"
          stroke="#fff"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="28" y2="28">
            <stop stopColor="#ff7a18" />
            <stop offset="1" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>
      <span style={{ fontWeight: 600, letterSpacing: "-0.02em" }}>
        gotan<span style={{ color: "var(--accent)" }}>.ia</span>
      </span>
    </span>
  );
}
