import { useEffect, useRef, useState } from 'react'
import { getLoadingCount, onLoadingChange } from '../../utils/loadingBus'

export default function GlobalOverlay({ delay = 300 }) {
  const [visible, setVisible] = useState(false)
  const timer = useRef(null)

  useEffect(() => {
    const off = onLoadingChange((count) => {
      if (count > 0) {
        if (!timer.current) {
          timer.current = setTimeout(() => {
            setVisible(true)
            timer.current = null
          }, delay)
        }
      } else {
        if (timer.current) {
          clearTimeout(timer.current)
          timer.current = null
        }
        setVisible(false)
      }
    })
    return () => {
      off()
      if (timer.current) clearTimeout(timer.current)
    }
  }, [delay])

  if (!visible) return null
  return (
    <div className="pointer-events-none fixed inset-0 z-[90] grid place-items-center">
      <div className="rounded-lg bg-[rgb(var(--bg))]/70 px-4 py-3 shadow-sm ring-1 ring-black/10 dark:ring-white/10">
        <div className="mx-auto h-5 w-5 rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent spinner" />
      </div>
    </div>
  )
}
