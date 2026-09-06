import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const BreadcrumbContext = createContext(null)

export function BreadcrumbProvider({ children }) {
  const [crumbs, setCrumbs] = useState([])
  const value = useMemo(() => ({ crumbs, setCrumbs }), [crumbs])
  return <BreadcrumbContext.Provider value={value}>{children}</BreadcrumbContext.Provider>
}

export function useBreadcrumbCrumbs() {
  const ctx = useContext(BreadcrumbContext)
  return ctx?.crumbs ?? []
}

// items: [{ title, onClick? }]
export function useBreadcrumb(items) {
  const ctx = useContext(BreadcrumbContext)
  const key = JSON.stringify(items.map((i) => i.title))

  useEffect(() => {
    ctx?.setCrumbs(items)
    return () => ctx?.setCrumbs([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
}
