import { NavLink } from 'react-router-dom'
import { HomeIcon, PencilIcon, ChartIcon, CalendarIcon, UserIcon, PlusIcon, MeowLogo, FlameGlyph } from './icons'
import { useSessions } from '../lib/storage'
import { computeStreak } from '../lib/streak'
import { useAuth } from '../context/AuthContext'

const sideItems = [
  { to: '/', label: 'Dashboard', Icon: HomeIcon, end: true },
  { to: '/log', label: 'Log', Icon: PencilIcon },
  { to: '/progress', label: 'Progress', Icon: ChartIcon },
  { to: '/planner', label: 'Planner', Icon: CalendarIcon },
]

export default function Nav() {
  const sessions = useSessions()
  const streak = computeStreak(sessions)
  const { configured, user, signIn, signOut } = useAuth()

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="fixed inset-y-0 left-0 z-30 hidden w-[236px] flex-col border-r border-line bg-card px-4 py-6 md:flex"
        style={{ boxShadow: '6px 0 28px -18px rgba(58,46,28,.30)' }}
      >
        <div className="flex items-center gap-2.5 px-2 pb-6">
          <MeowLogo width={28} height={26} />
          <span className="text-[18px] font-bold tracking-[-.4px] text-ink">Meow Meow</span>
        </div>
        <nav className="flex flex-col gap-1">
          {sideItems.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                'flex items-center gap-3 rounded-[9px] px-3 py-2.5 text-sm font-semibold transition ' +
                (isActive ? 'bg-accent text-white' : 'text-muted hover:bg-soft')
              }
            >
              <Icon className="h-[19px] w-[19px]" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="flex-1" />
        <div className="mb-3 rounded-xl bg-soft px-4 py-4">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <FlameGlyph width={11} height={14} /> Current streak
          </div>
          <div className="mt-1 text-[28px] font-bold leading-none text-text">
            {streak.count} <span className="text-sm font-medium text-muted">days</span>
          </div>
        </div>
        {configured &&
          (user ? (
            <button onClick={() => signOut()} className="rounded-[10px] bg-[#E2F6EE] py-3 text-center text-[13.5px] font-semibold text-lrdi">
              Logged in · Synced
            </button>
          ) : (
            <button onClick={() => signIn()} className="rounded-[10px] bg-accent py-3 text-center text-[13.5px] font-semibold text-white">
              Log in with Google
            </button>
          ))}
      </aside>

      {/* Mobile bottom nav with center FAB */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card safe-b md:hidden"
        style={{ boxShadow: '0 -8px 28px -12px rgba(58,46,28,.16)' }}
      >
        <div className="mx-auto flex max-w-md items-center justify-around px-5 pb-4 pt-2.5">
          <BottomItem to="/" end Icon={HomeIcon} label="Home" />
          <BottomItem to="/progress" Icon={ChartIcon} label="Progress" />
          <NavLink
            to="/log"
            className="-mt-7 flex h-[54px] w-[54px] flex-shrink-0 items-center justify-center rounded-full border-4 border-white bg-accent shadow-fab"
            aria-label="Log a session"
          >
            <PlusIcon className="h-7 w-7 text-white" />
          </NavLink>
          <BottomItem to="/planner" Icon={CalendarIcon} label="Planner" />
          <BottomItem to="/profile" Icon={UserIcon} label="Profile" dot={!!user} />
        </div>
      </nav>
    </>
  )
}

function BottomItem({ to, end, Icon, label, dot }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        'flex flex-col items-center gap-0.5 py-1 text-[10px] font-semibold transition ' +
        (isActive ? 'text-accent' : 'text-[#b6b3ab]')
      }
    >
      <span className="relative flex">
        <Icon className="h-[22px] w-[22px]" />
        {dot && <span className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full border-[1.5px] border-card bg-lrdi" />}
      </span>
      {label}
    </NavLink>
  )
}
