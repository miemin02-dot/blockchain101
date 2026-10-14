import type { MenuItem } from '../pages/Menu'

interface MenuCardProps {
  item: MenuItem
  onOrder: (item: MenuItem) => void
}

// Inline SVG icons per drink type — no emojis
function DrinkIcon({ icon, colorFrom, colorTo }: { icon: string; colorFrom: string; colorTo: string }) {
  const gradId = `g-${icon}`
  // Each icon is a simplified coffee-themed path
  const paths: Record<string, string> = {
    espresso:   'M7 17h10M8 5h8a1 1 0 0 1 1 1v6a5 5 0 0 1-10 0V6a1 1 0 0 1 1-1z',
    latte:      'M6 17h12M7 5h10a1 1 0 0 1 1 1v7a6 6 0 0 1-12 0V6a1 1 0 0 1 1-1zM9 9c0-1 1-2 3-2s3 1 3 2',
    cappuccino: 'M6 17h12M7 5h10a1 1 0 0 1 1 1v7a6 6 0 0 1-12 0V6a1 1 0 0 1 1-1zM9 8a3 3 0 0 0 6 0',
    americano:  'M7 17h10M8 5h8a1 1 0 0 1 1 1v6a5 5 0 0 1-10 0V6a1 1 0 0 1 1-1zM12 8v4',
    'cold-brew':'M8 3h8M9 3v3M15 3v3M6 6h12l-1 9a5 5 0 0 1-10 0L6 6z',
    'iced-latte':'M7 3h10M8 3v3M16 3v3M5 6h14l-2 11a4 4 0 0 1-4 3h-2a4 4 0 0 1-4-3L5 6zM9 11h6',
    matcha:     'M7 17h10M12 5c-3 0-5 2-5 4v4a5 5 0 0 0 10 0V9c0-2-2-4-5-4zM9 9c1-1 2-1 3-1s2 0 3 1',
    'pour-over':'M8 3h8M8 3l-2 5h12l-2-5M10 8v2M14 8v2M7 13h10a5 5 0 0 1-10 0zM10 16l1 4M14 16l-1 4',
  }
  const d = paths[icon] ?? paths['espresso']

  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={colorFrom} />
          <stop offset="100%" stopColor={colorTo} />
        </linearGradient>
      </defs>
      <path d={d} stroke={`url(#${gradId})`} />
    </svg>
  )
}

function CategoryBadge({ category }: { category: MenuItem['category'] }) {
  const map = {
    hot:     { label: 'Nóng',     bg: 'rgba(196,125,62,0.12)', color: '#8B5E3C' },
    cold:    { label: 'Lạnh',     bg: 'rgba(16,97,166,0.10)',  color: '#1061a6' },
    special: { label: 'Đặc biệt', bg: 'rgba(26,128,71,0.10)',  color: '#1a8047' },
  }
  const { label, bg, color } = map[category]
  return (
    <span
      className="rounded-lg px-2 py-0.5 text-[10px] font-semibold"
      style={{ background: bg, color }}
    >
      {label}
    </span>
  )
}

export function MenuCard({ item, onOrder }: MenuCardProps) {
  return (
    <button
      onClick={() => onOrder(item)}
      className="w-full text-left rounded-3xl p-4 flex flex-col gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2"
      style={{
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.72)',
        boxShadow: '0 4px 24px rgba(18,45,69,0.07), inset 0 1px 0 rgba(255,255,255,0.6)',
        minHeight: 148,
      }}
    >
      {/* Icon area */}
      <div
        className="flex size-12 items-center justify-center rounded-2xl"
        style={{
          background: `linear-gradient(135deg, ${item.colorFrom}22 0%, ${item.colorTo}33 100%)`,
          border: `1px solid ${item.colorTo}25`,
        }}
      >
        <DrinkIcon icon={item.icon} colorFrom={item.colorFrom} colorTo={item.colorTo} />
      </div>

      {/* Text */}
      <div className="flex-1">
        <CategoryBadge category={item.category} />
        <p className="display font-600 text-sm mt-1.5 leading-tight" style={{ color: 'var(--ink)' }}>
          {item.name}
        </p>
        <p className="text-xs mt-0.5 leading-snug" style={{ color: 'var(--muted)' }}>
          {item.description}
        </p>
      </div>

      {/* Price row */}
      <div className="flex items-center justify-between">
        <span
          className="display text-base font-700 tabular-nums"
          style={{ color: 'var(--ink)' }}
        >
          ${item.price.toFixed(2)}
          <span className="text-xs font-500 ml-1" style={{ color: 'var(--muted)' }}>USDC</span>
        </span>
        <div
          className="flex size-7 items-center justify-center rounded-xl"
          style={{ background: 'var(--accent)', boxShadow: '0 2px 6px rgba(18,45,69,0.25)' }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 6h6M7 4l2 2-2 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </button>
  )
}
