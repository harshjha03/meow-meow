// Segmented control. Two looks:
//  - "tab"  : pill container, active = white card (Log tabs, Progress range)
//  - "chip" : bordered fill, active = accent (form section / type chips)
export default function Segmented({ options, value, onChange, variant = 'tab' }) {
  if (variant === 'chip') {
    return (
      <div className="flex gap-2">
        {options.map((o) => {
          const active = o.value === value
          return (
            <button
              type="button"
              key={o.value}
              onClick={() => onChange(o.value)}
              className={
                'flex-1 rounded-[9px] border px-2 py-2.5 text-[13px] font-semibold transition ' +
                (active ? 'border-accent bg-accent text-white' : 'border-line bg-white text-[#6b6860] hover:border-accent/40')
              }
            >
              {o.label}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex gap-1.5 rounded-xl bg-bd p-1">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            type="button"
            key={o.value}
            onClick={() => onChange(o.value)}
            className={
              'flex-1 whitespace-nowrap rounded-lg px-2 py-2.5 text-[13px] font-semibold transition ' +
              (active ? 'bg-white text-ink shadow-sm' : 'text-[#8b8794] hover:text-text')
            }
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
