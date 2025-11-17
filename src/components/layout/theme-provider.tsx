'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

type ThemeContextType = {
  theme: Theme
  effectiveTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Server-side default
    if (typeof window === 'undefined') {
      return 'system'
    }
    
    // Client-side initialization
    const savedTheme = localStorage.getItem('theme') as Theme | null
    return savedTheme || 'system'
  })
  
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(() => {
    // Server-side default
    if (typeof window === 'undefined') {
      return 'light'
    }
    
    // Client-side initialization
    const savedTheme = localStorage.getItem('theme') as Theme | null
    const initialTheme = savedTheme || 'system'
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    return initialTheme === 'system' 
      ? (systemPrefersDark ? 'dark' : 'light')
      : initialTheme
  })

  useEffect(() => {
    // Apply theme to document when component mounts
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(effectiveTheme)
    
    // Also apply to body for consistency
    const body = document.body
    body.classList.remove('light', 'dark')
    body.classList.add(effectiveTheme)
  }, [effectiveTheme])

  useEffect(() => {
    // Save theme preference
    if (theme !== 'system') {
      localStorage.setItem('theme', theme)
    }
  }, [theme])
  
  useEffect(() => {
    // Handle system theme changes
    const handleSystemThemeChange = () => {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const newEffectiveTheme = theme === 'system' 
        ? (systemPrefersDark ? 'dark' : 'light')
        : theme
      
      setEffectiveTheme(newEffectiveTheme)
      
      // Apply theme classes
      const root = document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(newEffectiveTheme)
      
      const body = document.body
      body.classList.remove('light', 'dark')
      body.classList.add(newEffectiveTheme)
    }
    
    // Apply theme immediately
    handleSystemThemeChange()
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', handleSystemThemeChange)
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}