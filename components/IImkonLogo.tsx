interface Props {
  size?: number;
  className?: string;
}

/**
 * I-Imkon.uz rasmiy logotipi
 */
export function IImkonLogo({ size = 28, className = "" }: Props) {
  const id = "iimkon-grad";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill={`url(#${id})`} />
      {/* "I" harfi */}
      <text
        x="20"
        y="28"
        textAnchor="middle"
        fontSize="24"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, sans-serif"
        fill="white"
      >
        I
      </text>
      {/* Ustidagi nuqta */}
      <circle cx="20" cy="7" r="3" fill="white" fillOpacity="0.85" />
      {/* Poya */}
      <line x1="20" y1="10" x2="20" y2="14" stroke="white" strokeWidth="1.5" strokeOpacity="0.7" strokeLinecap="round" />
    </svg>
  );
}
