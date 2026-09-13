import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Breadcrumb } from 'antd'
import { BreadcrumbProvider, useBreadcrumbCrumbs } from './BreadcrumbContext'
import { LoadingProvider, useGlobalLoadingFlag } from './LoadingContext'
import BackgroundCustomizer from './BackgroundCustomizer'
import DinoLoader from './DinoLoader'
import NodeNetworkBackground from './NodeNetworkBackground'
import CustomCursor from './CustomCursor'
import CommandPalette from './CommandPalette'
import { IconSearch } from '@tabler/icons-react'

function NodeMark() {
  return (
    <svg className="node-mark" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="4.5" fill="#4f8cff" />
      <circle cx="24" cy="10" r="3" fill="#3dd68c" />
      <circle cx="35.4" cy="17" r="3" fill="#4f8cff" />
      <circle cx="35.4" cy="31" r="3" fill="#4f8cff" />
      <circle cx="24" cy="38" r="3" fill="#4f8cff" />
      <circle cx="12.6" cy="31" r="3" fill="#4f8cff" />
      <circle cx="12.6" cy="17" r="3" fill="#4f8cff" />
      <path
        d="M24 10V24M35.4 17L24 24M35.4 31L24 24M24 38V24M12.6 31L24 24M12.6 17L24 24"
        stroke="#2a3644"
        strokeWidth="1.6"
      />
    </svg>
  )
}

function TopbarCrumbs() {
  const crumbs = useBreadcrumbCrumbs()
  if (!crumbs.length) return null
  return (
    <div className="topbar-crumbs">
      <Breadcrumb
        items={crumbs.map((c) => ({
          title: c.onClick ? (
            <span style={{ cursor: 'pointer' }} onClick={c.onClick}>
              {c.title}
            </span>
          ) : (
            c.title
          ),
        }))}
      />
    </div>
  )
}

function ShellDino() {
  const isLoading = useGlobalLoadingFlag()
  return <DinoLoader active={isLoading} />
}

function AppShell() {
  const navigate = useNavigate()
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      const isK = e.key === 'k' || e.key === 'K'
      if ((e.ctrlKey || e.metaKey) && isK) {
        e.preventDefault()
        setPaletteOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <BreadcrumbProvider>
      <LoadingProvider>
        <div className="app-shell">
          <NodeNetworkBackground />
          <span className="aurora-blob blob-a" aria-hidden="true" />
          <span className="aurora-blob blob-b" aria-hidden="true" />
          <span className="user-bg-layer" aria-hidden="true" />
          <CustomCursor />

          <header className="topbar">
            <div className="brand" onClick={() => navigate('/clusters')}>
              <NodeMark />
              <span>کنسول Kubernetes</span>
            </div>
            <TopbarCrumbs />
            <button className="search-trigger" onClick={() => setPaletteOpen(true)}>
              <IconSearch size={15} />
              <span>جستجو</span>
              <kbd>Ctrl K</kbd>
            </button>
          </header>

          <ShellDino />

          <Outlet />

          <BackgroundCustomizer />
          <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
        </div>
      </LoadingProvider>
    </BreadcrumbProvider>
  )
}

export default AppShell
