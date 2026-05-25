import { useState, useEffect, useRef } from "react"

export function useDelayedLoading(isLoading: boolean, minMs = 300): boolean {
  const [show, setShow] = useState(isLoading)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    if (isLoading) {
      startRef.current = Date.now()
      setShow(true) // eslint-disable-line react-hooks/set-state-in-effect
    } else if (startRef.current !== null) {
      const elapsed = Date.now() - startRef.current
      const remaining = minMs - elapsed
      if (remaining > 0) {
        const timer = setTimeout(() => setShow(false), remaining)
        return () => clearTimeout(timer)
      }
      setShow(false)
      startRef.current = null
    }
  }, [isLoading, minMs])

  return show
}
