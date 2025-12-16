export default function Textarea({ label, hint, error, className = '', ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-2 block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </span>
      )}
      <textarea
        className={[
          'input w-full resize-y py-3 sm:py-2.5 px-4 text-sm sm:text-base min-h-[100px]',
          error 
            ? 'border-red-500 ring-2 ring-red-100 dark:ring-red-900/50 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900/70' 
            : 'focus:border-[hsl(var(--primary))]/60 focus:ring-[hsl(var(--primary))]/20',
          className,
        ].join(' ')}
        {...props}
      />
      {hint && !error && (
        <span className="mt-1.5 block text-xs text-gray-500 dark:text-gray-400">
          {hint}
        </span>
      )}
      {error && (
        <span className="mt-1.5 flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-medium">
          <svg className="h-3.5 w-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </span>
      )}
    </label>
  )
}
