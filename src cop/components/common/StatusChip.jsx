export default function StatusChip({ status }) {
  const paid = status === 'paid'
  
  // Estados premium con gradientes
  const cls = paid 
    ? 'bg-gradient-to-r from-[hsl(var(--success))]/20 to-[hsl(var(--success))]/10 text-[hsl(var(--success-strong))] border-[hsl(var(--success))]/30 dark:text-[hsl(var(--success))] shadow-[0_2px_8px_rgba(38,183,168,0.15)]' 
    : 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 border-amber-300 dark:from-amber-900/30 dark:to-amber-900/20 dark:text-amber-200 dark:border-amber-700/50 shadow-[0_2px_8px_rgba(251,191,36,0.15)]'
  
  const label = paid ? 'Pagado' : 'Pendiente'
  const icon = paid ? (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ) : (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
  
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-black shadow-sm border-2 ${cls}`}>
      {icon}
      {label}
    </span>
  )
}
