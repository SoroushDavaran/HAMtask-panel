import { ArrowRightOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { useRef, useState } from 'react'

export function StatusPill({ tone = 'idle', live = false, children }) {
  return (
    <span className={`status-pill ${tone}${live ? ' live' : ''}`}>
      <span className="status-dot" />
      {children}
    </span>
  )
}

export function PageHeader({ backLabel, onBack, title, subtitle, actions }) {
  return (
    <div className="page-header">
      {onBack && (
        <Button type="text" className="back-link" icon={<ArrowRightOutlined />} onClick={onBack}>
          {backLabel}
        </Button>
      )}
      <div className="page-header-row">
        <div className="page-title-row">
          <h2>{title}</h2>
          {subtitle && <span className="page-subtitle">{subtitle}</span>}
        </div>
        {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
      </div>
    </div>
  )
}

export function StatStrip({ items }) {
  return (
    <div className="stat-strip">
      {items.map((it) => (
        <div className={`stat-cell${it.accent ? ' accent' : ''}`} key={it.label}>
          <span className="stat-value">{it.value}</span>
          <span className="stat-label">{it.label}</span>
        </div>
      ))}
    </div>
  )
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-icon">{icon}</div>}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  )
}

export function LoadingState({ label = 'در حال بارگذاری…' }) {
  return (
    <div className="loading-strip">
      <div className="spinner" />
      <span>{label}</span>
    </div>
  )
}

// Card with pointer-tracked 3D tilt + cursor-glow + hover texture.
export function EntityCard({ status = 'idle', onClick, children }) {
  const ref = useRef(null)

  const handleMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const rotateY = (px - 0.5) * 10
    const rotateX = (py - 0.5) * -10
    el.style.setProperty('--tilt-x', `${rotateX.toFixed(2)}deg`)
    el.style.setProperty('--tilt-y', `${rotateY.toFixed(2)}deg`)
    el.style.setProperty('--glow-x', `${(px * 100).toFixed(1)}%`)
    el.style.setProperty('--glow-y', `${(py * 100).toFixed(1)}%`)
  }

  const handleLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--tilt-x', '0deg')
    el.style.setProperty('--tilt-y', '0deg')
  }

  return (
    <div
      ref={ref}
      className={`entity-card status-${status}`}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <span className="card-texture" aria-hidden="true" />
      <span className="card-glow" aria-hidden="true" />
      <div className="card-body">{children}</div>
    </div>
  )
}

export function CardSkeletonGrid({ count = 6 }) {
  return (
    <div className="card-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div className="skeleton-card" key={i}>
          <div className="sk sk-title" />
          <div className="sk sk-line" />
          <div className="sk sk-line short" />
        </div>
      ))}
    </div>
  )
}

// Click a technical value (address, image tag, pod name…) to copy it.
export function CopyValue({ value, className = '' }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      // Clipboard API unavailable (insecure context, permissions) — fail quietly.
    }
  }

  return (
    <span
      className={`copy-value${copied ? ' copied' : ''} ${className}`}
      onClick={handleCopy}
      title="برای کپی کلیک کنید"
    >
      {value}
      <span className="copy-hint">{copied ? 'کپی شد' : 'کپی'}</span>
    </span>
  )
}
