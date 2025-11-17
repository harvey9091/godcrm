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
    document.documentElement.classList.toggle('dark', effectiveTheme === 'dark')
  }, [effectiveTheme])

  useEffect(() => {
    // Save theme preference
    if (theme !== 'system') {
      localStorage.setItem('theme', theme)
    }
    
    // Update effective theme when theme changes
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const effective = theme === 'system' 
      ? (systemPrefersDark ? 'dark' : 'light')
      : theme
      
    setEffectiveTheme(effective)
    document.documentElement.classList.toggle('dark', effective === 'dark')
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