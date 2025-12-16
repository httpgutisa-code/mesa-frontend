export default function Pagination({ page = 1, total = 1, onPageChange }) {
  const prev = () => onPageChange?.(Math.max(1, page - 1))
  const next = () => onPageChange?.(Math.min(total, page + 1))

  return (
    <div className="mt-6 sm:mt-8 flex items-center justify-center gap-2 sm:gap-3">
      <button
        onClick={prev}
        disabled={page <= 1}
        className="rounded-lg border border-subtle px-4 py-2.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-hover active:scale-95 transition-all"
      >
        Anterior
      </button>
      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium px-2">Pág. {page} de {total}</span>
      <button
        onClick={next}
        disabled={page >= total}
        className="rounded-lg border border-subtle px-4 py-2.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-hover active:scale-95 transition-all"
      >
        Siguiente
      </button>
    </div>
  )
}
