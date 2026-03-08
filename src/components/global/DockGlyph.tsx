type Props = {
  name: 'workbench' | 'notes' | 'timeline' | 'agents' | 'news' | 'network' | 'links' | 'contact';
  className?: string;
};

const common = {
  viewBox: '0 0 64 64',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
} as const;

export default function DockGlyph({ name, className = '' }: Props) {
  // Intentionally simple, bold glyphs. These aren't Apple-like; they're DG-Labs OS.
  switch (name) {
    case 'workbench':
      return (
        <svg {...common} className={className} aria-hidden="true">
          <path d="M16 20h32v24H16z" stroke="currentColor" strokeWidth="4" opacity="0.92" rx="2" />
          <path d="M24 20v24M16 28h32" stroke="currentColor" strokeWidth="3.5" opacity="0.65" />
          <path
            d="M29 25h14M29 33h10M20 33h4M20 39h23"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'notes':
      return (
        <svg {...common} className={className} aria-hidden="true">
          <path d="M20 16h24v32H20z" stroke="currentColor" strokeWidth="4" />
          <path d="M24 16v32" stroke="currentColor" strokeWidth="3.5" opacity="0.7" />
          <path
            d="M29 24h10M29 32h10M29 40h7"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'timeline':
      return (
        <svg {...common} className={className} aria-hidden="true">
          <path d="M18 18v28" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <path
            d="M18 24h28M18 34h22M18 44h16"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="18" cy="24" r="4" fill="currentColor" />
          <circle cx="18" cy="34" r="4" fill="currentColor" />
          <circle cx="18" cy="44" r="4" fill="currentColor" />
        </svg>
      );
    case 'agents':
      return (
        <svg {...common} className={className} aria-hidden="true">
          <path d="M18 20h28v24H18z" stroke="currentColor" strokeWidth="4" />
          <path d="M24 32h10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <path d="M24 28l6 4-6 4" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
          <path
            d="M40 26v12"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.9"
          />
        </svg>
      );
    case 'news':
      return (
        <svg {...common} className={className} aria-hidden="true">
          <path d="M16 18h32v28H16z" stroke="currentColor" strokeWidth="4" />
          <path d="M16 24h32" stroke="currentColor" strokeWidth="3.5" opacity="0.72" />
          <path
            d="M21 30h9M21 38h14M34 30h8M34 38h8"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'network':
      return (
        <svg {...common} className={className} aria-hidden="true">
          <circle cx="22" cy="26" r="6" stroke="currentColor" strokeWidth="4" />
          <circle cx="42" cy="22" r="6" stroke="currentColor" strokeWidth="4" />
          <circle cx="44" cy="42" r="6" stroke="currentColor" strokeWidth="4" />
          <path
            d="M27 24l10-2M26 30l14 10"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'links':
      return (
        <svg {...common} className={className} aria-hidden="true">
          <path
            d="M24 34l-4 4a10 10 0 0 0 14 14l4-4"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M40 30l4-4a10 10 0 0 0-14-14l-4 4"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path d="M26 38l12-12" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case 'contact':
      return (
        <svg {...common} className={className} aria-hidden="true">
          <path d="M16 22h32v20H16z" stroke="currentColor" strokeWidth="4" />
          <path
            d="M18 24l14 10 14-10"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
}
