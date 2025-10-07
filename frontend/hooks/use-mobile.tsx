// frontend/hooks/use-mobile.ts
"use client"

import { useState, useEffect } from "react"

export function useMobile(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    // Check on mount
    checkMobile()

    // Listen for resize events
    window.addEventListener('resize', checkMobile)

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile)
  }, [breakpoint])

  return isMobile
}