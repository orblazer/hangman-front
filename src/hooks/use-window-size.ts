import { debounce } from 'lodash'
import { useState, useEffect } from 'react'
import { supportSSR } from '../utils/ssr-support'

export interface WindowSize {
  width: number
  height: number
}

export default function useWindowSize(): WindowSize {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState(
    supportSSR<WindowSize>(
      () => ({
        width: window.innerWidth,
        height: window.innerHeight
      }),
      { width: 1200, height: 800 }
    )
  )

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    // Add event listener
    window.addEventListener('resize', debounce(handleResize, 300))

    // Call handler right away so state gets updated with initial window size
    handleResize()

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, []) // Empty array ensures that effect is only run on mount

  return windowSize
}
