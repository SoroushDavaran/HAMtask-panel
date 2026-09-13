import { createContext, useContext, useEffect, useState } from 'react'

const LoadingContext = createContext(null)

export function LoadingProvider({ children }) {
  const [loadingKeys, setLoadingKeys] = useState(() => new Set())

  const register = (key, isLoading) => {
    setLoadingKeys((prev) => {
      const next = new Set(prev)
      if (isLoading) next.add(key)
      else next.delete(key)
      return next
    })
  }

  const isLoading = loadingKeys.size > 0

  return <LoadingContext.Provider value={{ isLoading, register }}>{children}</LoadingContext.Provider>
}

export function useGlobalLoadingFlag() {
  const ctx = useContext(LoadingContext)
  return ctx?.isLoading ?? false
}

// Register this component's loading state with the shell-level dino runner.
export function useGlobalLoading(key, isLoading) {
  const ctx = useContext(LoadingContext)

  useEffect(() => {
    ctx?.register(key, isLoading)
    return () => ctx?.register(key, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])
}
