type IconProps = { className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
};

export function CartIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
      <path d="M2.5 3.5h2.7l2.3 11.2a1.5 1.5 0 001.5 1.2h8.3a1.5 1.5 0 001.5-1.1l1.6-6.6H6.3" />
    </svg>
  );
}

export function BagIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M6 7h12l1 13H5L6 7z" />
      <path d="M9 7V6a3 3 0 016 0v1" />
    </svg>
  );
}

export function PlusIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg className={className} {...base} strokeWidth={2.6}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function MinusIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg className={className} {...base} strokeWidth={2.6}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function TrashIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg className={className} {...base} strokeWidth={2}>
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4h6v3" />
    </svg>
  );
}

export function CloseIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg className={className} {...base} strokeWidth={2.6}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
