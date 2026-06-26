import { useRef, useState, useEffect, useCallback } from 'react'

// 3D ring carousel — ported from the Direction-C design (rotateY + translateZ,
// pointer-drag with snap, and width-animated dots).
const ANG = 46
const R = 430

export default function Carousel3D({ slides }) {
  const ringRef = useRef(null)
  const stageRef = useRef(null)
  const posRef = useRef(0)
  const [active, setActive] = useState(0)
  const n = slides.length

  const layout = useCallback(
    (pos, animate) => {
      const el = ringRef.current
      if (!el) return
      const count = el.children.length || n
      let i = 0
      for (const c of el.children) {
        let rel = (((i - pos) % count) + count) % count
        if (rel > count / 2) rel -= count
        const a = Math.abs(rel)
        c.style.transition = animate && a < 1.5 ? 'transform .55s cubic-bezier(.22,1,.36,1), opacity .3s' : 'transform 0s, opacity .25s'
        c.style.transform = `rotateY(${(rel * ANG).toFixed(3)}deg) translateZ(${R}px)`
        c.style.opacity = '1'
        c.style.zIndex = String(Math.round(1000 - a * 100))
        c.style.pointerEvents = a < 0.5 ? 'auto' : 'none'
        i++
      }
    },
    [n]
  )

  useEffect(() => {
    posRef.current = 0
    const id = requestAnimationFrame(() => layout(0, false))
    return () => cancelAnimationFrame(id)
  }, [layout])

  // Trackpad / horizontal-wheel support while hovering the carousel.
  // Non-passive so we can preventDefault the browser's back/forward swipe;
  // only intercept horizontal intent so vertical page scroll still works.
  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    let snap
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
      e.preventDefault()
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? el.clientWidth : 1
      posRef.current += e.deltaX * unit * 0.0068
      layout(posRef.current, false)
      clearTimeout(snap)
      snap = setTimeout(() => {
        const target = Math.round(posRef.current)
        posRef.current = target
        layout(target, true)
        setActive((((target % n) + n) % n))
      }, 110)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', onWheel)
      clearTimeout(snap)
    }
  }, [layout, n])

  const go = (i) => {
    const p = posRef.current
    let delta = (((i - p) % n) + n) % n
    if (delta > n / 2) delta -= n
    posRef.current = p + delta
    layout(posRef.current, true)
    setActive((((Math.round(posRef.current) % n) + n) % n))
  }

  const onPointerDown = (e) => {
    e.preventDefault()
    const startX = e.clientX
    const base = posRef.current
    if (stageRef.current) stageRef.current.style.cursor = 'grabbing'
    const move = (ev) => {
      posRef.current = base - (ev.clientX - startX) * 0.0068
      layout(posRef.current, false)
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      if (stageRef.current) stageRef.current.style.cursor = 'grab'
      const target = Math.round(posRef.current)
      posRef.current = target
      layout(target, true)
      setActive((((target % n) + n) % n))
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <div>
      <div
        ref={stageRef}
        onPointerDown={onPointerDown}
        style={{
          position: 'relative',
          height: 272,
          margin: '6px -14px 2px',
          overflow: 'hidden',
          perspective: '3200px',
          perspectiveOrigin: 'center 47%',
          touchAction: 'pan-y',
          cursor: 'grab',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        <div ref={ringRef} style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', willChange: 'transform' }}>
          {slides.map((s, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: 344,
                height: 232,
                marginLeft: -172,
                marginTop: -116,
                boxSizing: 'border-box',
                backfaceVisibility: 'hidden',
                willChange: 'transform,opacity',
              }}
            >
              {s}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: -2 }}>
        {slides.map((_, i) => (
          <div
            key={i}
            onClick={() => go(i)}
            style={{
              width: i === active ? 22 : 7,
              height: 7,
              borderRadius: 99,
              cursor: 'pointer',
              transition: 'width .3s, background .3s',
              background: i === active ? 'var(--accent)' : 'var(--track)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
