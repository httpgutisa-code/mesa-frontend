import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

export default function Breadcrumbs({ items = [] }) {
  if (!items.length) return null
  
  return (
    <nav aria-label="Breadcrumb" className="overflow-x-auto scrollbar-hide">
      <ol className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm whitespace-nowrap pb-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5 sm:gap-2">
            {i > 0 && (
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 dark:text-gray-600 flex-shrink-0" />
            )}
            {item.to ? (
              <Link 
                to={item.to} 
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-surface-hover hover:text-[hsl(var(--primary))] text-gray-600 dark:text-gray-400 transition-all active:scale-95"
              >
                {i === 0 && <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                <span className={i === 0 ? 'hidden sm:inline' : ''}>{item.label}</span>
              </Link>
            ) : (
              <span className="px-2 py-1 font-semibold text-[rgb(var(--fg))] truncate max-w-[150px] sm:max-w-none">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
