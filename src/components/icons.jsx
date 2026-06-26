// Inline icons (stroke = currentColor) + filled brand glyphs. No icon-lib dependency.
const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const make = (children) =>
  function Icon({ className = 'w-6 h-6', ...rest }) {
    return (
      <svg {...base} className={className} {...rest} aria-hidden="true">
        {children}
      </svg>
    )
  }

// nav icons (match the design exactly)
export const HomeIcon = make(<path d="M3 11l9-8 9 8M5 9v11h5v-6h4v6h5V9" />)
export const PencilIcon = make(<path d="M4 20h4l10-10-4-4L4 16v4zM14 6l4 4" />)
export const ChartIcon = make(<path d="M4 19V9M10 19V5M16 19v-7M22 19H2" />)
export const CalendarIcon = make(<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></>)
export const UserIcon = make(<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></>)

// utility icons
export const PlusIcon = make(<path d="M12 5v14M5 12h14" />)
export const TrashIcon = make(<><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" /></>)
export const ClockIcon = make(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>)
export const CheckIcon = make(<path d="M20 6 9 17l-5-5" />)
export const XIcon = make(<path d="M18 6 6 18M6 6l12 12" />)
export const CopyIcon = make(<><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></>)
export const ChevronLeft = make(<path d="M15 6l-6 6 6 6" />)
export const ChevronRight = make(<path d="M9 6l6 6-6 6" />)

// ---- filled brand glyphs ----
export function MeowLogo({ width = 28, height = 26, color = 'var(--accent)' }) {
  return (
    <svg width={width} height={height} viewBox="0 0 30 28" aria-hidden="true">
      <polygon points="3,1 11,11 1,13" fill={color} />
      <polygon points="27,1 19,11 29,13" fill={color} />
      <circle cx="15" cy="16" r="11" fill={color} />
    </svg>
  )
}

export function PawGlyph({ size = 15, color = 'currentColor', className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden="true">
      <ellipse cx="8" cy="10.5" rx="3.8" ry="3" fill={color} />
      <circle cx="3.6" cy="6.6" r="1.5" fill={color} />
      <circle cx="8" cy="5" r="1.6" fill={color} />
      <circle cx="12.4" cy="6.6" r="1.5" fill={color} />
    </svg>
  )
}

export function FlameGlyph({ width = 12, height = 16, color = '#FF7A45', className }) {
  return (
    <svg width={width} height={height} viewBox="0 0 12 16" className={className} aria-hidden="true">
      <path d="M6 0C7 4 10 5 10 9a4 4 0 1 1-8 0c0-1.5 1-2.5 1.5-3 .3 1 1 1.5 1.5 1.5C5.5 6 4.5 3 6 0Z" fill={color} />
    </svg>
  )
}

export function GoogleIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-2 3.2-4.9 3.2-8.2Z" />
      <path fill="#34A853" d="M12 23c2.9 0 5.4-1 7.2-2.6l-3.6-2.7c-1 .7-2.3 1.1-3.6 1.1-2.8 0-5.1-1.9-6-4.4H2.3v2.8A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M6 14.4a6.6 6.6 0 0 1 0-4.2V7.4H2.3a11 11 0 0 0 0 9.8L6 14.4Z" />
      <path fill="#EA4335" d="M12 5.4c1.6 0 3 .5 4.1 1.6l3.1-3.1A11 11 0 0 0 2.3 7.4L6 10.2c.9-2.6 3.2-4.8 6-4.8Z" />
    </svg>
  )
}
