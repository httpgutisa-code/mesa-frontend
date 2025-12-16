import { useEffect, useState } from 'react'
import { getLoadingCount, onLoadingChange } from '../../utils/loadingBus'

export default function GlobalLoader() {
  const [count, setCount] = useState(() => getLoadingCount())
  useEffect(() => onLoadingChange(setCount), [])
  if (count <= 0) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[110]">
      <div className="h-1 w-full overflow-hidden bg-transparent">
        <div
          className="h-full w-full origin-left bg-[hsl(var(--primary))]"
          style={{ animation: 'loader 1.2s ease-in-out infinite' }}
        />
      </div>
      <div className="pointer-events-none fixed right-4 top-4 h-4 w-4 rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent spinner" />
      <style>{`
        @keyframes loader{0%{transform:scaleX(0)}50%{transform:scaleX(0.65)}100%{transform:scaleX(1)}}
      `}</style>
    </div>
  )
}
