import { Suspense, lazy } from 'react'
import { Routes, Route, useLocation, Link } from 'react-router-dom'
import Nav from './components/Nav'
import { MeowLogo, FlameGlyph } from './components/icons'
import { useSessions, useProfile } from './lib/storage'
import { computeStreak } from './lib/streak'
import { useAuth } from './context/AuthContext'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Log = lazy(() => import('./pages/Log'))
const Progress = lazy(() => import('./pages/Progress'))
const Planner = lazy(() => import('./pages/Planner'))
const Profile = lazy(() => import('./pages/Profile'))
const DemoBar = import.meta.env.DEV ? lazy(() => import('./components/DemoBar')) : null

const TITLES = { '/': 'Dashboard', '/log': 'Log a session', '/progress': 'Progress', '/planner': 'Planner', '/profile': 'Profile' }

function PageFallback() {
  return (
    <div className="flex justify-center py-24">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
    </div>
  )
}

function StreakChip({ count }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-[#FFF1E9] px-3 py-1.5 text-[13px] font-semibold text-[#FF7A45]">
      <FlameGlyph width={11} height={14} /> {count} day streak
    </div>
  )
}

function Header() {
  const { pathname } = useLocation()
  const sessions = useSessions()
  const profile = useProfile()
  const { user } = useAuth()
  const streak = computeStreak(sessions)
  const name = profile.name || user?.email || ''
  const initial = (name.trim()[0] || 'U').toUpperCase()
  const dateText = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <>
      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-bg px-[18px] py-3 safe-t md:hidden">
        <div className="flex items-center gap-2.5">
          <MeowLogo width={24} height={22} />
          <span className="text-[17px] font-bold tracking-[-.4px] text-ink">Meow Meow</span>
        </div>
        <StreakChip count={streak.count} />
      </header>

      {/* Desktop header */}
      <header className="sticky top-0 z-20 hidden items-center justify-between border-b border-line bg-card px-[30px] py-[18px] md:flex" style={{ boxShadow: '0 4px 16px -12px rgba(58,46,28,.22)' }}>
        <div>
          <div className="text-[21px] font-bold tracking-[-.4px] text-ink">{TITLES[pathname] || 'Meow Meow'}</div>
          <div className="mt-px text-[13px] text-muted2">{dateText}</div>
        </div>
        <div className="flex items-center gap-3">
          <StreakChip count={streak.count} />
          <Link
            to="/profile"
            title="Open profile"
            className="relative grid h-[38px] w-[38px] place-items-center rounded-full text-[15px] font-bold text-white"
            style={{ background: user ? '#13B981' : 'var(--accent)' }}
          >
            {initial}
            {user && <span className="absolute -bottom-px -right-px h-[11px] w-[11px] rounded-full border-2 border-white bg-lrdi" />}
          </Link>
        </div>
      </header>
    </>
  )
}

export default function App() {
  return (
    <div className="min-h-full md:pl-[236px]">
      <Nav />
      <Header />
      <main className="mx-auto max-w-[1120px] px-4 pb-28 pt-4 md:px-6 md:pb-12 md:pt-6">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/log" element={<Log />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </Suspense>
      </main>
      {DemoBar && (
        <Suspense fallback={null}>
          <DemoBar />
        </Suspense>
      )}
    </div>
  )
}
