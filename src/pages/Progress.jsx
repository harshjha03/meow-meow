import { useState } from 'react'
import { useSessions, useMocks } from '../lib/storage'
import { mockSeries, volumeSeries, accuracySeries, sectionAverages, dayWindow, linePath, areaPath } from '../lib/stats'
import Segmented from '../components/Segmented'

const RANGE_OPTS = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' },
]

function Empty({ label }) {
  return <div className="flex h-full items-center justify-center text-sm text-muted2">{label}</div>
}

export default function Progress() {
  const [range, setRange] = useState('week')
  const sessions = useSessions()
  const mocks = useMocks()

  const mSeries = mockSeries(mocks, range)
  const mLine = linePath(mSeries.map((m) => m.percentile))
  const mLast = mSeries.length ? mSeries[mSeries.length - 1].percentile : 0

  const days = dayWindow(range)
  const vol = volumeSeries(sessions, days)
  const volTotal = vol.reduce((a, b) => a + b.value, 0)

  const accArr = accuracySeries(sessions, days)
  const accLine = linePath(accArr)
  const accLast = accArr.length ? accArr[accArr.length - 1] : 0

  const secAvg = sectionAverages(mocks)

  return (
    <div className="mx-auto flex max-w-[1080px] animate-fade-up flex-col gap-4">
      <h1 className="text-[23px] font-bold tracking-[-.5px] text-ink md:hidden">Progress</h1>
      <Segmented options={RANGE_OPTS} value={range} onChange={setRange} />

      {/* mock percentile trend */}
      <div className="card p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[15px] font-semibold text-ink">Mock percentile trend</div>
            <div className="mt-0.5 text-xs text-muted2">{mSeries.length} mocks shown</div>
          </div>
          <div className="text-right">
            <div className="text-[28px] font-bold text-accent">{mLast}</div>
            <div className="text-[11px] text-muted2">latest %ile</div>
          </div>
        </div>
        <div className="relative mt-3.5 h-40">
          {mSeries.length ? (
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ display: 'block' }}>
              <path d={areaPath(mLine)} fill="rgba(108,77,246,.10)" />
              <path d={mLine} fill="none" stroke="var(--accent)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
          ) : (
            <Empty label="Log a mock to see the trend" />
          )}
        </div>
        {mSeries.length > 0 && (
          <div className="mt-2 flex justify-between">
            {mSeries.map((m, i) => (
              <div key={i} className="flex-1 text-center">
                <div className="text-[13px] font-bold text-ink">{m.percentile}</div>
                <div className="truncate text-[10px] text-muted2">{m.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* volume + accuracy */}
      <div className="flex flex-wrap gap-4">
        <div className="card min-w-[300px] flex-1 p-5">
          <div className="flex items-baseline justify-between">
            <span className="text-[15px] font-semibold text-ink">Question volume</span>
            <span className="text-xs text-muted2">{volTotal} total</span>
          </div>
          <div className="mt-4 flex h-[120px] items-end gap-1">
            {volTotal > 0 ? (
              vol.map((b, i) => (
                <div key={i} style={{ flex: 1, background: b.color, borderRadius: '3px 3px 0 0', height: b.hPct, minHeight: 2 }} />
              ))
            ) : (
              <Empty label="No practice in this range yet" />
            )}
          </div>
        </div>

        <div className="card min-w-[300px] flex-1 p-5">
          <div className="flex items-start justify-between">
            <span className="text-[15px] font-semibold text-ink">Accuracy trend</span>
            <div className="text-right text-[22px] font-bold text-lrdi">{accLast}%</div>
          </div>
          <div className="relative mt-4 h-[120px]">
            {accArr.length ? (
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ display: 'block' }}>
                <path d={areaPath(accLine)} fill="rgba(19,185,129,.10)" />
                <path d={accLine} fill="none" stroke="#13B981" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
            ) : (
              <Empty label="No practice in this range yet" />
            )}
          </div>
        </div>
      </div>

      {/* section averages */}
      <div className="card p-5">
        <div className="mb-3.5 text-[15px] font-semibold text-ink">Section averages · across mocks</div>
        <div className="flex flex-col gap-3">
          {secAvg.map((s) => (
            <div key={s.key} className="flex items-center gap-3">
              <div className="w-12 text-xs font-bold" style={{ color: s.color }}>{s.key}</div>
              <div className="h-2 flex-1 overflow-hidden rounded bg-track">
                <div style={{ height: '100%', borderRadius: 4, background: s.color, width: s.barPct, transition: 'width .8s cubic-bezier(.22,1,.36,1)' }} />
              </div>
              <div className="w-14 text-right text-[13px] font-bold text-ink">{s.avg}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
