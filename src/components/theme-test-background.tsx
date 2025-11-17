'use client'

import { useEffect, useState } from 'react'

export function ThemeTestBackground() {
  const [bgColor, setBgColor] = useState('Loading...')

  useEffect(() => {
    // Update background color display
    const updateBgColor = () => {
      const color = window.getComputedStyle(document.body).backgroundColor
      setBgColor(color)
    }
    
    updateBgColor()
    
    // Set up an interval to check for changes
    const interval = setInterval(updateBgColor, 1000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-4 rounded-lg border">
      <p className="font-medium">Body Background Color:</p>
      <p className="text-lg font-mono">{bgColor}</p>
    </div>
  )
}