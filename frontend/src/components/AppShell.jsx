import { Outlet, useNavigate } from 'react-router-dom'
import { Breadcrumb } from 'antd'
import { BreadcrumbProvider, useBreadcrumbCrumbs } from './BreadcrumbContext'

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

function AppShell() {
  const navigate = useNavigate()

  return (
    <BreadcrumbProvider>
      <div className="app-shell">
        <header className="topbar">
          <div className="brand" onClick={() => navigate('/clusters')}>
            <NodeMark />
            <span>کنسول Kubernetes</span>
          </div>
          <TopbarCrumbs />
        </header>
        <Outlet />
      </div>
    </BreadcrumbProvider>
  )
}

export default AppShell
