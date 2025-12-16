export default function Input({ label, hint, error, className = '', ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-2.5 block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          {label}
        </span>
      )}
      <input
        className={[
          'input w-full py-3.5 sm:py-3 px-4 text-base',
          error 
            ? 'border-red-500/60 ring-4 ring-red-100 dark:ring-red-900/30 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900/50 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' 
            : 'border-[rgb(var(--border-rgb))]/30 focus:border-[hsl(var(--primary))]/60 focus:ring-4 focus:ring-[hsl(var(--primary))]/10 focus:shadow-[0_0_0_3px_rgba(0,128,255,0.1)]',
          className,
        ].join(' ')}
        {...props}
      />
      {hint && !error && (
        <span className="mt-2 block text-xs text-gray-500 dark:text-gray-400 font-medium">
          {hint}
        </span>
      )}
      {error && (
        <span className="mt-2 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
          <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </span>
      )}
    </label>
  )
}
