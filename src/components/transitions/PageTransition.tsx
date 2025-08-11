import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

interface PageTransitionProps {
  children: React.ReactNode
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [displayChildren, setDisplayChildren] = useState(children)
  const location = useLocation()

  useEffect(() => {
    // Fade out
    setIsVisible(false)
    
    const timer = setTimeout(() => {
      // Update content and fade in
      setDisplayChildren(children)
      setIsVisible(true)
    }, 150)

    return () => clearTimeout(timer)
  }, [location.pathname, children])

  useEffect(() => {
    // Initial mount
    setIsVisible(true)
  }, [])

  return (
    <div
      className={`transition-all duration-300 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-4 scale-98'
      }`}
    >
      {displayChildren}
    </div>
  )
}

export default PageTransition