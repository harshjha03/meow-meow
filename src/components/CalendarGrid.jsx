import { useState } from 'react'
import { toDateStr, todayStr, MONTHS } from '../lib/dates'
import { ChevronLeft, ChevronRight } from './icons'

const WD = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default function CalendarGrid({ onSelect, plannerDates = new Set() }) {
  const [view, setView] = useState(() => {
    const d = new Date()
    return { y: d.getFullYear(), m: d.getMonth() }
  })

  const first = new Date(view.y, view.m, 1)
  const startPad = (first.getDay() + 6) % 7 // Monday-based
  const dim = new Date(view.y, view.m + 1, 0).getDate()
  const cells = Math.ceil((startPad + dim) / 7) * 7
  const today = todayStr()
  const step = (delta) => {
    const nd = new Date(view.y, view.m + delta, 1)
    setView({ y: nd.getFullYear(), m: nd.getMonth() })
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => step(-1)} className="btn-ghost px-2 py-2" aria-label="Previous month">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-[17px] font-bold text-ink">{MONTHS[view.m]} {view.y}</span>
        <button onClick={() => step(1)} className="btn-ghost px-2 py-2" aria-label="Next month">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-1.5 grid grid-cols-7 gap-[5px]">
        {WD.map((w, i) => (
          <div key={i} className="text-center text-[11px] font-semibold text-[#b6b3ab]">{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-[5px]">
        {Array.from({ length: cells }).map((_, i) => {
          const day = i - startPad + 1
          if (day < 1 || day > dim) return <div key={i} />
          const k = toDateStr(new Date(view.y, view.m, day))
          const isToday = k === today
          const has = plannerDates.has(k)
          return (
            <button
              key={i}
              onClick={() => onSelect(k)}
              className="flex aspect-square flex-col items-center justify-center rounded-[9px] text-[13px] font-semibold transition active:scale-95"
              style={{ background: isToday ? 'var(--accent)' : 'var(--track)', color: isToday ? '#fff' : 'var(--ink)' }}
            >
              <span>{day}</span>
              {has && <span style={{ width: 5, height: 5, borderRadius: '50%', background: isToday ? '#9b86ff' : 'var(--accent)', marginTop: 3 }} />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
