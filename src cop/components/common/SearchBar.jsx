import { useState } from 'react'
import { Search, X } from 'lucide-react'

export default function SearchBar({ placeholder = 'Buscar…', onSearch }) {
  const [q, setQ] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    onSearch?.(q)
  }

  const clear = () => {
    setQ('')
    onSearch?.('')
  }

  return (
    <form onSubmit={submit} className="relative w-full group">
      <Search 
        className={`pointer-events-none absolute left-3 sm:left-3.5 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 transition-all duration-300 ${
          q ? 'opacity-0 scale-75' : (isFocused ? 'text-[hsl(var(--primary))] scale-110' : 'text-gray-400 dark:text-gray-500')
        }`} 
      />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className={`w-full rounded-full input transition-all duration-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm sm:text-base ${
          q ? 'pl-3 sm:pl-4' : 'pl-9 sm:pl-11'
        } pr-9 sm:pr-10 py-2 sm:py-2.5 ${
          isFocused 
            ? 'ring-2 ring-[hsl(var(--primary))]/20 border-[hsl(var(--primary))]/40 shadow-lg' 
            : 'shadow-sm hover:shadow-md hover:border-[hsl(var(--primary))]/20'
        }`}
      />
      {q && (
        <button
          type="button"
          onClick={clear}
          className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 sm:p-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 active:scale-95"
          aria-label="Limpiar búsqueda"
        >
          <X className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
        </button>
      )}
      {isFocused && (
        <div className="absolute inset-0 -z-10 rounded-full bg-[hsl(var(--primary))]/5 blur-xl transition-opacity duration-300" />
      )}
    </form>
  )
}
