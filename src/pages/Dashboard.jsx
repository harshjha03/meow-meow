import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSessions, useMocks, useTargets, useProfile } from '../lib/storage'
import { computeStreak } from '../lib/streak'
import { overallSummary, targetRings, volumeSeries, accuracy } from '../lib/stats'
import { SECTION_TINTS, SECTION_COLORS } from '../lib/theme'
import { formatShort } from '../lib/dates'
import Carousel3D from '../components/Carousel3D'
import ConicRing from '../components/ConicRing'
import { PawGlyph } from '../components/icons'

function greetingFor(name) {
  const h = new Date().getHours()
  const part = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  return `${part}, ${name || 'Scholar'}`
}

// Kitten mascot — uses /kitten.png, falling back to the 🐱 emoji if absent.
function Kitten() {
  const [ok, setOk] = useState(true)
  if (!ok) return <div style={{ flexShrink: 0, fontSize: 42, lineHeight: 1, filter: 'drop-shadow(0 6px 9px rgba(58,46,28,.25))' }}>🐱</div>
  return (
    <img
      src="/kitten.png"
      alt="mascot"
      onError={() => setOk(false)}
      style={{ flexShrink: 0, width: 56, height: 'auto', display: 'block', filter: 'drop-shadow(0 6px 9px rgba(58,46,28,.25))' }}
    />
  )
}

const cardBase = {
  width: '100%',
  height: '100%',
  borderRadius: 18,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  boxSizing: 'border-box',
}

function StreakCard({ count, greeting, dateText }) {
  const msg = count >= 3 ? "You're on fire — log today to keep it alive" : count >= 1 ? 'Nice start — keep the chain going' : 'Log a session to start a streak'
  return (
    <div style={{ ...cardBase, padding: '18px 22px', justifyContent: 'center', background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 92%, #fff), color-mix(in srgb, var(--accent) 80%, #000))' }}>
      <div style={{ position: 'absolute', right: -26, top: -26, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,.10)' }} />
      <div style={{ position: 'absolute', right: 42, bottom: -34, width: 96, height: 96, borderRadius: '50%', background: 'rgba(255,255,255,.07)' }} />
      <div style={{ position: 'relative', marginBottom: 14 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-.3px' }}>{greeting}</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.78)', marginTop: 2 }}>{dateText}</div>
      </div>
      <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.75)', letterSpacing: '1.4px', fontWeight: 600, position: 'relative' }}>DAILY STREAK</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 9, position: 'relative', marginTop: 10 }}>
        <div style={{ fontSize: 52, fontWeight: 700, color: '#fff', lineHeight: 0.9, letterSpacing: '-1px' }}>{count}</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,.92)', paddingBottom: 7 }}>days</div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,.88)', marginTop: 13, position: 'relative' }}>{msg} 🐾</div>
    </div>
  )
}

function MocksCard({ mocksGiven, overallAcc, latestPct }) {
  const paws = [0, 1, 2, 3, 4].map((i) => (i < Math.round(overallAcc / 20) ? '#fff' : 'rgba(255,255,255,.32)'))
  return (
    <div style={{ ...cardBase, padding: '16px 18px', background: 'linear-gradient(135deg, #FF9457, #F0612F)' }}>
      <div style={{ position: 'absolute', right: -22, top: -26, opacity: 0.13, transform: 'rotate(18deg)' }}><PawGlyph size={124} color="#fff" /></div>
      <div style={{ position: 'absolute', right: 96, bottom: -20, opacity: 0.1, transform: 'rotate(-14deg)' }}><PawGlyph size={76} color="#fff" /></div>
      <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.8)', letterSpacing: '1.4px', fontWeight: 600, position: 'relative' }}>MOCKS GIVEN</div>
      <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-.5px', lineHeight: 1, marginTop: 4, color: '#fff', position: 'relative' }}>
        {mocksGiven}
        <span style={{ fontSize: 14, color: 'rgba(255,255,255,.82)', fontWeight: 500 }}> mocks</span>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, position: 'relative' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.85)' }}>Accuracy</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{overallAcc}%</span>
          </div>
          <div style={{ height: 12, borderRadius: 99, background: 'rgba(255,255,255,.26)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 99, background: '#fff', width: overallAcc + '%', transition: 'width 1s cubic-bezier(.22,1,.36,1)' }} />
          </div>
        </div>
        <Kitten />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, position: 'relative' }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {paws.map((c, i) => (
            <PawGlyph key={i} size={15} color={c} />
          ))}
        </div>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,.85)', fontWeight: 600 }}>latest {latestPct} %ile</span>
      </div>
    </div>
  )
}

