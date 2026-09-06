import { ArrowRightOutlined } from '@ant-design/icons'
import { Button } from 'antd'

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
