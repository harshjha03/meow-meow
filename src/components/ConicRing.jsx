// Weekly-target ring: conic-gradient progress with a hollow center showing %.
export default function ConicRing({ pct = 0, color = 'var(--accent)', tint = 'var(--track)', label, sub, size = 72 }) {
  const inner = size - 16
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: `conic-gradient(${color} ${pct}%, ${tint} 0)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background .8s cubic-bezier(.22,1,.36,1)',
        }}
      >
        <div
          style={{
            width: inner,
            height: inner,
            borderRadius: '50%',
            background: 'var(--card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 15,
            fontWeight: 700,
            color,
          }}
        >
          {pct}%
        </div>
      </div>
      {label && (
        <div className="text-center">
          <div style={{ fontWeight: 700, fontSize: 12, color }}>{label}</div>
          {sub && <div className="mt-px text-[10px] text-muted2">{sub}</div>}
        </div>
      )}
    </div>
  )
}
