import { useEffect, useRef, useState } from 'react'

const IDLE_ACTIONS = ['look-left', 'look-right', 'hop', 'wag']

function DinoSvg({ color }) {
  return (
    <svg viewBox="0 0 64 56" width="46" height="40" fill="currentColor" style={{ color, overflow: 'visible' }}>
      {/* tail — trails behind on the right */}
      <path className="dino-tail" d="M46 26 Q60 21 62 9 Q55 19 44 21 Z" />

      {/* back leg (frame B) */}
      <g className="dino-leg dino-leg-b">
        <rect x="33" y="41" width="8" height="11" rx="4" />
        <ellipse cx="37" cy="53" rx="5.5" ry="2.6" />
      </g>
      {/* front leg (frame A) */}
      <g className="dino-leg dino-leg-a">
        <rect x="19" y="41" width="8" height="11" rx="4" />
        <ellipse cx="23" cy="53" rx="5.5" ry="2.6" />
      </g>

      {/* tiny arm */}
      <path d="M25 31c3 0.6 5.2 3 5 6.2c-1.6-1.7-3.6-2.7-5.6-2.6z" />

      {/* body */}
      <ellipse cx="30" cy="29" rx="17" ry="15" />
      {/* belly highlight */}
      <ellipse cx="27" cy="36" rx="10" ry="6.5" fill="#fff" opacity="0.14" />

      {/* back spikes */}
      <polygon points="16,13 19,4 22,13" />
      <polygon points="22,11 25,3 28,11" />
      <polygon points="28,12 31,5.5 34,12.5" />

      {/* head */}
      <circle cx="14" cy="19" r="11" />
      {/* snout */}
      <ellipse cx="3.5" cy="21" rx="4.5" ry="3.6" />

      {/* eye */}
      <circle className="dino-eye" cx="11" cy="17" r="3.2" fill="var(--bg)" />
      <circle cx="10" cy="16" r="1" fill="#fff" opacity="0.9" />
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
