import { useCallback, useEffect, useState } from 'react'

export const PRESETS = {
  blue: {
    label: 'آبی',
    accent: '#4f8cff',
    accentStrong: '#77a6ff',
    accentSoft: 'rgba(79, 140, 255, 0.12)',
    accentBorder: 'rgba(79, 140, 255, 0.35)',
    auroraA: 'rgba(79, 140, 255, 0.22)',
    auroraB: 'rgba(61, 214, 140, 0.14)',
  },
  emerald: {
    label: 'زمردی',
    accent: '#3dd68c',
    accentStrong: '#6ee6ab',
    accentSoft: 'rgba(61, 214, 140, 0.12)',
    accentBorder: 'rgba(61, 214, 140, 0.35)',
    auroraA: 'rgba(61, 214, 140, 0.22)',
    auroraB: 'rgba(79, 140, 255, 0.14)',
  },
  violet: {
    label: 'بنفش',
    accent: '#9b7bff',
    accentStrong: '#b6a0ff',
    accentSoft: 'rgba(155, 123, 255, 0.12)',
    accentBorder: 'rgba(155, 123, 255, 0.35)',
    auroraA: 'rgba(155, 123, 255, 0.22)',
    auroraB: 'rgba(242, 85, 90, 0.1)',
  },
  amber: {
    label: 'کهربایی',
    accent: '#f2b84b',
    accentStrong: '#f7cd7c',
    accentSoft: 'rgba(242, 184, 75, 0.12)',
    accentBorder: 'rgba(242, 184, 75, 0.35)',
    auroraA: 'rgba(242, 184, 75, 0.2)',
    auroraB: 'rgba(79, 140, 255, 0.12)',
  },
  rose: {
    label: 'رز',
    accent: '#f2555a',
    accentStrong: '#f78488',
    accentSoft: 'rgba(242, 85, 90, 0.12)',
    accentBorder: 'rgba(242, 85, 90, 0.35)',
    auroraA: 'rgba(242, 85, 90, 0.2)',
    auroraB: 'rgba(155, 123, 255, 0.12)',
  },
}

const STORAGE_KEY = 'k8s-console-ui-settings-v1'
const DEFAULTS = { preset: 'blue', bgImage: null, bgOpacity: 18, bgBlur: 2 }

function loadSettings() {
  if (typeof window === 'undefined') return DEFAULTS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return DEFAULTS
  }
}

function applyToDom(settings) {
  const root = document.documentElement
  const preset = PRESETS[settings.preset] || PRESETS.blue
  root.style.setProperty('--accent', preset.accent)
  root.style.setProperty('--accent-strong', preset.accentStrong)
  root.style.setProperty('--accent-soft', preset.accentSoft)
  root.style.setProperty('--accent-border', preset.accentBorder)
  root.style.setProperty('--aurora-a', preset.auroraA)
  root.style.setProperty('--aurora-b', preset.auroraB)
  root.style.setProperty('--user-bg-opacity', String(settings.bgOpacity / 100))
  root.style.setProperty('--user-bg-blur', `${settings.bgBlur}px`)
  root.style.setProperty('--user-bg-image', settings.bgImage ? `url(${settings.bgImage})` : 'none')
}

export function useUiCustomization() {
  const [settings, setSettings] = useState(loadSettings)

  useEffect(() => {
    applyToDom(settings)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // localStorage may be unavailable (private mode / quota) — customization
      // simply won't persist across reloads in that case.
    }
  }, [settings])

  const setPreset = useCallback((preset) => setSettings((s) => ({ ...s, preset })), [])
  const setBgImage = useCallback((bgImage) => setSettings((s) => ({ ...s, bgImage })), [])
  const setBgOpacity = useCallback((bgOpacity) => setSettings((s) => ({ ...s, bgOpacity })), [])
  const setBgBlur = useCallback((bgBlur) => setSettings((s) => ({ ...s, bgBlur })), [])
  const resetBg = useCallback(() => setSettings((s) => ({ ...s, bgImage: null })), [])

  return { settings, setPreset, setBgImage, setBgOpacity, setBgBlur, resetBg }
}
