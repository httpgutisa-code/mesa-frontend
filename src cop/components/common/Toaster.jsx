import { useEffect, useState } from 'react'
import toastBus, { subscribe } from '../../utils/toastBus'

export default function Toaster() {
  const [items, setItems] = useState([])
  useEffect(() => {
    return subscribe((t) => {
      setItems((prev) => [...prev, t])
      if (t.duration !== 0) {
        setTimeout(() => {
          setItems((prev) => prev.filter((x) => x.id !== t.id))
        }, t.duration || 3000)
      }
    })
  }, [])
  if (!items.length) return null
  return (
    <div className="pointer-events-none fixed right-4 top-16 z-[110] space-y-2">
      {items.map((t) => (
        <div
          key={t.id}
          className={[
            'pointer-events-auto min-w-[220px] max-w-sm rounded-md border px-3 py-2 text-sm shadow-sm',
            t.type === 'success' && 'border-green-600/20 bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-200',
            t.type === 'error' && 'border-red-600/20 bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200',
            t.type === 'info' && 'border-black/10 bg-white text-gray-800 dark:border-white/10 dark:bg-zinc-900 dark:text-gray-200',
          ].filter(Boolean).join(' ')}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}

export { toastBus as toast }
