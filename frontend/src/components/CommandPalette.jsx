import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal, Input, Spin } from 'antd'
import { IconSearch, IconServer2, IconStack2, IconApps, IconCornerDownLeft } from '@tabler/icons-react'
import { getClusters } from '../api/clusters'
import { getNamespaces } from '../api/namespaces'
import { getApps } from '../api/apps'

const TYPE_META = {
  cluster: { label: 'کلاستر', icon: IconServer2 },
  namespace: { label: 'Namespace', icon: IconStack2 },
  app: { label: 'App', icon: IconApps },
}

function CommandPalette({ open, onOpenChange }) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [index, setIndex] = useState(null) // null = not indexed yet
  const [indexing, setIndexing] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  // Build a flat, searchable index of clusters → namespaces → apps.
  const buildIndex = useCallback(async () => {
    setIndexing(true)
    try {
      const clusters = await getClusters()
      const entries = clusters.map((c) => ({
        type: 'cluster',
        id: `c-${c.id}`,
        title: c.name,
        subtitle: c.address,
        path: `/clusters/${c.id}/namespaces`,
      }))

      const namespacesByCluster = await Promise.all(
        clusters.map((c) => getNamespaces(c.id).then((ns) => ({ cluster: c, ns })).catch(() => ({ cluster: c, ns: [] }))),
      )

      for (const { cluster, ns } of namespacesByCluster) {
        for (const n of ns) {
          entries.push({
            type: 'namespace',
            id: `n-${n.id}`,
            title: n.name,
            subtitle: `کلاستر: ${cluster.name}`,
            path: `/clusters/${cluster.id}/namespaces/${n.id}`,
          })
        }
      }

      const appsByNamespace = await Promise.all(
        namespacesByCluster.flatMap(({ ns }) =>
          ns.map((n) => getApps(n.id).then((apps) => ({ ns: n, apps })).catch(() => ({ ns: n, apps: [] }))),
        ),
      )

      for (const { ns, apps } of appsByNamespace) {
        for (const a of apps) {
          entries.push({
            type: 'app',
            id: `a-${a.id}`,
            title: a.name,
            subtitle: `Namespace: ${ns.name} · ${a.image}`,
            path: `/apps/${a.id}`,
          })
        }
      }

      setIndex(entries)
    } catch {
      setIndex([])
    } finally {
      setIndexing(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      if (index === null) buildIndex()
      setTimeout(() => inputRef.current?.focus(), 60)
    }
  }, [open, index, buildIndex])

  const results = useMemo(() => {
    if (!index) return []
    const q = query.trim().toLowerCase()
    if (!q) return index.slice(0, 8)
    return index.filter((item) => item.title.toLowerCase().includes(q) || item.subtitle?.toLowerCase().includes(q)).slice(0, 20)
  }, [index, query])

  const goTo = (item) => {
    onOpenChange(false)
    navigate(item.path)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[activeIndex]) {
      goTo(results[activeIndex])
    }
  }

  return (
    <Modal
      open={open}
      onCancel={() => onOpenChange(false)}
      footer={null}
      closable={false}
      width={560}
      className="command-palette-modal"
      styles={{ body: { padding: 0 } }}
    >
      <div className="cmdk">
        <div className="cmdk-input-row">
          <IconSearch size={18} className="cmdk-search-icon" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActiveIndex(0)
            }}
            onKeyDown={handleKeyDown}
            placeholder="جستجوی کلاستر، Namespace یا App…"
            variant="borderless"
            autoFocus
          />
          <kbd className="cmdk-kbd">Esc</kbd>
        </div>

        <div className="cmdk-results">
          {indexing && index === null ? (
            <div className="cmdk-empty">
              <Spin size="small" /> <span>در حال ساخت فهرست جستجو…</span>
            </div>
          ) : results.length === 0 ? (
            <div className="cmdk-empty">چیزی پیدا نشد</div>
          ) : (
            results.map((item, i) => {
              const meta = TYPE_META[item.type]
              const Icon = meta.icon
              return (
                <button
                  key={item.id}
                  className={`cmdk-item${i === activeIndex ? ' active' : ''}`}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => goTo(item)}
                >
                  <span className="cmdk-item-icon">
                    <Icon size={16} />
                  </span>
                  <span className="cmdk-item-text">
                    <span className="cmdk-item-title">{item.title}</span>
                    {item.subtitle && <span className="cmdk-item-subtitle">{item.subtitle}</span>}
                  </span>
                  <span className="cmdk-item-type">{meta.label}</span>
                  {i === activeIndex && <IconCornerDownLeft size={14} className="cmdk-enter-icon" />}
                </button>
              )
            })
          )}
        </div>
      </div>
    </Modal>
  )
}

export default CommandPalette
