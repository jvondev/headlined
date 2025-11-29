
import * as React from "react"

export function useViewport() {
  const [width, setWidth] = React.useState<number | undefined>(undefined)

  React.useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth)
    }
    window.addEventListener("resize", handleResize)
    handleResize()
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return { width }
}
