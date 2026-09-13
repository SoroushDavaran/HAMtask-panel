import { useEffect, useState } from 'react'

/**
 * A small dinosaur that runs across the screen while `active` is true.
 * Purely decorative loading cue — sits on top of whatever skeleton/loading
 * state the page already shows. Respects prefers-reduced-motion by simply
 * not rendering (motion is the entire point of this component).
 */
function DinoLoader({ active, color = 'var(--success)' }) {
  const [reduceMotion, setReduceMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e) => setReduceMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  if (!active || reduceMotion) return null

  return (
    <div className="dino-track" role="status" aria-label="در حال بارگذاری">
      <div className="dino-runner">
        <div className="dino-body" style={{ color }}>
          <svg viewBox="0 0 48 44" width="40" height="36" fill="currentColor">
            {/* body + head */}
            <path d="M10 6h8v4h6v4h6v6h4v8h-4v4h-4v-4h-2v4h-4v-4h-8v-4H8v-4H4v-6h4v-4h2V6z" />
            {/* eye */}
            <rect x="20" y="10" width="2.5" height="2.5" fill="var(--bg)" />
            {/* front leg (frame A) */}
            <rect className="dino-leg dino-leg-a" x="12" y="32" width="4" height="8" />
            {/* back leg (frame A alt) */}
            <rect className="dino-leg dino-leg-b" x="22" y="32" width="4" height="8" />
          </svg>
          <span className="dino-dust" />
        </div>
      </div>
      <span className="dino-ground" />
    </div>
  )
}

export default DinoLoader