function TargetsCard({ rings, done, target }) {
  return (
    <div style={{ ...cardBase, padding: '16px 18px', background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span className="text-ink" style={{ fontWeight: 600, fontSize: 14 }}>Weekly targets</span>
        <span className="text-muted2" style={{ fontSize: 11 }}>{done} / {target} Qs</span>
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around', gap: 6, alignItems: 'center' }}>
        {rings.map((r) => (
          <ConicRing key={r.key} pct={r.pct} color={r.color} tint={SECTION_TINTS[r.key]} label={r.label} sub={`${r.done} / ${r.target}`} />
        ))}
      </div>
    </div>
  )
}

function VolumeCard({ bars, total }) {
  return (
    <div style={{ ...cardBase, padding: '16px 18px', background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span className="text-ink" style={{ fontWeight: 600, fontSize: 14 }}>Questions · 7 days</span>
        <span className="text-muted2" style={{ fontSize: 11 }}>{total} total</span>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 8, marginTop: 8 }}>
        {bars.map((b, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ width: '100%', borderRadius: '4px 4px 0 0', background: b.color, height: b.hPct }} />
            <span style={{ fontSize: 10, color: '#b6b3ab' }}>{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const sessions = useSessions()
  const mocks = useMocks()
  const targets = useTargets()
  const profile = useProfile()

  const streak = computeStreak(sessions)
  const { mocksGiven, latestPercentile, overallAccuracy } = overallSummary(sessions, mocks)
  const { rings, done, target } = targetRings(sessions, targets)
  const bars = volumeSeries(sessions, 7)
  const week7Total = bars.reduce((a, b) => a + b.value, 0)
  const dateText = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })

  const recent = [...sessions]
    .sort((a, b) => b.date.localeCompare(a.date) || (b.created_at || '').localeCompare(a.created_at || ''))
    .slice(0, 5)

  const slides = [
    <StreakCard key="s" count={streak.count} greeting={greetingFor(profile.name)} dateText={dateText} />,
    <MocksCard key="m" mocksGiven={mocksGiven} overallAcc={overallAccuracy} latestPct={latestPercentile} />,
    <TargetsCard key="t" rings={rings} done={done} target={target} />,
    <VolumeCard key="v" bars={bars} total={week7Total} />,
  ]

  return (
    <div className="mx-auto max-w-[1080px] animate-fade-up space-y-3">
      <Carousel3D slides={slides} />

      <div className="card p-[18px]">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[15px] font-semibold text-ink">Recent sessions</span>
          <Link to="/log" className="text-[13px] font-semibold text-accent">+ Log</Link>
        </div>
        {recent.length === 0 ? (
          <Link to="/log" className="block py-8 text-center text-sm font-semibold text-accent">Log your first session →</Link>
        ) : (
          <div>
            {recent.map((s) => (
              <div key={s.id} className="flex items-center gap-3 border-b border-soft py-[11px] last:border-0">
                <div
                  className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[10px] text-[11px] font-bold"
                  style={{ background: SECTION_TINTS[s.subject], color: SECTION_COLORS[s.subject] }}
                >
                  {s.subject}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-ink">{s.topic}</div>
                  <div className="text-xs text-muted2">{formatShort(s.date)} · {s.duration_min} min</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-ink">{accuracy(s.questions_attempted, s.questions_correct)}%</div>
                  <div className="text-[11px] text-muted2">{s.questions_correct}/{s.questions_attempted}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
