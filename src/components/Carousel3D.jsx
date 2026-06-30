import { useRef, useState, useEffect, useCallback } from 'react'

// 3D ring carousel — ported from the Direction-C design (rotateY + translateZ,
// pointer-drag + horizontal-wheel with snap, width-animated dots).
// Card size is responsive: on mobile it fills the container width (so it lines
// up with the recent-sessions card); on desktop it keeps the original 344px.
const ANG = 46
const BASE_W = 344
const BASE_R = 430
const BASE_H = 232

export default function Carousel3D({ slides }) {
  const rootRef = useRef(null)
  const ringRef = useRef(null)
  const stageRef = useRef(null)
  const posRef = useRef(0)
  const [active, setActive] = useState(0)
  const [dim, setDim] = useState({ cardW: BASE_W, cardH: BASE_H, stageH: BASE_H + 40, R: BASE_R, boost: 0 })
  const n = slides.length

  // Measure the container and size cards responsively.
  // The front card is at translateZ(BASE_R) under a 3200px perspective, so it
  // renders ~1.155x bigger than its CSS size. Pre-shrink the CSS width by that
  // factor so the rendered front card equals the container (recent-card) width.
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const PERSP = 3200
    const measure = () => {
      const w = el.clientWidth
      if (!w) return
      const narrow = w < 768 // mobile / tablet → match the content width
      // On mobile, pull the active card forward so neighbors can't paint over it
      // (z-index is ignored under preserve-3d), then size it for that magnification.
      const boost = narrow ? 70 : 0
      const frontScale = PERSP / (PERSP - (BASE_R + boost))
      // Inset the front card on mobile so neighbour cards peek on both sides
      // → the carousel reads as swipeable. (1 = full content width, no peek.)
      const PEEK = 0.92
      const cardW = narrow ? Math.round((w * PEEK) / frontScale) : BASE_W
      const cardH = narrow ? Math.round(BASE_H * 0.9) : BASE_H // ~10% shorter on mobile
      const stageH = narrow ? Math.round(cardH * frontScale) + 14 : BASE_H + 40
      setDim({ cardW, cardH, stageH, R: BASE_R, boost })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

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
        const forward = (1 - Math.min(a, 1)) * dim.boost // active card pulled toward viewer
        c.style.transition = animate && a < 1.5 ? 'transform .55s cubic-bezier(.22,1,.36,1), opacity .3s' : 'transform 0s, opacity .25s'
        c.style.transform = `rotateY(${(rel * ANG).toFixed(3)}deg) translateZ(${dim.R + forward}px)`
        c.style.opacity = '1'
        c.style.zIndex = String(Math.round(1000 - a * 100))
        c.style.pointerEvents = a < 0.5 ? 'auto' : 'none'
        i++
      }
    },
    [n, dim.R, dim.boost]
  )

  // (re)layout on mount and whenever sizing changes
  useEffect(() => {
    const id = requestAnimationFrame(() => layout(posRef.current, false))
    return () => cancelAnimationFrame(id)
  }, [layout])

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

  // Trackpad / horizontal-wheel support while hovering the carousel.
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

  return (
    <div ref={rootRef}>
      <div
        ref={stageRef}
        onPointerDown={onPointerDown}
        style={{
          position: 'relative',
          height: dim.stageH,
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
                width: dim.cardW,
                height: dim.cardH,
                marginLeft: -dim.cardW / 2,
                marginTop: -dim.cardH / 2,
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
      <div style={{ display: 'flex', justifyContent: 'center', gap: 7, marginTop: 4 }}>
        {slides.map((_, i) => (
          <div
            key={i}
            onClick={() => go(i)}
            style={{
              width: i === active ? 26 : 8,
              height: 8,
              borderRadius: 99,
              cursor: 'pointer',
              transition: 'width .3s, background .3s',
              background: i === active ? 'var(--accent)' : 'rgba(108,77,246,.25)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
