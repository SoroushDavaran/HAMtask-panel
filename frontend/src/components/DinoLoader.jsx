import { useEffect, useRef, useState } from 'react'

const IDLE_ACTIONS = ['look-left', 'look-right', 'hop', 'wag']

function DinoSvg({ color }) {
  return (
    <svg viewBox="0 0 48 44" width="40" height="36" fill="currentColor" style={{ color }}>
      {/* body + head */}
      <path d="M10 6h8v4h6v4h6v6h4v8h-4v4h-4v-4h-2v4h-4v-4h-8v-4H8v-4H4v-6h4v-4h2V6z" />
      {/* eye */}
      <rect className="dino-eye" x="20" y="10" width="2.5" height="2.5" fill="var(--bg)" />
      {/* front leg (frame A) */}
      <rect className="dino-leg dino-leg-a" x="12" y="32" width="4" height="8" />
      {/* back leg (frame A alt) */}
      <rect className="dino-leg dino-leg-b" x="22" y="32" width="4" height="8" />
      {/* tail */}
      <rect className="dino-tail" x="2" y="20" width="6" height="4" />
    </svg>
  )
}

/**
 * Lives permanently in the corner. While `active` is false it idles there
 * (gentle breathing + the occasional random flourish). While `active` is
 * true it leaves the corner and runs across the top of the screen; when
 * loading finishes it settles back into the corner.
 * Respects prefers-reduced-motion by freezing in place (still visible,
 * just static) — motion is decorative, presence/identity is not.
 */
function DinoLoader({ active, color = 'var(--success)' }) {
  const [reduceMotion, setReduceMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [idleAction, setIdleAction] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e) => setReduceMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Random idle flourish loop — only while parked in the corner.
  useEffect(() => {
    if (active || reduceMotion) return undefined

    const scheduleNext = () => {
      const delay = 4000 + Math.random() * 5000 // every 4–9s
      timerRef.current = setTimeout(() => {
        const action = IDLE_ACTIONS[Math.floor(Math.random() * IDLE_ACTIONS.length)]
        setIdleAction(action)
        setTimeout(() => setIdleAction(null), 900)
        scheduleNext()
      }, delay)
    }
    scheduleNext()

    return () => clearTimeout(timerRef.current)
  }, [active, reduceMotion])

  return (
    <>
      {/* Running mode — crosses the top of the screen while loading */}
      {active && !reduceMotion && (
        <div className="dino-track" role="status" aria-label="در حال بارگذاری">
          <div className="dino-runner">
            <div className="dino-body">
              <DinoSvg color={color} />
              <span className="dino-dust" />
            </div>
          </div>
          <span className="dino-ground" />
        </div>
      )}

      {/* Idle mode — parked mascot in the corner */}
      <div
        className={`dino-corner ${active ? 'dino-corner--hidden' : ''} ${idleAction ? `dino-idle-${idleAction}` : ''}`}
        aria-hidden="true"
      >
        <div className="dino-idle-body">
          <DinoSvg color={color} />
        </div>
      </div>
    </>
  )
}

export default DinoLoader
