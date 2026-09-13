import { useEffect, useRef } from 'react'

// Lightweight canvas particle network — nodes drift slowly and connect to
// nearby neighbours with a thin line, evoking a cluster topology graph.
// Pauses when the tab is hidden and renders a single static frame when the
// user prefers reduced motion.
function NodeNetworkBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let nodes = []
    let raf = null
    let running = true

    const getAccent = () => {
      const style = getComputedStyle(document.documentElement)
      return style.getPropertyValue('--accent-strong').trim() || '#77a6ff'
    }

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.max(24, Math.min(60, Math.round((width * height) / 34000)))
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.4 + 0.6,
      }))
    }

    const step = () => {
      if (!running) return
      const accent = getAccent()
      ctx.clearRect(0, 0, width, height)

      for (const n of nodes) {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0 || n.x > width) n.vx *= -1
        if (n.y < 0 || n.y > height) n.vy *= -1
      }

      const linkDist = Math.min(160, width / 8)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < linkDist) {
            ctx.globalAlpha = (1 - dist / linkDist) * 0.16
            ctx.strokeStyle = accent
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      ctx.globalAlpha = 0.5
      ctx.fillStyle = accent
      for (const n of nodes) {
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      raf = requestAnimationFrame(step)
    }

    const handleVisibility = () => {
      running = !document.hidden
      if (running && !prefersReducedMotion) {
        raf = requestAnimationFrame(step)
      } else if (raf) {
        cancelAnimationFrame(raf)
      }
    }

    resize()
    step()
    if (prefersReducedMotion && raf) cancelAnimationFrame(raf)

    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      running = false
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  return <canvas ref={canvasRef} className="node-network-bg" aria-hidden="true" />
}

export default NodeNetworkBackground
